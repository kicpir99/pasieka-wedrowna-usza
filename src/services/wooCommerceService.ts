import { HoneyProduct, HoneyCategory, ConsistencyType, FlavorIntensity, HoneySizeOption, CartItem } from '../types';
import { HONEY_PRODUCTS, HIVE_TREASURE_IDS } from '../data/honeyProducts';

/**
 * Konfiguracja integracji WooCommerce REST API.
 * Dane pobierane są ze zmiennych środowiskowych Vite (plik .env / .env.production).
 */
export const WOO_CONFIG = {
  url: (import.meta.env.VITE_WOOCOMMERCE_URL || '').replace(/\/$/, ''),
  consumerKey: import.meta.env.VITE_WOOCOMMERCE_KEY || '',
  consumerSecret: import.meta.env.VITE_WOOCOMMERCE_SECRET || '',
  get isConfigured(): boolean {
    return Boolean(this.url && this.consumerKey && this.consumerSecret);
  },
};

/**
 * Surowy typ produktu zwracany przez oficjalne WooCommerce REST API v3 (/wp-json/wc/v3/products)
 */
export interface WooProductRaw {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: string; // 'simple' | 'variable'
  status: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  average_rating: string;
  rating_count: number;
  categories: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; name: string; alt: string }[];
  attributes: {
    id: number;
    name: string;
    options: string[];
  }[];
  variations?: number[];
  meta_data: {
    id: number;
    key: string;
    value: any;
  }[];
}

/**
 * Pomocnicza funkcja do wyciągania wartości z tablicy meta_data (ACF / pola własne WordPress)
 */
const getMetaValue = (metaList: WooProductRaw['meta_data'], key: string, fallback: any = ''): any => {
  const found = metaList.find(m => m.key === key || m.key === `_${key}`);
  return found !== undefined && found.value !== null && found.value !== '' ? found.value : fallback;
};

/**
 * Mapuje kategorię z WooCommerce (slug) na nasz typ HoneyCategory
 */
const mapCategory = (cats: WooProductRaw['categories']): HoneyCategory => {
  const slugs = cats.map(c => c.slug.toLowerCase());
  if (slugs.includes('wiosenne') || slugs.includes('wiosenny')) return 'wiosenne';
  if (slugs.includes('letnie') || slugs.includes('letni')) return 'letnie';
  if (slugs.includes('lesne-spadz') || slugs.includes('lesne') || slugs.includes('spadziowe') || slugs.includes('spadz')) return 'lesne-spadz';
  if (slugs.includes('z-dodatkami') || slugs.includes('skarby-ula') || slugs.includes('apiterapia')) return 'z-dodatkami';
  if (slugs.includes('zestawy') || slugs.includes('swiece') || slugs.includes('manufaktura')) return 'zestawy';
  return 'letnie';
};

/**
 * Przekształca atrybuty i warianty WooCommerce na tablicę opcji wagowych i cen
 */
const mapSizes = (woo: WooProductRaw): HoneySizeOption[] => {
  const parsedPrice = parseFloat(woo.price || woo.regular_price || '');
  const basePrice = !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : 40;

  // Sprawdzamy czy produkt ma atrybut "Gramatura" lub "Waga"
  const gramAttribute = woo.attributes.find(
    a => a.name.toLowerCase().includes('gram') || a.name.toLowerCase().includes('waga') || a.name.toLowerCase().includes('rozmiar')
  );

  if (gramAttribute && gramAttribute.options.length > 0) {
    return gramAttribute.options.map(opt => {
      const match = opt.match(/(\d+)/);
      const grams = match ? parseInt(match[1], 10) : 400;
      // Jeśli opcja ma postać "1200g - 75 zł" lub podobną:
      const priceMatch = opt.match(/(\d+)\s*(?:zł|pln)/i);
      const price = priceMatch ? parseInt(priceMatch[1], 10) : (grams >= 900 ? basePrice * 2 : basePrice);

      return {
        weightGrams: grams,
        label: opt,
        pricePln: price,
        inStock: true,
      };
    });
  }

  // Domyślny fallback: standardowe słoiki dla miodu lub stała wielkość
  return [
    { weightGrams: 400, label: '400 g', pricePln: basePrice, inStock: true },
    { weightGrams: 1200, label: '1200 g', pricePln: Math.round(basePrice * 1.9), inStock: true },
  ];
};

