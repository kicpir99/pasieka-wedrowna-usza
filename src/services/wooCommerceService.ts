import { HoneyProduct, HoneyCategory, ConsistencyType, FlavorIntensity, HoneySizeOption, CartItem } from '../types';
import { HONEY_PRODUCTS, HIVE_TREASURE_IDS } from '../data/honeyProducts';

/**
 * Konfiguracja integracji WooCommerce REST API.
 * Dane pobierane są ze zmiennych środowiskowych Vite (plik .env / .env.production).
 */
export const WOO_CONFIG = {
  url: (import.meta.env.VITE_WOOCOMMERCE_URL || 'https://sklep.pasiekausza.pl').replace(/\/$/, ''),
  consumerKey: import.meta.env.VITE_WOOCOMMERCE_KEY || 'ck_0f255ea2edcfdefd8b92d38745d26eb748ff9930',
  consumerSecret: import.meta.env.VITE_WOOCOMMERCE_SECRET || 'cs_eac4c5ca089a58778f969d8756f0b4eba99d5c4c',
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
    harvestYear: parseInt(getMetaValue(meta, 'harvest_year', '2026'), 10) || 2026,
    harvestMonth: getMetaValue(meta, 'harvest_month', 'Czerwiec'),
    batchNumber: getMetaValue(meta, 'batch_number', `USZ-${woo.id}`),
    apiaryLocation: getMetaValue(meta, 'apiary_location', 'Pasieka Wędrowna • Dolny Śląsk'),
    dominantPollenPercentage: Number(getMetaValue(meta, 'dominant_pollen_percentage', '0')) || 0,
    dominantPlant: getMetaValue(meta, 'dominant_plant', woo.name.replace(/^miód\s+/i, '')),
    waterContentPercentage: Number(getMetaValue(meta, 'water_content_percentage', '0')) || 0,
    consistency: (getMetaValue(meta, 'consistency', 'patoka') as ConsistencyType),
    flavorIntensity: (getMetaValue(meta, 'flavor_intensity', 'wyrazisty') as FlavorIntensity),
    flavorNotes,
    recommendedUse,
    sensoryProfile: {
      sweetness: Number(getMetaValue(meta, 'sensory_sweetness', '0')) || 0,
      acidity: Number(getMetaValue(meta, 'sensory_acidity', '0')) || 0,
      intensity: Number(getMetaValue(meta, 'sensory_intensity', '0')) || 0,
      crystallization: Number(getMetaValue(meta, 'sensory_crystallization', '0')) || 0,
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

    // Pola ACF / dodatkowe metadane produktu z WordPress
    healthBenefits: (() => {
      const val = getMetaValue(meta, 'health_benefits', getMetaValue(meta, 'wlasciwosci_zdrowotne', null));
      if (Array.isArray(val)) return val;
      if (typeof val === 'string' && val.trim()) return val.split('\n').map(s => s.trim()).filter(Boolean);
      return undefined;
    })(),
    pairing: getMetaValue(meta, 'pairing', getMetaValue(meta, 'jak_stosowac', undefined)),
    detailedUsage: {
      recommendedDose: getMetaValue(meta, 'recommended_dose', '1-2 łyżeczki dziennie rano na czczo'),
      culinaryIdeas: (() => {
        const val = getMetaValue(meta, 'culinary_ideas', null);
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim()) return val.split('\n').map(s => s.trim()).filter(Boolean);
        return undefined;
      })(),
    },
    labAnalysis: {
      lotNumber: getMetaValue(meta, 'batch_number', `USZ-${woo.id}`),
      waterContent: `${getMetaValue(meta, 'water_content_percentage', '17.2')}%`,
      diastaseNumber: getMetaValue(meta, 'diastase_number', '18.2 DN'),
      hmf: getMetaValue(meta, 'hmf_number', '< 10 mg/kg'),
      conductivity: getMetaValue(meta, 'conductivity', '0.45 mS/cm'),
    },
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

export interface CreateOrderParams {
  items: CartItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street?: string;
    city?: string;
    postcode?: string;
    isCompany?: boolean;
    nip?: string;
    companyName?: string;
    companyStreet?: string;
    companyPostcode?: string;
    companyCity?: string;
    notes?: string;
  };
  delivery: {
    method: 'paczkomat' | 'kurier' | 'odbior';
    methodTitle: string;
    cost: number;
    parcelLockerCode?: string;
    parcelLockerAddress?: string;
  };
  paymentMethod: 'blik' | 'p24' | 'cod' | 'bacs';
  paymentTitle: string;
}

