import { HoneyProduct, HoneySizeOption } from '../types';
import { HONEY_PRODUCTS, HIVE_TREASURE_IDS } from '../data/honeyProducts';

export type HealthIntent = 'odpornosc' | 'lagodne' | 'koneser' | 'prezent';

export type ProductType = 'honey' | 'bee-colony' | 'candle' | 'apitherapy';

export function getProductType(id: string): ProductType {
  if (id === 'odklad-szkolenie-pszczele') return 'bee-colony';
  if (id === 'swieca-wosk-pszczeli') return 'candle';
  if (['pierzga-pszczela', 'propolis-kit', 'pylek-pszczeli'].includes(id)) return 'apitherapy';
  return 'honey';
}

export interface ConsistencyInfo {
  state: 'patoka' | 'kremowany' | 'krupiec';
  label: string;
  badgeClass: string;
  shortExplanation: string;
  crystallizationSpeed: string;
  hasGlucoseBloom: boolean;
  glucoseBloomInfo?: string;
  storageTips: string;
}

export type BadgeVariant = 'bestseller' | 'recommended' | 'limited' | 'harvest';

export interface ProductBadgeInfo {
  type: BadgeVariant;
  label: string;
  sublabel: string;
  tooltip: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  iconType: 'flame' | 'sparkles' | 'clock' | 'leaf';
}

/**
 * Dynamiczny ranking relatywny (Top N / Percentylowy):
 * Zapobiega zjawisku „inflacji etykiet” w czasie. Zamiast sztywnych progów liczbowych,
 * Bestseller przysługuje ZAWSZE wyłącznie ścisłej czołówce sprzedaży (Top 25% katalogu, max 3 miody),
 * a "Polecamy" wyłącznie wyselekcjonowanej grupie najwyżej ocenianych miodów (ocena 4.9+).
 * Nawet jeśli za rok wszystkie miody będą miały po 1000 opinii, plakietki zachowają stałą, elitarną proporcję!
 */
function computeBadgeSets(catalog: HoneyProduct[]) {
  const honeys = catalog.filter(p => !HIVE_TREASURE_IDS.includes(p.id));
  const treasures = catalog.filter(p => HIVE_TREASURE_IDS.includes(p.id));

  // 1. Bestsellery: Relatywne Top 25% (dokładnie 3 pozycje dla 12 miodów, 2 dla skarbów ula)
  const maxHoneyBestsellers = Math.max(1, Math.min(3, Math.ceil(honeys.length * 0.25)));
  const sortedHoneysBySales = [...honeys].sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
  const honeyBestsellerIds = new Set(sortedHoneysBySales.slice(0, maxHoneyBestsellers).map(p => p.id));

  const maxTreasureBestsellers = Math.max(1, Math.min(2, Math.ceil(treasures.length * 0.4)));
  const sortedTreasuresBySales = [...treasures].sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
  const treasureBestsellerIds = new Set(sortedTreasuresBySales.slice(0, maxTreasureBestsellers).map(p => p.id));

  const bestsellerIds = new Set([...honeyBestsellerIds, ...treasureBestsellerIds]);

  // 2. Polecamy: Najwyżej oceniane produkty spoza grupy bestsellerów (rating >= 4.9)
  const sortedHoneysByQuality = [...honeys]
    .filter(p => !honeyBestsellerIds.has(p.id) && (p.rating ?? 0) >= 4.9)
    .sort((a, b) => ((b.rating ?? 0) - (a.rating ?? 0)) || ((b.reviewsCount ?? 0) - (a.reviewsCount ?? 0)));
  const honeyRecommendedIds = new Set(sortedHoneysByQuality.slice(0, 4).map(p => p.id));

  const sortedTreasuresByQuality = [...treasures]
    .filter(p => !treasureBestsellerIds.has(p.id) && (p.rating ?? 0) >= 4.9)
    .sort((a, b) => ((b.rating ?? 0) - (a.rating ?? 0)) || ((b.reviewsCount ?? 0) - (a.reviewsCount ?? 0)));
  const treasureRecommendedIds = new Set(sortedTreasuresByQuality.slice(0, 1).map(p => p.id));

  const recommendedIds = new Set([...honeyRecommendedIds, ...treasureRecommendedIds]);

  return { bestsellerIds, recommendedIds };
}

let cachedDefaultBadgeSets: { bestsellerIds: Set<string>; recommendedIds: Set<string> } | null = null;

export function getCatalogBadgeSets(catalog?: HoneyProduct[]) {
  if (!Array.isArray(catalog) || catalog === HONEY_PRODUCTS) {
    if (!cachedDefaultBadgeSets) {
      cachedDefaultBadgeSets = computeBadgeSets(HONEY_PRODUCTS);
    }
    return cachedDefaultBadgeSets;
  }
  return computeBadgeSets(catalog);
}

/**
 * Dynamiczna weryfikacja statusu Bestsellera względem całego katalogu.
 */
export function isProductBestseller(product: HoneyProduct, catalog?: HoneyProduct[]): boolean {
  if (!product) return false;
  const { bestsellerIds } = getCatalogBadgeSets(Array.isArray(catalog) ? catalog : undefined);
  return bestsellerIds.has(product.id);
}

/**
 * Dynamiczna weryfikacja statusu "Polecamy" względem całego katalogu.
 */
export function isProductRecommended(product: HoneyProduct, catalog?: HoneyProduct[]): boolean {
  if (!product) return false;
  const { recommendedIds } = getCatalogBadgeSets(Array.isArray(catalog) ? catalog : undefined);
  return recommendedIds.has(product.id);
}

/**
 * Zwraca hierarchiczną listę plakietek dla danego produktu na podstawie dynamicznego rankingu:
 * 1. Główna plakietka wyróżnienia (Bestseller vs Polecamy)
 * 2. Druga plakietka (Krótka partia / Zbiór 2026)
 * Ograniczone do max 2 plakietek, by zachować czysty, estetyczny wygląd karty.
 */
