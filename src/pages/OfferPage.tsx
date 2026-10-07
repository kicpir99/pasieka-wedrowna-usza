import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart, Droplets, Flame, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HONEY_PRODUCTS, HONEY_VARIETIES } from '../data/honeyProducts';
import { useProducts } from '../context/ProductContext';
import { HoneyProduct } from '../types';

const ProductDetailModal = React.lazy(() => import('../components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));

interface OfferPageProps {
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
  onAddToCart?: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
}

export const OfferPage: React.FC<OfferPageProps> = ({ displayResolution, onAddToCart }) => {
  const [detailProduct, setDetailProduct] = useState<HoneyProduct | null>(null);
  const { products, honeyVarieties, hiveTreasures } = useProducts();
  const currentHoneyVarieties = honeyVarieties.length > 0 ? honeyVarieties : HONEY_VARIETIES;
  const currentProducts = products.length > 0 ? products : HONEY_PRODUCTS;

  // Automatyczne, dynamiczne wyszukiwanie najniższych cen z bazy produktów
  const minHoneyPrice = useMemo(() => {
    const allPrices = currentHoneyVarieties.flatMap(h => h.sizes.map(s => s.pricePln));
    return allPrices.length > 0 ? Math.min(...allPrices) : 30;
  }, [currentHoneyVarieties]);

  const getLowestPrice = (productId: string, fallback: number) => {
    const prod = currentProducts.find(p => p.id === productId);
    if (!prod || !prod.sizes || prod.sizes.length === 0) return fallback;
    return Math.min(...prod.sizes.map(s => s.pricePln));
  };

  const minPierzgaPrice = useMemo(() => getLowestPrice('pierzga-pszczela', 45), []);
  const minPropolisPrice = useMemo(() => getLowestPrice('propolis-kit', 25), []);
  const minPylekPrice = useMemo(() => getLowestPrice('pylek-pszczeli', 28), []);
  const minWoskPrice = useMemo(() => getLowestPrice('swieca-wosk-pszczeli', 22), []);
  const minOdkladPrice = useMemo(() => getLowestPrice('odklad-szkolenie-pszczele', 350), []);

  const offerItems = useMemo(() => {
    const baseItems = [
      {
        id: 'miody',
        title: 'Miód Pszczeli – Odmianowy & Surowy',
        badge: 'Miody Odmianowe RAW',
        price: `od ${minHoneyPrice} zł / słoik`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-miody-infobox.jpg',
        icon: Droplets,
        description:
          'Wiesz, że to właśnie prawdziwy miód jest jednym z najbogatszych w składniki odżywcze darów natury? W naszej wędrownej pasiece nie standaryzujemy miodu – każdy słoiczek różni się smakiem, barwą i aromatem w zależności od leśnych i łąkowych pożytków Dolnego Śląska.',
        bullets: [
          '100% naturalny, surowy miód bez podgrzewania powyżej 36°C',
          'Bogaty w aktywne enzymy (inhibina, lizozym, apidycyna)',
          `${currentHoneyVarieties.length} odmian: lipowy, gryczany, spadziowy, wrzosowy, akacjowy...`,
        ],
        ctaText: `Zobacz ${currentHoneyVarieties.length} odmian w sklepie`,
        ctaLink: '/sklep',
      },
      {
        id: 'pierzga',
        title: 'Pierzga Pszczela (Bee Bread)',
        badge: 'Superfood Ula',
        price: `od ${minPierzgaPrice} zł`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-pierzga.jpg',
        icon: Sparkles,
        description:
          'Pierzga to pyłek kwiatowy zebrany przez pszczoły, wzbogacony miodem i enzymami ślinowymi, a następnie poddany naturalnej fermentacji mlekowej w plastrze pszczelim. Wartość odżywcza i profilaktyczna pierzgi jest znacznie wyższa niż zwykłego pyłku dzięki doskonałej bioprzyswajalności.',
        bullets: [
          'Silne wsparcie przy rekonwalescencji, anemiach i osłabieniu',
          'Naturalny probiotyk regenerujący florę bakteryjną jelit',
          'Pokarm, którym pszczoły karmią matkę i młode larwy',
        ],
        ctaText: 'Wybierz gramaturę i kup',
        ctaLink: '/produkt/pierzga-pszczela',
        productId: 'pierzga-pszczela',
      },
      {
        id: 'propolis',
        title: 'Propolis – Kit Pszczeli',
        badge: 'Naturalny Antybiotyk',
        price: `od ${minPropolisPrice} zł`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-propolis.jpg',
        icon: ShieldCheck,
        description:
          'Substancja żywiczna wytwarzana przez pszczoły do sterylizacji i uszczelniania ula przed bakteriami, wirusami i grzybami. W skład kitu pszczelego wchodzi ponad 300 aktywnych związków organicznych (flawonoidy, olejki eteryczne, mikroelementy).',
        bullets: [
          'Wybitne działanie antybakteryjne, przeciwgrzybicze i gojące',
          'Błyskawiczna ulga przy bólach gardła, infekcjach jamy ustnej i dziąseł',
          'Naturalna tarcza układu oddechowego i odpornościowego',
        ],
        ctaText: 'Kup naturalny propolis',
        ctaLink: '/produkt/propolis-kit',
        productId: 'propolis-kit',
      },
      {
        id: 'pylek',
        title: 'Pyłek Pszczeli Kwiatowy',
        badge: 'Bomba Witaminowa',
        price: `od ${minPylekPrice} zł`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/pylek-pszczeli.jpg',
        icon: Heart,
        description:
          'Miód to nie jedyny skarb pozyskiwany z pasieki. Pyłek kwiatowy zebrany w postaci różnobarwnych obnóży wzmacnia organizm, zwiększa liczbę czerwonych ciałek krwi, stabilizuje poziom żelaza i wspomaga naturalny detoks organizmu.',
        bullets: [
          'Bogaty w białko roślinne, aminokwasy egzogenne i witaminy z grupy B',
          'Wspomaga prawidłową pracę układu krążenia i obniża cholesterol',
          'Znakomicie wpływa na witalność, pamięć oraz stan skóry, włosów i paznokci',
        ],
        ctaText: 'Wybierz gramaturę i kup',
        ctaLink: '/produkt/pylek-pszczeli',
        productId: 'pylek-pszczeli',
      },
      {
        id: 'wosk',
        title: 'Wosk Pszczeli & Świece',
        badge: '100% Wosk Pszczeli',
        price: `od ${minWoskPrice} zł`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-wosk-pszeczeli.jpg',
        icon: Flame,
        description:
          'Wytwarzany przez młode pszczoły robotnice za pomocą gruczołów woskowych w spektakularnym procesie łączenia się w łańcuchy. Przez stulecia wosk pszczeli służył do wyrobu pachnących świec, które jonizują powietrze i oczyszczają dom z kurzu i alergenów.',
        bullets: [
          '100% czysty wosk z naszej pasieki bez grama szkodliwej parafiny',
          'Piękny, miodowo-propolisowy aromat palącej się świecy',
          'Świece odlewane i zwijane z naturalnej węzy pszczelej',
        ],
        ctaText: 'Zobacz świece z wosku',
        ctaLink: '/produkt/swieca-wosk-pszczeli',
        productId: 'swieca-wosk-pszczeli',
      },
      {
        id: 'szkolenia',
        title: 'Odkłady Pszczele & Szkolenia',
        badge: 'Odkłady & Szkolenia',
        price: `od ${minOdkladPrice} zł`,
        image: 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-oklady-683x1024.jpg',
        icon: BookOpen,
        description:
          'Z pasją dzielimy się naszą wiedzą pszczelarską zdobytą przez lata pracy. Oferujemy zdrowe odkłady pszczele na ramkach wielkopolskich z młodymi matkami oraz indywidualne pakiety szkoleniowe dla początkujących pasjonatów pszczelarstwa.',
        bullets: [
          'Odkłady pod stałą kontrolą Powiatowego Lekarza Weterynarii',
          'Praktyczna nauka pracy przy ulu bez stresu i dróg na skróty',
          'Wsparcie merytoryczne i doradztwo w doborze sprzętu',
        ],
        ctaText: 'Szczegóły i rezerwacja',
        ctaLink: '/produkt/odklad-szkolenie-pszczele',
        productId: 'odklad-szkolenie-pszczele',
      },
    ];

    // Dynamiczne dołączanie dowolnego nowego produktu dodanego przez klienta w WooCommerce w kategorii Skarby Ula
    const standardTreasureIds = ['pierzga-pszczela', 'propolis-kit', 'pylek-pszczeli', 'swieca-wosk-pszczeli', 'odklad-szkolenie-pszczele'];
    const customTreasures = hiveTreasures.filter(p => !standardTreasureIds.includes(p.id));

    const extraItems = customTreasures.map(prod => {
      const minPrice = prod.sizes && prod.sizes.length > 0 
        ? Math.min(...prod.sizes.map(s => s.pricePln)) 
        : 30;
      return {
        id: prod.id,
        title: prod.name,
        badge: prod.subtitle || 'Nowość w Pasiece',
        price: `od ${minPrice} zł`,
        image: prod.imageUrl || 'https://pasiekausza.pl/wp-content/uploads/2022/02/oferta-pierzga.jpg',
        icon: Sparkles,
        description: prod.description || 'Naturalny rzemieślniczy produkt pszczeli prosto z naszej pasieki wędrownej.',
        bullets: prod.recommendedUse && prod.recommendedUse.length > 0
          ? prod.recommendedUse.slice(0, 3)
          : ['100% naturalny produkt z Dolnego Śląska', 'Bezpośrednio z pracowni pasiecznej', 'Gwarancja świeżości i rzemieślniczej jakości'],
        ctaText: 'Zobacz i kup',
        ctaLink: `/produkt/${prod.id}`,
        productId: prod.id,
      };
    });

    return [...baseItems, ...extraItems];
  }, [minHoneyPrice, minPierzgaPrice, minPropolisPrice, minPylekPrice, minWoskPrice, minOdkladPrice, currentHoneyVarieties.length, hiveTreasures]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 max-w-3xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skarby Ula • Pasieka Wędrowna Usza</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
            Poznaj Skarby Naszej Pasieki
          </h1>
          <p className="text-sm sm:text-base text-[#C7BDB0] leading-relaxed">
            Miód to dopiero początek. W naszej pasiece pozyskujemy najcenniejsze dary ula: pierzgę, propolis, pyłek kwiatowy, wosk pszczeli oraz zdrowe rodziny pszczele.
          </p>
        </div>
      </section>

      {/* Offer Grid */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-12`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerItems.map(item => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#E7DCCE] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Card Image */}
                <Link
                  to={item.ctaLink}
                  aria-label={`Zobacz szczegóły: ${item.title}`}
                  className="block h-56 overflow-hidden relative cursor-pointer"
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Card Image Badge with clear descriptive label and icon */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D2821]/90 backdrop-blur-md text-[#E5983A] text-[11px] font-bold tracking-wide shadow-sm">
                      <Icon className="w-3.5 h-3.5 text-[#E5983A] shrink-0" />
                      <span>{item.badge}</span>
                    </span>
                  </div>
                </Link>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-bold text-[#23201C] tracking-tight">
                      <Link
                        to={item.ctaLink}
                        className="hover:text-[#8B5337] transition-colors"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#615444] leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-[#EFE5D8] space-y-2">
                      {item.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-[#524536]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#EFE5D8] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#8B5337] bg-[#FAF5EE] px-3 py-1.5 rounded-lg border border-[#ECDCCB]">
                        {item.price}
                      </span>
                      <span className="text-[11px] text-[#7A6E5E] font-medium">
                        {item.id === 'miody' ? 'Zbiory Dolnego Śląska' : '100% z naszej pasieki'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {item.productId && (
                      <button
                        type="button"
                        onClick={() => {
                          const matched = HONEY_PRODUCTS.find(p => p.id === item.productId);
                          if (matched) setDetailProduct(matched);
                        }}
                        className="px-3 py-2.5 rounded-xl border border-[#D9D0C3] text-[#4A4033] hover:bg-[#F4EFE6] hover:border-[#C2B7A7] text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                        title={`Szybki podgląd: ${item.title}`}
                      >
                        Podgląd
                      </button>
                    )}
                    <Link
                      to={item.ctaLink}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white border border-[#8B5337] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <span>{item.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vet Care & Quality Banner */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 mt-20`}>
        <div className="rounded-3xl bg-[#2D2821] text-[#FAF5ED] p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-xl">
          <ShieldCheck className="w-10 h-10 text-[#52B788] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#FAF5ED]">
            Bezpieczeństwo i Pewność Pochodzenia
          </h3>
          <p className="text-xs sm:text-sm text-[#CFC2B0] leading-relaxed">
            Wszystkie nasze produkty pszczele – zarówno miód, jak i pyłek, pierzga oraz propolis – pochodzą wyłącznie z naszych rodzin pszczelich będących pod stałą opieką Powiatowego Lekarza Weterynarii. Kupując u nas, wspierasz polskie pszczelarstwo wędrowne.
          </p>
          <p className="text-xs text-[#E5983A]/90 font-medium">
            Chcesz dobrać do zamówienia tradycyjny miód odmianowy? Sprawdź nasze zbiory z Dolnego Śląska.
          </p>
          <div className="pt-2">
            <Link 
              to="/sklep" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E5983A] hover:bg-[#D4892A] text-[#24211D] text-xs font-bold transition-all shadow-md"
            >
              <span>Przejdź do sklepu z miodami</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Modal szczegółów produktu */}
      <React.Suspense fallback={null}>
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={onAddToCart || (() => {})}
        />
      </React.Suspense>
    </main>
  );
};