// Mapa synchronizacji identyfikatorów produktów z WooCommerce REST API
export const WOO_PRODUCT_IDS_MAP: Record<string, number> = {
  'miod-akacjowy': 37,
  'miod-lipowy': 50,
  'miod-wrzosowy': 52,
  'miod-ze-spadzi-iglastej': 54,
  'miod-wielokwiatowy': 56,
  'miod-gryczany': 58,
  'miod-rzepakowy': 60,
  'miod-mniszkowy': 62,
  'miod-lesny': 64,
  'miod-malinowy': 66,
  'miod-nawlociowy': 68,
  'miod-faceliowy': 70,
  'pierzga-pszczela': 72,
  'propolis-kit': 74,
  'pylek-pszczeli': 76,
  'swieca-wosk-pszczeli': 78,
  'odklad-szkolenie-pszczele': 80,
};

export async function createWooCommerceOrder(params: CreateOrderParams): Promise<{
  success: boolean;
  orderId?: number;
  paymentUrl?: string;
  error?: string;
}> {
  if (!WOO_CONFIG.url || !WOO_CONFIG.consumerKey || !WOO_CONFIG.consumerSecret) {
    // Tryb demonstracyjny bez API
    return {
      success: true,
      orderId: Math.floor(1000 + Math.random() * 9000),
    };
  }

  try {
    const authHeader = 'Basic ' + btoa(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`);
    const methodId =
      params.paymentMethod === 'cod'
        ? 'cod'
        : params.paymentMethod === 'bacs'
        ? 'bacs'
        : 'p24-online-payments';

    const orderData = {
      payment_method: methodId,
      payment_method_title: params.paymentTitle,
      set_paid: false,
      billing: {
        first_name: params.customer.firstName,
        last_name: params.customer.lastName,
        company: params.customer.isCompany ? params.customer.companyName || '' : '',
        address_1: params.customer.isCompany
          ? params.customer.companyStreet || params.customer.street || 'Adres firmy'
          : params.delivery.method === 'kurier'
          ? params.customer.street || 'Adres dostawy'
          : params.delivery.parcelLockerAddress || 'Paczkomat InPost',
        city: params.customer.isCompany
          ? params.customer.companyCity || params.customer.city || 'Polska'
          : params.delivery.method === 'kurier'
          ? params.customer.city || 'Polska'
          : 'Polska',
        postcode: params.customer.isCompany
          ? params.customer.companyPostcode || params.customer.postcode || '00-000'
          : params.delivery.method === 'kurier'
          ? params.customer.postcode || '00-000'
          : '00-000',
        country: 'PL',
        email: params.customer.email,
        phone: params.customer.phone,
      },
      shipping: {
        first_name: params.customer.firstName,
        last_name: params.customer.lastName,
        address_1:
          params.delivery.method === 'kurier'
            ? params.customer.street || 'Adres dostawy'
            : params.delivery.parcelLockerAddress || 'Paczkomat InPost',
        city: params.delivery.method === 'kurier' ? params.customer.city || 'Polska' : 'Polska',
        postcode: params.delivery.method === 'kurier' ? params.customer.postcode || '00-000' : '00-000',
        country: 'PL',
      },
      meta_data: [
        { key: '_billing_nip', value: params.customer.nip || '' },
        { key: 'billing_nip', value: params.customer.nip || '' },
        { key: 'vat_number', value: params.customer.nip || '' },
        { key: '_vat_number', value: params.customer.nip || '' },
        { key: 'Faktura VAT', value: params.customer.isCompany ? `TAK (NIP: ${params.customer.nip})` : 'NIE' },
      ],
      line_items: params.items.map(item => {
        const wooProductId = item.product.wooId || WOO_PRODUCT_IDS_MAP[item.product.id] || 37;
        return {
          product_id: wooProductId,
          quantity: item.quantity,
          meta_data: [
            { key: 'Waga/Wariant', value: `${item.weightGrams || item.selectedWeightGrams || 400}g` },
            { key: 'Produkt', value: item.product.name },
          ],
        };
      }),
      shipping_lines: [
        {
          method_id: params.delivery.method,
          method_title: params.delivery.methodTitle,
          total: String(params.delivery.cost),
        },
      ],
      customer_note: [
        params.customer.notes || '',
        params.delivery.method === 'paczkomat'
          ? `Paczkomat: ${params.delivery.parcelLockerCode || ''} (${params.delivery.parcelLockerAddress || ''})`
          : '',
      ]
        .filter(Boolean)
        .join(' | '),
    };

    const response = await fetch(`${WOO_CONFIG.url}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || `Błąd serwera: HTTP ${response.status}`);
    }

    const createdOrder = await response.json();
    return {
      success: true,
      orderId: createdOrder.id,
      paymentUrl: createdOrder.payment_url || undefined,
    };
  } catch (err: any) {
    console.error('❌ [createWooCommerceOrder] Błąd tworzenia zamówienia:', err);
    return {
      success: false,
      error: err.message || 'Wystąpił nieoczekiwany błąd przy tworzeniu zamówienia.',
    };
  }
}