export function getProductBadges(product: HoneyProduct, catalog?: HoneyProduct[]): ProductBadgeInfo[] {
  const badges: ProductBadgeInfo[] = [];
  const { bestsellerIds, recommendedIds } = getCatalogBadgeSets(catalog);

  // 1. Wyróżnienie główne
  if (bestsellerIds.has(product.id)) {
    badges.push({
      type: 'bestseller',
      label: 'Bestseller',
      sublabel: 'Najczęściej kupowany',
      tooltip: 'Ścisła czołówka zamówień w naszej pasiece (Top sprzedaży)',
      bgClass: 'bg-[#D9821E]',
      textClass: 'text-white',
      borderClass: 'border-[#B86B14]',
      iconType: 'flame',
    });
  } else if (recommendedIds.has(product.id)) {
    badges.push({
      type: 'recommended',
      label: 'Polecamy',
      sublabel: 'Wybór Pasieki',
      tooltip: 'Rekomendacja mistrza pasieki – najwyższa ocena jakości (4.9+)',
      bgClass: 'bg-[#1B4332]',
      textClass: 'text-white',
      borderClass: 'border-[#143427]',
      iconType: 'sparkles',
    });
  }

  // 2. Wyróżnienie cechy partii / zbioru
  if (product.isLimitedBatch) {
    badges.push({
      type: 'limited',
      label: 'Krótka partia',
      sublabel: 'Limitowany zbiór',
      tooltip: 'Unikalny pożytek z ograniczonych terenów – dostępny w ściśle limitowanym nakładzie słoików',
      bgClass: 'bg-[#3A332A]',
      textClass: 'text-white',
      borderClass: 'border-[#27221B]',
      iconType: 'clock',
    });
  } else if (product.isNewHarvest) {
    badges.push({
      type: 'harvest',
      label: `Zbiór ${product.harvestYear || 2026}`,
      sublabel: 'Świeży pożytek',
      tooltip: `Świeży miód z sezonu miodobrania ${product.harvestYear || 2026}`,
      bgClass: 'bg-[#445E3B]',
      textClass: 'text-white',
      borderClass: 'border-[#304429]',
      iconType: 'leaf',
    });
  }

  return badges;
}

export interface EnrichedProductData {
  productType: ProductType;
  tagline: string;
  botanicalSource: string;
  region: string;
  badge?: string;
  badgeClass?: string;
  badges: ProductBadgeInfo[];
  images: string[];
  tasteProfile: {
    sweetness: number;
    acidity: number;
    aroma: number;
    crystallization: string;
    color: string;
  };
  healthBenefits: string[];
  pairing: string;
  detailedUsage: {
    recommendedDose: string;
    culinaryIdeas: string[];
  };
  labAnalysis: {
    lotNumber: string;
    waterContent: string;
    diastaseNumber: string;
    hmf: string;
    conductivity?: string;
  };
  prices: Record<string, number>;
  sizesList: { gram: string; weightGrams: number; price: number; inStock: boolean }[];
  advisorVerdict: string;
  masterTip: string;
  consistencyInfo: ConsistencyInfo;
  healthIntents: HealthIntent[];
}

// Mapowanie dodatkowych galerii zdjęć wg kategorii / typu miodu
const GALLERY_MAP: Record<string, string[]> = {
  'lipowy-warminski': [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=85',
  ],
  'spadziowy-iglasty': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=85',
  ],
  'gryczany-ostry': [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Buchweizenhonig.jpg/1280px-Buchweizenhonig.jpg',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=85',
  ],
};

const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=85',
];