/**
 * Konwertuje obiekt produktu z WooCommerce REST API na nasz wewnętrzny interfejs HoneyProduct.
 * Dzięki temu cały dotychczasowy frontend działa w 100% bez zmian!
 */
export const mapWooProductToHoneyProduct = (woo: WooProductRaw): HoneyProduct => {
  const meta = woo.meta_data || [];
  const primaryImg = woo.images?.[0]?.src || 'https://pasiekausza.pl/wp-content/uploads/2022/02/miod-wielokwaitowy-650x650.jpg';
  const allImgs = woo.images?.length > 0 ? woo.images.map(img => img.src) : [primaryImg];

  // Pobieranie nut smakowych z ACF lub atrybutów
  const rawFlavorNotes = getMetaValue(meta, 'flavor_notes', null);
  let flavorNotes: string[] = [];
  if (Array.isArray(rawFlavorNotes)) {
    flavorNotes = rawFlavorNotes;
  } else if (typeof rawFlavorNotes === 'string' && rawFlavorNotes.trim()) {
    flavorNotes = rawFlavorNotes.split(',').map(s => s.trim());
  } else {
    flavorNotes = ['Kwiaty polne', 'Aksamitny nektar'];
  }

  // Pobieranie rekomendacji użycia
  const rawUses = getMetaValue(meta, 'recommended_use', null);
  let recommendedUse: string[] = [];
  if (Array.isArray(rawUses)) {
    recommendedUse = rawUses;
  } else if (typeof rawUses === 'string' && rawUses.trim()) {
    recommendedUse = rawUses.split(',').map(s => s.trim());
  } else {
    recommendedUse = ['Codzienna odporność', 'Do herbaty i naparów'];
  }

  const category = mapCategory(woo.categories || []);
  const sizes = mapSizes(woo);

  // Czyścimy opisy ze znaczników HTML, jeśli występują
  const cleanDescription = (woo.description || woo.short_description || '')
    .replace(/<[^>]*>/g, '')
    .trim();

  return {
    id: woo.slug || String(woo.id),
    wooId: woo.id,
    name: woo.name,
    botanicalName: getMetaValue(meta, 'botanical_name', getMetaValue(meta, 'botanicalSource', woo.name)),
    subtitle: woo.short_description ? woo.short_description.replace(/<[^>]*>/g, '').trim() : getMetaValue(meta, 'subtitle', 'Surowy miód prosto z pasieki wędrownej.'),
    category,
    description: cleanDescription || 'Naturalny, surowy miód z dolnośląskiej pasieki wędrownej.',
    harvestYear: parseInt(getMetaValue(meta, 'harvest_year', '2026'), 10),
    harvestMonth: getMetaValue(meta, 'harvest_month', 'Czerwiec'),
    batchNumber: getMetaValue(meta, 'batch_number', `USZ-${woo.id}`),
    apiaryLocation: getMetaValue(meta, 'apiary_location', 'Pasieka Wędrowna • Dolny Śląsk'),
    dominantPollenPercentage: parseInt(getMetaValue(meta, 'dominant_pollen_percentage', '75'), 10),
    dominantPlant: getMetaValue(meta, 'dominant_plant', woo.name.replace(/^miód\s+/i, '')),
    waterContentPercentage: parseFloat(getMetaValue(meta, 'water_content_percentage', '17.2')),
    consistency: (getMetaValue(meta, 'consistency', 'patoka') as ConsistencyType),
    flavorIntensity: (getMetaValue(meta, 'flavor_intensity', 'wyrazisty') as FlavorIntensity),
    flavorNotes,
    recommendedUse,
    sensoryProfile: {
      sweetness: parseInt(getMetaValue(meta, 'sensory_sweetness', '4'), 10),
      acidity: parseInt(getMetaValue(meta, 'sensory_acidity', '2'), 10),
      intensity: parseInt(getMetaValue(meta, 'sensory_intensity', '4'), 10),
      crystallization: parseInt(getMetaValue(meta, 'sensory_crystallization', '3'), 10),
    },
    colorHex: getMetaValue(meta, 'color_hex', '#D4A324'),
    colorName: getMetaValue(meta, 'color_name', 'Złocisto-bursztynowy'),
    sizes,
    imageUrl: primaryImg,
    images: allImgs,
    rating: parseFloat(woo.average_rating || '5.0') || 5.0,
    reviewsCount: woo.rating_count || 120,
    isBestseller: Boolean(getMetaValue(meta, 'is_bestseller', false)),
    isNewHarvest: Boolean(getMetaValue(meta, 'is_new_harvest', true)),
    isLimitedBatch: Boolean(getMetaValue(meta, 'is_limited_batch', false)),
  };
};

