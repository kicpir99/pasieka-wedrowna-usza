import { HONEY_PRODUCTS } from '../src/data/honeyProducts.ts';

const WOO_URL = 'https://sklep.pasiekausza.pl';
const WOO_KEY = 'ck_0f255ea2edcfdefd8b92d38745d26eb748ff9930';
const WOO_SECRET = 'cs_eac4c5ca089a58778f969d8756f0b4eba99d5c4c';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const auth = Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Basic ${auth}`,
  'User-Agent': 'PasiekaUsza-Sync/1.0'
};

async function api(endpoint, method = 'GET', data = null) {
  const url = `${WOO_URL}/wp-json/wc/v3/${endpoint}`;
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status} on ${endpoint}: ${errText}`);
  }
  return res.json();
}

async function run() {
  console.log('--- Rozpoczynam synchronizację produktów do WooCommerce ---');
  
  // 1. Pobierz istniejące kategorie
  const existingCats = await api('products/categories?per_page=100');
  const catMap = new Map();
  existingCats.forEach(c => catMap.set(c.slug, c.id));

  const targetCats = [
    { name: 'Miody Wiosenne', slug: 'wiosenne' },
    { name: 'Miody Letnie', slug: 'letnie' },
    { name: 'Miody Leśne i Spadziowe', slug: 'lesne-spadz' },
    { name: 'Skarby Ula i Produkty Pszczele', slug: 'z-dodatkami' },
    { name: 'Zestawy i Akcesoria', slug: 'zestawy' },
  ];

  for (const tc of targetCats) {
    if (!catMap.has(tc.slug)) {
      console.log(`Tworzę kategorię: ${tc.name} (${tc.slug})...`);
      const created = await api('products/categories', 'POST', tc);
      catMap.set(tc.slug, created.id);
    }
  }

  // 2. Pobierz istniejące produkty w WooCommerce
  const existingProducts = await api('products?per_page=100');
  const existingSlugs = new Set(existingProducts.map(p => p.slug));
  console.log(`W sklepie istnieje obecnie ${existingProducts.length} produktów:`, [...existingSlugs]);

  // 3. Dodaj brakujące produkty z HONEY_PRODUCTS
  let createdCount = 0;
  for (const product of HONEY_PRODUCTS) {
    if (existingSlugs.has(product.id)) {
      console.log(`✓ Produkt "${product.name}" (${product.id}) już istnieje w WooCommerce. Pomijam.`);
      continue;
    }

    console.log(`\nDodaję produkt: "${product.name}" (${product.id})...`);
    const categoryId = catMap.get(product.category) || 15;
    const basePrice = product.sizes?.[0]?.pricePln || 40;

    const payload = {
      name: product.name,
      slug: product.id,
      type: 'simple',
      status: 'publish',
      regular_price: String(basePrice),
      description: product.description || '',
      short_description: product.subtitle || '',
      manage_stock: false,
      stock_status: 'instock',
      categories: [{ id: categoryId }],
      meta_data: [
        { key: 'botanical_name', value: product.botanicalName || '' },
        { key: 'harvest_year', value: String(product.harvestYear || 2026) },
        { key: 'harvest_month', value: product.harvestMonth || '' },
        { key: 'batch_number', value: product.batchNumber || '' },
        { key: 'apiary_location', value: product.apiaryLocation || 'Pasieka Wędrowna • Dolny Śląsk' },
        { key: 'dominant_plant', value: product.dominantPlant || '' },
        { key: 'dominant_pollen_percentage', value: String(product.dominantPollenPercentage || 0) },
        { key: 'water_content_percentage', value: String(product.waterContentPercentage || 0) },
        { key: 'consistency', value: product.consistency || 'patoka' },
        { key: 'flavor_intensity', value: product.flavorIntensity || 'lagodny' },
        { key: 'flavor_notes', value: (product.flavorNotes || []).join(', ') },
        { key: 'recommended_use', value: (product.recommendedUse || []).join(', ') },
        { key: 'sensory_sweetness', value: String(product.sensoryProfile?.sweetness || 3) },
        { key: 'sensory_acidity', value: String(product.sensoryProfile?.acidity || 2) },
        { key: 'sensory_intensity', value: String(product.sensoryProfile?.intensity || 3) },
        { key: 'sensory_crystallization', value: String(product.sensoryProfile?.crystallization || 2) },
        { key: 'color_name', value: product.colorName || '' },
        { key: 'color_hex', value: product.colorHex || '#E5983A' },
        { key: 'woo_inpost_parcel_dimensions', value: 'small' }
      ]
    };

    // Jeśli ma grafikę, spróbuj ją przekazać
    if (product.imageUrl) {
      payload.images = [{ src: product.imageUrl }];
    }

    try {
      const created = await api('products', 'POST', payload);
      console.log(`✅ Utworzono pomyślnie! WooCommerce ID: ${created.id} | Nazwa: ${created.name}`);
      createdCount++;
    } catch (err) {
      console.warn(`Ostrzeżenie przy dodawaniu z obrazkiem: ${err.message}. Próbuję bez obrazka...`);
      delete payload.images;
      const created = await api('products', 'POST', payload);
      console.log(`✅ Utworzono pomyślnie (bez obrazka)! WooCommerce ID: ${created.id} | Nazwa: ${created.name}`);
      createdCount++;
    }
  }

  console.log(`\n🎉 Gotowe! Pomyślnie zsynchronizowano ${createdCount} nowych produktów do WooCommerce!`);
}

run().catch(console.error);