export function getEnrichedProduct(product: HoneyProduct): HoneyProduct & EnrichedProductData {
  const badges = getProductBadges(product);
  const primaryBadge = badges[0];
  const badge = primaryBadge?.label;
  const badgeClass = primaryBadge?.bgClass ? `${primaryBadge.bgClass} text-white` : undefined;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : (GALLERY_MAP[product.id] || [
        product.imageUrl,
        ...DEFAULT_GALLERY.filter(img => img !== product.imageUrl).slice(0, 3),
      ]);

  // Mapowanie właściwości zdrowotnych wg specyfiki produktu
  const prodType = getProductType(product.id);
  let healthBenefits: string[] = [];
  let advisorVerdict = '';
  let masterTip = '';
  let culinaryPairing = '';
  let culinaryIdeas: string[] = [];
  let recommendedDose = '1-2 łyżeczki rano na czczo w letniej wodzie (do 40°C) z dodatkiem cytryny.';

  if (prodType === 'bee-colony') {
    healthBenefits = [
      'Wybitna łagodność (linie Krainka / Buckfast) – spokojne trzymanie się plastrów i bezpieczna praca bez uciążliwego żądlenia',
      'Młoda matka 2026 ze sprawdzonym czerwieniem – wysoka plenność i zwarty czerw kryty od listewki do listewki',
      'Dynamiczny rozwój wiosenny – rodzina błyskawicznie buduje węzę i dochodzi do pełnej siły produkcyjnej',
      'Silny instynkt higieniczny rodziny – wysoka odporność na choroby czerwiu i doskonałe przystosowanie do warunków Dolnego Śląska',
      'Pszczoły o niskiej skłonności do rojenia – ukierunkowane na intensywny zbiór pożytków nektarowych i spadziowych',
    ];
    advisorVerdict = 'Wybierz Odkład Pszczeli ze Szkoleniem, jeśli planujesz bezpieczny i profesjonalny start własnej pasieki pod okiem mistrza pszczelarskiego, z gwarancją zdrowego materiału biologicznego pod nadzorem weterynaryjnym PIW.';
    masterTip = 'Pszczoły odbieraj wcześnie rano lub po zmroku; po przywiezieniu na miejsce postaw transportówkę na docelowym ulu i odczekaj 30 minut przed przesiedleniem ramek.';
    culinaryPairing = 'Odbiór osobisty w pasiece Ciechów w czerwcu/lipcu 2026. Wentylacja i bezpieczny transport zapewnione.';
    recommendedDose = 'Odbiór wcześnie rano lub po zmroku. Bezpośrednie przesiedlenie do ula wielkopolskiego i podkarmianie syropem 1:1 lub ciastem na rozwój.';
    culinaryIdeas = [
      'Odbiór osobisty w pasiece Ciechów: wspólne otwarcie ula, ocena czerwiu krytego i prezentacja matki pszczelej z mistrzem pasiecznym.',
      'Szkolenie praktyczne przy ulu: bezpieczny przegląd, technika prawidłowego podkarmiania i profilaktyka zdrowotna.',
      'Bezpieczny transport: transportówka z siatką wentylacyjną ułożona w poprzek kierunku jazdy, spięta pasami, przewóz rano lub wieczorem.',
      'Zasiedlenie ula na Twojej pasiece: po 30-60 min uspokojenia pszczół przełożenie ramek w niezmienionej kolejności do ula wielkopolskiego.',
      'Pobudzenie rozwoju: dodanie ramek z węzą na skraj gniazda i podanie syropu cukrowego 1:1 lub ciasta.',
    ];
  } else if (prodType === 'candle') {
    healthBenefits = [
      'Naturalna jonizacja ujemna – neutralizuje cząstki kurzu, zarodniki pleśni, smog elektromagnetyczny i dym',
      'Ulga dla układu oddechowego – naturalne estry propolisu i wosku ułatwiają oddychanie alergikom i astmatykom',
      'Kojący miodowy mikroklimat – ciepły aromat rozluźnia napięcia, redukuje stres i sprzyja głębokiemu snowi',
      'Bezdymne i czyste spalanie – brak rakotwórczych oparów (benzenu i toluenu obecnych w parafinie)',
      'Wydłużony czas palenia – gęsty wosk pszczeli pali się do 3-krotnie dłużej niż tradycyjne świece parafinowe',
    ];
    advisorVerdict = 'Wybierz Świecę z Wosku Pszczelego, jeśli pragniesz czystego powietrza w domu, odprężającego miodowego mikroklimatu i naturalnej ujemnej jonizacji bez toksycznych oparów ropopochodnej parafiny.';
    masterTip = 'Pal świecę jednorazowo min. 2-3 godziny, by roztopić taflę wosku aż do ścianek – zapobiega to tunelowaniu i gwarantuje najdłuższy czas palenia.';
    culinaryPairing = 'Palić na stabilnej, żaroodpornej podstawce z dala od przeciągów. Przyciąć knot do 5 mm przed zapaleniem; jednorazowa sesja min. 2 godziny.';
    recommendedDose = 'Pal świecę przez 2-3 godziny dziennie w sypialni lub pokoju dziennym, najlepiej przed snem.';
    culinaryIdeas = [
      'Przed każdym zapaleniem przytnij knot do długości ok. 5 mm.',
      'Pal świecę jednorazowo min. 2 godziny, aby wosk roztopił się po brzegi (zapobiega tunelowaniu).',
      'Pal świecę na stabilnej podstawce z dala od przeciągów i dzieci.',
      'Do gaszenia używaj gasidełka lub delikatnie zanurz knot w płynnym wosku.',
    ];
  } else if (product.id === 'propolis-kit') {
    healthBenefits = [
      'Najsilniejszy naturalny antybiotyk – niszczy bakterie, wirusy i grzyby chorobotwórcze bez uodparniania patogenów',
      'Ponad 300 bioaktywnych związków – unikalna kompozycja estrów kwasu kawowego (CAPE), flawonoidów i terpenów',
      'Błyskawiczna ulga w jamie ustnej – łagodzi stany zapalne gardła, afty, paradontozę i krwawienie dziąseł',
      'Regeneracja naskórka i tkanek – stymuluje podziały komórkowe, przyspiesza gojenie ran, oparzeń i owrzodzeń',
      'Wsparcie tarczy immunologicznej – mobilizuje makrofagi i komórki odpornościowe w infekcjach sezonowych',
    ];
    advisorVerdict = 'Wybierz Kit Pszczeli (Propolis), jeśli poszukujesz najsilniejszego naturalnego antybiotyku ula do przygotowania domowej nalewki leczniczej na infekcje gardła, afty, stany zapalne oraz trudno gojące się rany.';
    masterTip = 'Z 50g surowca przygotujesz ok. 250ml silnego ekstraktu 20% w spirytusie 70%. Pamiętaj, by przed pierwszym użyciem wykonać próbę uczuleniową na zgięciu łokcia.';
    culinaryPairing = 'Nalewka spirytusowa 10–20%, inhalacje parowe, roztwór do pędzlowania i płukania gardła.';
    recommendedDose = 'Nalewka: 50g propolisu zalać 250ml spirytusu 70%. Macerować 2-3 tygodnie. Stosować 20-30 kropli na łyżeczkę miodu.';
    culinaryIdeas = [
      'Nalewka propolisowa 20%: 20-30 kropli na łyżeczkę miodu przy infekcji gardła.',
      'Płukanka jamy ustnej: 30 kropli nalewki na 1/2 szklanki letniej wody.',
      'Maść propolisowa: rozetrzyj krople ekstraktu z maścią z witaminą A na podrażnienia skóry.',
      'Bezpośrednie żucie: małą grudkę wielkości ziarenka pieprzu żuć przy bólu zęba i aftach.',
    ];
  } else if (product.id === 'pierzga-pszczela') {
    healthBenefits = [
      '3-krotnie wyższa biodostępność niż pyłku – rozpuszczone otoczki komórkowe dzięki fermentacji mlekowej w ulu',
      'Kompletny superfood enzymatyczny – witaminy A, B-kompleks, C, D, E, K oraz naturalne enzymy trawienne',
      'Odbudowa krwi i hemoglobiny – bogate źródło łatwo przyswajalnego żelaza przy anemii i osłabieniu organizmu',
      'Ochrona mikrobioty i wątroby – kwas mlekowy regeneruje florę bakteryjną jelit i wspomaga procesy detoksykacji',
      'Rewitalizacja w stanach wyczerpania – niezastąpiona przy rekonwalescencji po antybiotykach, operacjach i ciężkim wysiłku',
    ];
    advisorVerdict = 'Wybierz Pierzgę Pszczelą, jeśli potrzebujesz najpotężniejszego naturalnego biostymulatora o 3-krotnie wyższej przyswajalności niż pyłek, do odbudowy krwi (żelazo), regeneracji jelit oraz powrotu do sił po chorobie.';
    masterTip = 'Pierzga to pyłek sfermentowany kwasem mlekowym w komórkach plastra – nie wymaga długiego namaczania, organizm przyswaja niemal 100% jej składników już pod językiem.';
    culinaryPairing = 'Spożywać bezpośrednio łyżeczką, rozpuszczona w letniej wodzie z miodem lub jako dodatek do koktajli.';
    recommendedDose = '1-2 łyżeczki dziennie (ok. 10-15g). Zalecana kuracja trwa 30-60 dni w okresie przesilenia.';
    culinaryIdeas = [
      'Rano na czczo: powoli rozgryzaj 1 łyżeczkę granulek pierzgi (wchłania się już pod językiem).',
      'Napar probiotyczny: namocz 1 łyżeczkę pierzgi w letniej wodzie z łyżeczką miodu na noc, wypij rano.',
      'Miód z pierzgą: utrzyj pierzgę z miodem w proporcji 1:4 na odżywczy krem do chleba lub owsianki.',
      'Dodaj do letniej owsianki lub jogurtu (nie podgrzewaj powyżej 40°C).',
    ];
  } else if (product.id === 'pylek-pszczeli') {
    healthBenefits = [
      'Ponad 250 substancji biologicznie czynnych – naturalna multiwitamina i biopierwiastki z kwitnących łąk Dolnego Śląska',
      'Pełnowartościowe białko roślinne – ponad 22% łatwoprzyswajalnych aminokwasów egzogennych dla regeneracji mięśni',
      'Wzmocnienie układu krążenia – wysoka zawartość rutyny uelastycznia naczynia krwionośne i reguluje ciśnienie',
      'Likwidacja chronicznego zmęczenia – podnosi siły witalne, poprawia pamięć, koncentrację i nastrój',
      'Kondycja skóry, włosów i paznokci – cynk, krzem i witaminy z grupy B wspierają syntezę naturalnego kolagenu i keratyny',
    ];
    advisorVerdict = 'Wybierz Pyłek Pszczeli, jeśli potrzebujesz naturalnej multiwitaminy i ponad 22% pełnowartościowego białka roślinnego do walki ze zmęczeniem, wzmocnienia włosów i paznokci oraz poprawy pamięci.';
    masterTip = 'Zawsze namaczaj pyłek wieczorem w niewielkiej ilości letniej wody z odrobiną miodu – po kilku godzinach otoczki pęcznieją i uwalniają pełnię witamin do organizmu.';
    culinaryPairing = 'Namaczany na noc w wodzie z miodem, z jogurtem naturalnym, kefirem lub poranną owsianką.';
    recommendedDose = '1-2 łyżeczki dziennie. Zalej pyłek wieczorem letnią wodą z odrobiną miodu, by otoczki pękły i uwolniły 100% witamin.';
    culinaryIdeas = [
      'Rytuał wieczorny: 1-2 łyżeczki pyłku zalej letnią wodą z łyżeczką miodu, wypij rano na czczo.',
      'Dodaj namoczony pyłek do koktajlu owocowo-warzywnego lub jogurtu naturalnego.',
      'Wymieszaj z twarogiem wiejskim i miodem faceliowym.',
      'Posyp świeżą sałatkę warzywną jako chrupiący akcent witaminowy.',
    ];
  } else if (product.id.includes('lipow') || product.name.toLowerCase().includes('lipowy')) {
    healthBenefits = [
      'Niezastąpiony przy przeziębieniach, grypie, kaszlu i zapaleniu oskrzeli',
      'Zawiera naturalne olejki eteryczne (olejek lipowy) działające napotnie i wykrztuśnie',
      'Działa łagodząco na układ nerwowy, ułatwia zasypianie i redukuje napięcie stresowe',
      'Naturalna bariera antybakteryjna dla błon śluzowych gardła i krtani',
    ];
    advisorVerdict = 'Wybierz Miód Lipowy, jeśli szukasz sprawdzonego, tradycyjnego wsparcia przy przeziębieniu, grypie i kaszlu oraz cenisz intensywny, odświeżający aromat kwiatów lipy z nutą mentolu.';
    masterTip = 'Pamiętaj, aby nie dodawać go do wrzątku – rozpuszczaj w naparach o temperaturze do 40°C, by zachować dobroczynne olejki eteryczne.';
    culinaryPairing = 'Napar z kwiatu lipy, herbata z cytryną, grzane mleko owsiane, pieczone jabłka z cynamonem.';
    culinaryIdeas = [
      'Niezastąpiony w rozgrzewającej herbacie z cytryną i imbirem w chłodne wieczory.',
      'Polej pieczone jabłka lub gruszki z dodatkiem cynamonu i orzechów włoskich.',
      'Dodaj łyżeczkę do ciepłego mleka przed snem, by ukoić zmysły i ułatwić zasypianie.',
      'Znakomity do sosów sałatkowych na bazie octu jabłkowego i musztardy dijon.',
    ];
  } else if (product.id.includes('spadz') || product.name.toLowerCase().includes('spadzi')) {
    healthBenefits = [
      '9-krotnie wyższa zawartość biopierwiastków (potas, fosfor, żelazo, magnez) niż w miodach kwiatowych',
      'Silne działanie przeciwzapalne, wykrztuśne i antyseptyczne (wysoka zawartość inhibiny)',
      'Wspiera regenerację układu krążenia, serca oraz rekonwalescencję po antybiotykoterapii',
      'Pomocny przy anemii, przewlekłym zmęczeniu i ekspozycji na zanieczyszczenia miejskie',
    ];
    advisorVerdict = 'Wybierz Miód ze Spadzi Iglastej („czarny diament”), jeśli zależy Ci na maksymalnej gęstości minerałów, regeneracji wyczerpanego organizmu lub preferujesz głęboki, żywiczny, szlachetnie mało słodki bukiet.';
    masterTip = 'Zawiera aż 9-krotnie więcej biopierwiastków niż miody nektarowe; doskonały w stanach rekonwalescencji po antybiotykach lub intensywnym wysiłku.';
    culinaryPairing = 'Dojrzałe sery kozie i owcze, pieczywo żytnie na zakwasie, sosy pieczeniowe, ciemne marynaty.';
    culinaryIdeas = [
      'Szlachetny sos do ciemnych mięs i pieczeni (np. schab ze śliwką, policzki wołowe).',
      'Wykwintny pairing z dojrzałym serem kozim, pecorino lub oscypkiem z grilla.',
      'Łyżeczka rozpuszczona w letniej wodzie na czczo jako bomba mineralna o poranku.',
      'Dodatek do mocnej czarnej herbaty liściastej lub naparu z igieł sosny.',
    ];
  } else if (product.id.includes('gryczan') || product.name.toLowerCase().includes('gryczany')) {
    healthBenefits = [
      'Rekordowa zawartość rutyny – uszczelnia i wzmacnia ściany naczyń włosowatych',
      'Wysoka zawartość łatwo przyswajalnego żelaza – niezastąpiony przy anemii i osłabieniu',
      'Jeden z najpotężniejszych antyoksydantów w świecie pszczelim – zwalcza wolne rodniki',
      'Wspomaga leczenie nadciśnienia tętniczego i profilaktykę przeciwmiażdżycową',
    ];
    advisorVerdict = 'Wybierz Miód Gryczany, jeśli szukasz potężnego wsparcia dla serca i naczyń krwionośnych (rekordowa rutyna i żelazo) lub kochasz wytrawny, głęboki smak przypominający ciemną melasę, karmel i suszoną śliwkę.';
    masterTip = 'Miód gryczany ma jeden z najwyższych współczynników aktywności antyoksydacyjnej (związki polifenolowe) pośród wszystkich miodów europejskich.';
    culinaryPairing = 'Staropolski piernik dojrzewający, ciemne sosy mięsne, dziczyzna, mocna herbata z cytryną, sery z niebieską pleśnią.';
    culinaryIdeas = [
      'Kluczowy składnik tradycyjnego ciasta na piernik staropolski i miodownik.',
      'Wyrazista glazura do pieczonych żeberek, boczku lub skrzydełek drobiowych.',
      'Dodatek do ciemnych sosów na bazie czerwonego wina i suszonych grzybów.',
      'Mocna czarna herbata z plastrem pomarańczy, goździkami i miodem gryczanym.',
    ];
  } else if (product.id.includes('akacj') || product.name.toLowerCase().includes('akacjowy')) {
    healthBenefits = [
      'Najmniej obciąża przewód pokarmowy – polecany przy nadkwasocie, wrzodach i refluksie',
      'Bogaty w łatwoprzyswajalną fruktozę – bezpieczniejszy wybór dla dzieci i seniorów',
      'Działa łagodząco i uspokajająco, wspomaga walkę z bezsennością i napięciem nerwowym',
      'Wspomaga regenerację wątroby i dróg żółciowych',
    ];
    advisorVerdict = 'Wybierz Miód Akacjowy, jeśli szukasz krystalicznie jasnego, niezwykle łagodnego miodu, który najdłużej pozostaje płynny, nie podrażnia wrażliwego żołądka i słodzi bez zmieniania naturalnego smaku potraw.';
    masterTip = 'Dzięki wysokiemu stosunkowi fruktozy do glukozy krystalizuje najwolniej ze wszystkich polskich miodów i jest najlepiej tolerowany przez dzieci oraz osoby z wrażliwym żołądkiem.';
    culinaryPairing = 'Naleśniki, gofry, świeże owoce, jogurty naturalne, delikatna zielona i biała herbata, dressingi sałatkowe.';
    culinaryIdeas = [
      'Idealny słodzik do zielonej i białej herbaty, lemoniady oraz świeżo wyciskanych soków.',
      'Polewa do puszystych naleśników, gofrów, placuszków bananowych i owocowych bowli.',
      'Baza do delikatnych dressingów sałatkowych z oliwą z oliwek i sokiem z limonki.',
      'Świetny dodatek do owsianki lub chia puddingu, gdzie zależy nam na aksamitnej słodyczy.',
    ];
  } else if (product.id.includes('rzepak') || product.name.toLowerCase().includes('rzepakowy')) {
    healthBenefits = [
      'Błyskawicznie odżywia mięsień sercowy dzięki najwyższej koncentracji łatwo przyswajalnej glukozy',
      'Wspomaga detoksykację i regenerację wątroby oraz prawidłowe funkcjonowanie pęcherzyka żółciowego',
      'Neutralizuje nadkwasotę żołądkową i łagodzi podrażnienia śluzówki przełyku',
      'Przyspiesza regenerację sił po wyczerpującym wysiłku sportowym i intelektualnym',
    ];
    advisorVerdict = 'Wybierz Miód Rzepakowy, jeśli lubisz aksamitną, śnieżnobiałą konsystencję kremu, która nigdy nie spływa z pieczywa, oraz szukasz szybkiego źródła czystej glukozy dla serca, mięśni i regeneracji wątroby.';
    masterTip = 'Ze względu na dominację glukozy natychmiast przenika do krwiobiegu, nie obciążając układu pokarmowego – idealny dla osób aktywnych fizycznie i umysłowo.';
    culinaryPairing = 'Ciepła maślana chałka, gofry, tosty, poranne kakao, kasza manna z malinami, twarożek.';
    culinaryIdeas = [
      'Aksamitny krem na świeżą maślaną chałkę, tosty lub świeży chleb żytni.',
      'Błyskawiczny posiłek przedtreningowy: banan z miodem rzepakowym i masłem orzechowym.',
      'Dodatek do ciepłego kakao lub mleka dla dzieci – nie spływa i wspaniale się łączy.',
      'Podstawa domowych batonów energetycznych z płatków owsianych i orzechów.',
    ];
  } else if (product.id.includes('wrzos') || product.name.toLowerCase().includes('wrzosowy')) {
    healthBenefits = [
      'Najsilniejszy naturalny sojusznik w profilaktyce schorzeń prostaty i dróg moczowych',
      'Wysoka zawartość łatwo przyswajalnych enzymów, biopierwiastków i substancji koloidalnych',
      'Działa przeciwzapalnie, moczopędnie i osłonowo na nerki',
      'Wspomaga trawienie i łagodzi stany zapalne błony śluzowej żołądka',
    ];
    advisorVerdict = 'Wybierz Miód Wrzosowy, jeśli szukasz prawdziwego rarytasu o unikalnej galaretowatej konsystencji, głębokim rubinowym odcieniu oraz szlachetnym, lekko żywiczno-gorzkawym smaku, a także wsparcia dla nerek i dróg moczowych.';
    masterTip = 'Ze względu na naturalną tiksotropię (galaretowatość) po zamieszaniu łyżeczką na chwilę rzednie, by po chwili znów stężeć – to cecha wyłącznie najczystszego miodu wrzosowego.';
    culinaryPairing = 'Pieczony camembert, wędliny długodojrzewające, orzechy włoskie, wyraziste sery pleśniowe, wytrawne wina.';
    culinaryIdeas = [
      'Deska dojrzałych serów: rewelacyjny z gorgonzolą, roquefortem oraz pieczonym camembertem.',
      'Wytrawna marynata do dziczyzny, pieczonej kaczki lub polędwiczek wieprzowych.',
      'Ekskluzywny dodatek do świeżego chleba na zakwasie z masłem solonym.',
      'Połączenie z ciemnym pieczywem i orzechami włoskimi do wytrawnego wina.',
    ];
  } else if (product.id.includes('mniszk') || product.name.toLowerCase().includes('mniszkowy')) {
    healthBenefits = [
      'Wybitne właściwości osłonowe i regenerujące dla wątroby oraz dróg żółciowych (bogactwo choliny)',
      'Wspomaga trawienie, reguluje wydzielanie soków żołądkowych i łagodzi stany zapalne żołądka',
      'Wspiera układ moczowy i oczyszczanie organizmu z toksyn',
      'Wzmacnia organizm przy niedokrwistości i po kuracjach farmakologicznych',
    ];
    advisorVerdict = 'Wybierz Miód Mniszkowy, jeśli potrzebujesz naturalnej tarczy osłonowej dla wątroby, żołądka i dróg żółciowych oraz cenisz gęsty, intensywnie słodki majowy nektar o słonecznym zabarwieniu.';
    masterTip = 'Zbiór miodu mniszkowego jest silnie uzależniony od majowej pogody – to rzadka, limitowana odmiana o wysokiej zawartości choliny wspomagającej metabolizm tłuszczów.';
    culinaryPairing = 'Naleśniki z twarogiem, napary z mięty i rumianku, tosty z serem camembert, ciepła woda z cytryną o poranku.';
    culinaryIdeas = [
      'Poranna kuracja wątrobowa: łyżeczka miodu mniszkowego w letnim naparze z ostropestu lub mięty.',
      'Polewa do puszystych naleśników z białym serem, wanilią i skórką cytrynową.',
      'Dodatek do wiosennych sałatek ze świeżym szpinakiem, serem feta i orzechami.',
      'Słodzenie domowego kompotu z rabarbaru lub truskawek.',
    ];
  } else if (product.id.includes('malin') || product.name.toLowerCase().includes('malinowy')) {
    healthBenefits = [
      'Silne działanie napotne, przeciwgorączkowe i rozgrzewające (naturalny kwas salicylowy)',
      'Skuteczne wsparcie w zwalczaniu infekcji górnych dróg oddechowych i grypy',
      'Wspomaga układ krążenia i zapobiega miażdżycy naczyń',
      'Poprawia samopoczucie i działa kojąco przy wyczerpaniu organizmu',
    ];
    advisorVerdict = 'Wybierz Miód Malinowy, jeśli szukasz rzadkiego nektaru o przyjemnym, delikatnie owocowym finiszu i silnych właściwościach napotnych oraz rozgrzewających przy pierwszych symptomach infekcji.';
    masterTip = 'Pszczoły zbierają go z kwiatów dzikiej i leśnej maliny w zaledwie 2-3 tygodnie czerwca; działa jak naturalna aspiryna dzięki obecności kwasu salicylowego.';
    culinaryPairing = 'Herbatka malinowa i z dzikiej róży, domowe gofry, owsianki, twarożek śniadaniowy, jaglanki z owocami.';
    culinaryIdeas = [
      'Gorący napar malinowy z miodem i cytryną jako pierwsza pomoc przy dreszczach i przeziębieniu.',
      'Wymarzony dodatek do letnich gofrów ze świeżymi owocami i bitą śmietaną.',
      'Pyszne urozmaicenie porannej jaglanki z borówkami i płatkami migdałowymi.',
      'Słodzenie domowych kisieli, budyniów i owocowych koktajli.',
    ];
  } else if (product.id.includes('nawloc') || product.name.toLowerCase().includes('nawłociowy') || product.name.toLowerCase().includes('nawlociowy')) {
    healthBenefits = [
      'Wysoka aktywność antybiotyczna i flawonoidowa porównywalna z miodem manuka',
      'Nieocenione wsparcie przy stanach zapalnych nerek, pęcherza oraz przeroście prostaty',
      'Wysoka zawartość rutyny i kwercetyny uszczelniających naczynia krwionośne',
      'Działa przeciwobrzękowo, moczopędnie i wspomaga leczenie stanów zapalnych stawów',
    ];
    advisorVerdict = 'Wybierz Miód Nawłociowy („polski miód manuka”), jeśli szukasz miodu o potężnym potencjale antyseptycznym, wspierającego układ moczowy, nerki, prostatę oraz stawy i naczynia krwionośne.';
    masterTip = 'Ostatni pożytek sezonu; wykazuje jedną z najwyższych aktywności antybiotycznych wśród polskich miodów i bardzo szybko tworzy delikatną, drobnoziarnistą konsystencję.';
    culinaryPairing = 'Ziołowe napary z pokrzywy i skrzypu, pieczona dynia, sosy winegret, lekkie herbaty cytrusowe.';
    culinaryIdeas = [
      'Znakomity do ziołowych naparów oczyszczających nerki (pokrzywa, brzoza, skrzyp).',
      'Glazura do pieczonych warzyw korzeniowych (marchew, dynia, pasternak).',
      'Dodatek do winegretu z musztardą francuską do sałat z roszponką i kozim serem.',
      'Szybki posiłek wzmacniający: kromka chleba z miodem nawłociowym i cynamonem.',
    ];
  } else if (product.id.includes('facel') || product.name.toLowerCase().includes('faceliowy')) {
    healthBenefits = [
      'Wspomaga regulację ciśnienia tętniczego i pracę układu sercowo-naczyniowego',
      'Błyskawicznie uzupełnia energię i elektrolity po intensywnym wysiłku sportowym',
      'Działa osłonowo na żołądek i wspomaga leczenie chorób wrzodowych',
      'Wzmacnia barierę obronną organizmu przy zmęczeniu i przesileniu wiosennym',
    ];
    advisorVerdict = 'Wybierz Miód Faceliowy, jeśli cenisz subtelny, rześki nektar z delikatną cytrusowo-kwaskowatą nutą oraz szukasz lekkiego miodu wspomagającego obniżanie ciśnienia i szybką regenerację po treningu.';
    masterTip = 'Facelia błękitna to roślina wybitnie miododajna; miód z jej kwiatów jest lekki, orzeźwiający i świetnie rozpuszcza się w chłodnych napojach izotonicznych.';
    culinaryPairing = 'Letnie lemoniady cytrynowo-miętowe, koktajle owocowe, dressingi sałatkowe, lekka zielona herbata.';
    culinaryIdeas = [
      'Domowy izotonik: woda, sok z cytryny, szczypta soli kłodawskiej i łyżka miodu faceliowego.',
      'Dodatek do letnich lemoniad z plastrami ogórka, cytryny i świeżej mięty.',
      'Lekki dressing sałatkowy z oliwą z oliwek, octem balsamicznym i miodem faceliowym.',
      'Polewa do greckiego jogurtu z granolą i świeżymi borówkami.',
    ];
  } else if (product.id.includes('lesn') || product.name.toLowerCase().includes('leśny') || product.name.toLowerCase().includes('lesny')) {
    healthBenefits = [
      'Synergia nektaru i spadzi: wzmocniona odporność i bogaty profil mikroelementów',
      'Wspomaga układ krążenia i reguluje napięcie naczyń krwionośnych',
      'Działa regenerująco na drogi oddechowe i łagodzi podrażnienia gardła',
      'Pomocny przy wyczerpaniu nerwowym i przewlekłym zmęczeniu',
    ];
    advisorVerdict = 'Wybierz Miód Leśny, jeśli szukasz harmonijnego, głębokiego połączenia nektaru dzikich roślin runa leśnego (kruszyna, malina, jeżyna) ze szlachetną letnią spadzią drzew.';
    masterTip = 'Łączy najlepsze cechy miodów nektarowych (owocowy bukiet runa) i spadziowych (podwyższona zawartość biopierwiastków i enzymów).';
    culinaryPairing = 'Deska serów półtwardych, pieczywo żytnie, herbaty leśne i owocowe, marynaty drobiowe z tymiankiem.';
    culinaryIdeas = [
      'Idealny kompan do herbat z owoców leśnych (dzika róża, aronia, czarny bez).',
      'Znakomita marynata do pieczonej piersi z kaczki lub indyka w ziołach.',
      'Polewa do tradycyjnego sernika krakowskiego lub tarty owocowej.',
      'Wyśmienity z pieczywem żytnim i wędzonym serem lub twarogiem wędzonym.',
    ];
  } else if (product.id.includes('wielokwiat') || product.name.toLowerCase().includes('wielokwiatowy')) {
    healthBenefits = [
      'Szerokie spektrum biopierwiastków dzięki nektarowi z dziesiątek dzikich roślin łąkowych',
      'Wspiera układ odpornościowy w codziennej walce z wirusami i bakteriami',
      'Działa wspomagająco przy alergii na pyłki (naturalna desensybilizacja)',
      'Wspomaga mięsień sercowy i łagodzi stany wyczerpania psychofizycznego',
    ];
    advisorVerdict = 'Wybierz Miód Wielokwiatowy, jeśli szukasz klasycznego, uniwersalnego miodu z bogactwa wiosenno-letnich łąk Dolnego Śląska, idealnego dla całej rodziny do codziennej profilaktyki odporności i łagodzenia alergii pyłkowych.';
    masterTip = 'Regularne spożywanie miodu wielokwiatowego z lokalnej pasieki działa jak naturalna desensybilizacja – uodparnia organizm na pyłki roślin kwitnących w naszym regionie.';
    culinaryPairing = 'Świeże chrupiące pieczywo z wiejskim masłem, poranna owsianka, twaróg, napary ziołowe, lemoniady.';
    culinaryIdeas = [
      'Śniadaniowy klasyk: chrupiąca pajda chleba na zakwasie z prawdziwym masłem i miodem.',
      'Baza do porannej mikstury: szklanka letniej wody + sok z cytryny + łyżeczka miodu.',
      'Naturalny dodatek do domowych wypieków, chałek, drożdżówek i ciasteczek owsianych.',
      'Ulubiony dodatek dzieci do mleka, kakao oraz twarożku z rzodkiewką lub owocami.',
    ];
  } else {
    healthBenefits = [
      'Wzmacnia naturalną barierę immunologiczną przed sezonowymi infekcjami',
      'Naturalne źródło bioaktywnych enzymów pszczelich (lizozym, inhibina)',
      'Wspiera regenerację tkanek, łagodzi zmęczenie i dodaje witalności',
    ];
    advisorVerdict = `Wybierz ${product.name}, jeśli szukasz naturalnego, tradycyjnego miodu z czystych rejonów do codziennego wzmacniania organizmu całej rodziny.`;
    masterTip = 'Pamiętaj o przechowywaniu miodu w ciemnym miejscu w temperaturze poniżej 18°C i chroń enzymy unikając podgrzewania powyżej 40°C.';
    culinaryPairing = 'Ciepłe pieczywo orkiszowe, twaróg wiejski, poranna owsianka z bakaliami, herbaty ziołowe.';
    culinaryIdeas = [
      'Dodaj 1-2 łyżeczki do przestudzonej herbaty z plasterkiem świeżego imbiru.',
      'Wymieszaj z oliwą z oliwek i musztardą francuską jako autorski sos do sałat.',
      'Polej ciepłe tosty z masłem orzechowym lub twarogiem wiejskim.',
      'Użyj jako naturalnego słodzika do domowej granoli lub owsianki.',
    ];
  }

  // Budowa obiektu cen i listy rozmiarów
  const sizesList = product.sizes.map(s => ({
    gram: s.label.replace(/(\d+)\s+g\b/gi, '$1g').trim(),
    weightGrams: s.weightGrams,
    price: s.pricePln,
    inStock: s.inStock ?? true,
  }));

  const prices: Record<string, number> = {};
  sizesList.forEach(s => {
    prices[s.gram] = s.price;
  });

  // Upewnij się, że są klucze standardowe w razie potrzeby
  if (!prices['250g'] && sizesList[0]) {
    prices['250g'] = Math.round(sizesList[0].price * 0.65);
  }
  if (!prices['500g'] && sizesList[0]) {
    prices['500g'] = sizesList[0].price;
  }
  if (!prices['1000g']) {
    prices['1000g'] = sizesList[1]?.price || Math.round(sizesList[0].price * 1.8);
  }

  const crystallizationDesc = prodType === 'bee-colony'
    ? 'Nie dotyczy (żywa rodzina pszczela na ramkach)'
    : prodType === 'candle'
    ? 'Stały wosk pszczeli (temperatura topnienia 62–64°C)'
    : product.id === 'propolis-kit'
    ? 'Czysty kit pszczeli w bryłkach (nie krystalizuje)'
    : product.id === 'pierzga-pszczela'
    ? 'Naturalne granulki pierzgi wydobyte z plastra'
    : product.id === 'pylek-pszczeli'
    ? 'Suszone ziarna obnóży pyłkowych'
    : product.consistency === 'kremowany'
    ? 'Kremowany (puszysta, aksamitna masa bez wyczuwalnych kryształków)'
    : product.consistency === 'patoka'
    ? 'Płynna patoka (naturalnie płynny, powolna drobnokrystaliczna krystalizacja)'
    : 'Krupiec drobnoziarnisty (tradycyjna, równomierna krystalizacja potwierdzająca surowość)';

  let consistencyInfo: ConsistencyInfo;
  if (prodType === 'bee-colony') {
    consistencyInfo = {
      state: 'krupiec',
      label: 'Żywa rodzina pszczela (5 ramek)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      shortExplanation: 'Odkład na ramkach wielkopolskich z młodą matką czerwiącą pod stałym nadzorem Powiatowego Lekarza Weterynarii.',
      crystallizationSpeed: 'Rezerwacja na sezon 2026',
      hasGlucoseBloom: false,
      storageTips: 'Odbiór osobisty w pasiece Ciechów w czerwcu lub lipcu 2026 r.',
    };
  } else if (prodType === 'candle') {
    consistencyInfo = {
      state: 'krupiec',
      label: '100% Czysty wosk pszczeli (Cera flava)',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
      shortExplanation: 'Rękodzieło pasieczne z naturalnym knotem bawełnianym bez grama parafiny i barwników.',
      crystallizationSpeed: 'Trwały surowiec ulowy',
      hasGlucoseBloom: false,
      storageTips: 'Przechowywać w suchym miejscu z dala od słońca i źródeł ciepła.',
    };
  } else if (prodType === 'apitherapy') {
    consistencyInfo = {
      state: 'krupiec',
      label: 'Produkt apiterapeutyczny (Superfood)',
      badgeClass: 'bg-amber-900/10 text-amber-900 border-amber-900/25',
      shortExplanation: 'Surowiec ulowy pozyskany z czystych rejonów Dolnego Śląska, zachowujący 100% aktywności biologicznej.',
      crystallizationSpeed: 'Suszony w reżimie do 38°C',
      hasGlucoseBloom: false,
      storageTips: 'Przechowywać w szczelnym opakowaniu w ciemnym i chłodnym miejscu (poniżej 18°C).',
    };
  } else if (product.consistency === 'kremowany') {
    consistencyInfo = {
      state: 'kremowany',
      label: 'Kremowany (Aksamitna pasta)',
      badgeClass: 'bg-[#F4EFE6] text-[#785E3A] border-[#D9C4A6]',
      shortExplanation: 'Miód utarty mechanicznie na zimno bez żadnych dodatków. Posiada gładką strukturę masła, łatwo się rozsmarowuje i nie spływa z pieczywa.',
      crystallizationSpeed: 'Trwale kremowa konsystencja',
      hasGlucoseBloom: false,
      storageTips: 'Przechowywać w temperaturze 14–18°C z dala od słońca. Zachowuje kremowość przez cały rok.',
    };
  } else if (product.consistency === 'patoka') {
    consistencyInfo = {
      state: 'patoka',
      label: 'Płynny (Świeża patoka)',
      badgeClass: 'bg-[#FEF6E7] text-[#975811] border-[#F2CB8B]',
      shortExplanation: 'Czysty, lejący nektar ze świeżego miodobrania. Z czasem ulega powolnemu, naturalnemu procesowi twardnienia (krystalizacji).',
      crystallizationSpeed: 'Wolna do umiarkowanej (zależy od przewagi fruktozy w nektarze)',
      hasGlucoseBloom: false,
      storageTips: 'Nie podgrzewać powyżej 40°C. Jeśli chcesz go lekko ogrzać, wstaw słoik do letniej kąpieli wodnej (max 38°C).',
    };
  } else {
    consistencyInfo = {
      state: 'krupiec',
      label: 'Skrystalizowany (Krupiec)',
      badgeClass: 'bg-[#EDF5EC] text-[#225737] border-[#BAD8C2]',
      shortExplanation: 'Naturalnie stężały miód o strukturze drobnych kryształków. Nie był podgrzewany w beczkach ani sztucznie upłynniany.',
      crystallizationSpeed: 'Miód w pełni dojrzały i skrystalizowany',
      hasGlucoseBloom: true,
      glucoseBloomInfo: 'Biały nalot i marmurkowe smugi na ściankach słoika (tzw. „kwiat miodu”) to mikroskopijne kryształki czystej glukozy i uwięzione pęcherzyki powietrza. To nie jest wada, pleśń ani dosypany cukier – to pierwotny, niepodważalny dowód na 100% surowy, nieprzegrzewany miód rzemieślniczy!',
      storageTips: 'Najlepiej smakuje nabierany łyżką lub rozpuszczany w letniej herbacie lub wodzie z cytryną (do 40°C).',
    };
  }

  // Określenie intencji apiterapeutycznych
  const healthIntents: HealthIntent[] = [];
  const idLower = product.id.toLowerCase();
  const nameLower = product.name.toLowerCase();

  if (
    idLower.includes('lipow') || 
    idLower.includes('spadz') || 
    idLower.includes('propolis') || 
    idLower.includes('pylek') || 
    nameLower.includes('lipowy') || 
    nameLower.includes('spadzi') ||
    idLower.includes('malinowy-nektarowy')
  ) {
    healthIntents.push('odpornosc');
  }

  if (
    idLower.includes('rzepak') || 
    idLower.includes('akacj') || 
    idLower.includes('wiosenny') || 
    idLower.includes('malina') || 
    idLower.includes('faceli') ||
    product.flavorIntensity === 'lagodny'
  ) {
    healthIntents.push('lagodne');
  }

  if (
    idLower.includes('gryczan') || 
    idLower.includes('wrzos') || 
    idLower.includes('spadz') || 
    idLower.includes('mniszk') ||
    product.flavorIntensity === 'wyrazisty'
  ) {
    healthIntents.push('koneser');
  }

  if (
    idLower.includes('orzech') || 
    idLower.includes('wrzos') || 
    idLower.includes('malina-kremowany') || 
    idLower.includes('propolis') || 
    product.isLimitedBatch ||
    isProductBestseller(product) ||
    isProductRecommended(product)
  ) {
    healthIntents.push('prezent');
  }

  // Botanical / Source label tailored
  let botanicalSource = product.dominantPlant || product.botanicalName;
  if (prodType === 'bee-colony') {
    botanicalSource = 'Krainka (Apis mellifera carnica) / Buckfast – matka unasieniona';
  } else if (prodType === 'candle') {
    botanicalSource = '100% Czysty Wosk Pszczeli z węzy (Cera flava)';
  } else if (product.id === 'propolis-kit') {
    botanicalSource = 'Żywice pąków drzew liściastych i iglastych (Propolis cera)';
  } else if (product.id === 'pierzga-pszczela') {
    botanicalSource = 'Pyłek kwiatowy poddany naturalnej fermentacji mlekowej w ulu';
  } else if (product.id === 'pylek-pszczeli') {
    botanicalSource = 'Różnobarwne obnóża pyłkowe z kwitnących łąk i lasów Dolnego Śląska';
  }

  return {
    ...product,
    productType: prodType,
    tagline: product.subtitle,
    botanicalSource,
    region: product.apiaryLocation,
    badge,
    badgeClass,
    badges,
    images,
    tasteProfile: {
      sweetness: product.sensoryProfile.sweetness,
      acidity: product.sensoryProfile.acidity,
      aroma: product.sensoryProfile.intensity,
      crystallization: crystallizationDesc,
      color: product.colorName,
    },
    healthBenefits,
    pairing: product.pairing || culinaryPairing,
    detailedUsage: {
      recommendedDose,
      culinaryIdeas,
    },
    labAnalysis: {
      lotNumber: product.labAnalysis?.lotNumber || product.batchNumber,
      waterContent: product.labAnalysis?.waterContent || `${product.waterContentPercentage}%`,
      diastaseNumber: product.labAnalysis?.diastaseNumber || '15+',
      hmf: product.labAnalysis?.hmf || '< 10 mg/kg',
      conductivity: product.labAnalysis?.conductivity,
    },
    prices,
    sizesList,
    advisorVerdict,
    masterTip,
    consistencyInfo,
    healthIntents,
  };
}

export const CATEGORY_METADATA: Record<string, { label: string; shortLabel: string; icon: string }> = {
  wiosenne: { label: 'Zbiory Wiosenne (Maj)', shortLabel: 'Wiosenne', icon: '🌸' },
  letnie: { label: 'Zbiory Letnie (Lipa, Gryka)', shortLabel: 'Letnie', icon: '☀️' },
  'lesne-spadz': { label: 'Miody Leśne & Spadziowe', shortLabel: 'Leśne & Spadź', icon: '🌲' },
  'z-dodatkami': { label: 'Miody Z Dodatkami (Owoce)', shortLabel: 'Z Dodatkami', icon: '🍓' },
  zestawy: { label: 'Zestawy Prezentowe', shortLabel: 'Zestawy', icon: '🎁' },
};