/**
 * Główna funkcja pobierająca produkty z WooCommerce z automatycznym fallbackiem.
 * Jeśli WooCommerce nie jest skonfigurowany w .env lub serwer nie odpowiada,
 * natychmiast zwracana jest lokalna baza HONEY_PRODUCTS.
 */
export async function fetchWooCommerceProducts(): Promise<{
  products: HoneyProduct[];
  isLiveWooCommerce: boolean;
  error?: string;
}> {
  if (!WOO_CONFIG.isConfigured) {
    console.info('ℹ️ [WooCommerce Service] Brak konfiguracji VITE_WOOCOMMERCE_URL / KEY. Używam bazy lokalnej (Fallback Mode).');
    return {
      products: HONEY_PRODUCTS,
      isLiveWooCommerce: false,
    };
  }

  try {
    const authHeader = 'Basic ' + btoa(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`);
    const endpoint = `${WOO_CONFIG.url}/wp-json/wc/v3/products?per_page=100&status=publish`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Błąd WooCommerce API: HTTP ${response.status} ${response.statusText}`);
    }

    const rawList: WooProductRaw[] = await response.json();
    if (!Array.isArray(rawList) || rawList.length === 0) {
      console.warn('⚠️ [WooCommerce Service] WooCommerce zwrócił pustą listę produktów. Używam bazy lokalnej.');
      return { products: HONEY_PRODUCTS, isLiveWooCommerce: false };
    }

    const mapped = rawList.map(mapWooProductToHoneyProduct);

    // Inteligentne łączenie: produkty z WooCommerce nadpisują pozycje w katalogu,
    // a pozostałe produkty lokalne są zachowane, dopóki klient nie doda wszystkich w WordPressie.
    const mergedMap = new Map<string, HoneyProduct>();
    HONEY_PRODUCTS.forEach(p => mergedMap.set(p.id, p));
    mapped.forEach(p => mergedMap.set(p.id, p));
    const mergedProducts = Array.from(mergedMap.values());

    console.info(`✅ [WooCommerce Service] Pomyślnie pobrano ${mapped.length} produktów na żywo z WordPress/WooCommerce!`);

    return {
      products: mergedProducts,
      isLiveWooCommerce: true,
    };
  } catch (err: any) {
    console.error('❌ [WooCommerce Service] Błąd podczas łączenia z WooCommerce REST API:', err.message);
    return {
      products: HONEY_PRODUCTS,
      isLiveWooCommerce: false,
      error: err.message,
    };
  }
}

/**
 * Generuje link bezpośredniego przejścia do kasy WooCommerce (/zamowienie lub /koszyk)
 * wraz z parametrami dodania zawartości koszyka.
 */
export function getWooCommerceCheckoutUrl(items: CartItem[]): string {
  if (!WOO_CONFIG.url) {
    return '/zamowienie';
  }

  // Wyciągamy ID produktów z WooCommerce
  const validItems = items
    .map(i => ({
      id: i.product.wooId || (i.product.id === 'miod-akacjowy' ? 37 : null),
      qty: i.quantity || 1,
    }))
    .filter((i): i is { id: number; qty: number } => i.id !== null);

  if (validItems.length === 1) {
    return `${WOO_CONFIG.url}/zamowienie/?add-to-cart=${validItems[0].id}&quantity=${validItems[0].qty}`;
  }

  if (validItems.length > 1) {
    const query = validItems.map(i => `${i.id}:${i.qty}`).join(',');
    return `${WOO_CONFIG.url}/zamowienie/?add-to-cart=${query}`;
  }

  return `${WOO_CONFIG.url}/zamowienie/`;
}
