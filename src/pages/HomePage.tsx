import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { HoneyQualitySection } from '../components/HoneyQualitySection';
import { HoneyFAQSection } from '../components/HoneyFAQSection';
import { ProductCard } from '../components/ProductCard';
import { PagePreloader } from '../components/PagePreloader';
import { HoneyProduct } from '../types';
import { HONEY_PRODUCTS, HONEY_VARIETIES } from '../data/honeyProducts';
import { isProductBestseller } from '../utils/honeyHelpers';
import { getAssetUrl } from '../utils/assets';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Droplets, Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';

const ProductDetailModal = React.lazy(() => import('../components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
const HoneyFinderQuiz = React.lazy(() => import('../components/HoneyFinderQuiz').then(m => ({ default: m.HoneyFinderQuiz })));

interface HomePageProps {
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
  toggleCompare: (product: HoneyProduct) => void;
  compareList: HoneyProduct[];
  scrollToProducts: () => void;
  onOpenQuiz?: () => void;
  hasPreloadedHome?: boolean;
  onPreloadComplete?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onAddToCart,
  displayResolution,
  toggleCompare,
  compareList,
  scrollToProducts,
  onOpenQuiz,
  hasPreloadedHome = false,
  onPreloadComplete,
}) => {
  const [detailProduct, setDetailProduct] = useState<HoneyProduct | null>(null);
  const [localQuizOpen, setLocalQuizOpen] = useState(false);
  const [preloaderDoneLocally, setPreloaderDoneLocally] = useState(false);

  const handleOpenQuiz = onOpenQuiz || (() => setLocalQuizOpen(true));

  // Top 3 bestsellers for featured preview
  const featuredProducts = HONEY_VARIETIES.filter(p => isProductBestseller(p)).slice(0, 3);

  const reviews = [
    {
      author: 'Marek K.',
      location: 'Wrocław',
      role: 'Koneser miodów RAW',
      verified: true,
      orderNumber: 'PW-2026/782',
      rating: 5,
      date: 'Wrzesień 2026',
      category: 'smak',
      categoryLabel: '🍯 Smak i bukiet',
      text: 'Niezwykły miód wrzosowy – gęsty, galaretowaty, o głębokim leśnym finiszu. Czuć od razu, że nikt go nie przegrzewał ani nie standaryzował w przemysłowych kadziach. Zupełnie inna kategoria niż to, co można kupić w marketach.',
      productId: 'miod-wrzosowy',
    },
    {
      author: 'Barbara M.',
      location: 'Legnica',
      role: 'Apiterapia domowa',
      verified: true,
      orderNumber: 'PW-2026/API-77',
      rating: 5,
      date: 'Sierpień 2026',
      category: 'dzialanie',
      categoryLabel: '💪 Witalność i działanie',
      text: 'Pierzga najwyższej jakości – pachnące ulem, miękkie grudki o szlachetnym smaku naturalnej fermentacji mlekowej. Stosuję rano na czczo na odporność i różnica w samopoczuciu po miesiącu jest kolosalna. Bezcenny dar ula!',
      productId: 'pierzga-pszczela',
    },
    {
      author: 'Tomasz i Anna B.',
      location: 'Poznań',
      role: 'Zamówienie rodzinne',
      verified: true,
      orderNumber: 'PW-2026/904',
      rating: 5,
      date: '2 tygodnie temu',
      category: 'dostawa',
      categoryLabel: '📦 Bezpieczeństwo szkła',
      text: 'Zapach lipy po odkręceniu wieczka wypełnia całą kuchnię! Słoiki przyszły w pancernych tekturowych tubach, w 24 godziny od zamówienia, w stanie nienaruszonym. Na szkle widać piękny biały „kwiat miodu”. Zamawiamy zapas na zimę.',
      productId: 'miod-lipowy',
    },
  ];

  return (
    <>
      {/* Preloader tylko przy pierwszym załadowaniu strony głównej */}
      {!hasPreloadedHome && !preloaderDoneLocally && (
        <PagePreloader
          onComplete={() => {
            setPreloaderDoneLocally(true);
            if (onPreloadComplete) onPreloadComplete();
          }}
        />
      )}

      <main className="flex-1">
        {/* Hero z interaktywną karuzelą 3D i obrotowym słoikiem 360° */}
        <Hero
          onAddToCart={onAddToCart}
          onOpenProductDetail={setDetailProduct}
          onScrollToProducts={scrollToProducts}
          scrollToProducts={scrollToProducts}
          onOpenQuiz={handleOpenQuiz}
          onToggleCompare={toggleCompare}
          isCompared={(p) => compareList.some(item => item.id === p.id)}
        />

        {/* Sekcja: Nasza Filozofia – Pasieka Usza */}
        <section className="py-20 bg-white border-b border-[#E8DECFA0] content-visibility-auto">
          <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF0E1] text-[#8B5337] text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Ciechów • Dolny Śląsk</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#23201C] tracking-tight leading-tight">
                  Wędrowna pasieka z pasją i szacunkiem do pszczół
                </h2>

                <p className="text-sm sm:text-base text-[#594C3F] leading-relaxed">
                  Jesteśmy rodzinną pasieką wędrowną prowadzoną przez Magdalenę i Piotra Szymkowicz. Nasze ule wędrują za najczystszymi pożytkami Dolnego Śląska – od wiosennych sadów i mniszka, przez aleje lipowe i lasy, po fioletowe wrzosowiska.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DCCE] space-y-1.5">
                    <span className="text-sm font-bold text-[#8B5337] flex items-center gap-1.5">
                      🍯 Brak standaryzacji
                    </span>
                    <p className="text-xs text-[#6B5E4F] leading-relaxed">
                      Nie mieszamy całego miodu w jedną masę. Każdy słoik ma unikatowy charakter i smak stworzony przez pszczoły.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DCCE] space-y-1.5">
                    <span className="text-sm font-bold text-[#8B5337] flex items-center gap-1.5">
                      🌸 Promień 2 kilometrów
                    </span>
                    <p className="text-xs text-[#6B5E4F] leading-relaxed">
                      Pszczoły same decydują, który nektar i pyłek najbardziej im smakuje w otoczeniu leśnym i łąkowym.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/o-nas"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Poznaj całą naszą historię</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl overflow-hidden border border-[#E7DCCE] shadow-md bg-[#EDE4D5]">
                  <img
                    src={getAssetUrl('assets/about-apiary-1.webp')}
                    alt="Praca przy ulach w pasiece Usza"
                    width={683}
                    height={1024}
                    className="w-full h-48 sm:h-80 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#E7DCCE] shadow-md mt-3 sm:mt-6 bg-[#EDE4D5]">
                  <img
                    src={getAssetUrl('assets/about-apiary-2.webp')}
                    alt="Plaster miodu w ulu w pasiece Usza"
                    width={683}
                    height={1024}
                    className="w-full h-48 sm:h-80 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Wybrane Odmiany Miodów – Bestsellery ze Sklepu */}
        <section className="py-20 bg-[#FAF7F2] border-b border-[#E8DECFA0] content-visibility-auto">
          <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 space-y-12`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE4D2] text-[#713F0C] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#A05C12]" />
                  <span>Zbiory Wędrowne</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#23201C] tracking-tight">
                  Najchętniej Wybierane Miody
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5E4F] max-w-xl">
                  Poznaj nasze tegoroczne zbiory surowego miodu niepoddanego obróbce termicznej.
                </p>
              </div>

              <div>
                <Link
                  to="/sklep"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Zobacz wszystkie miody w sklepie ({HONEY_VARIETIES.length} odmian)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onOpenDetails={setDetailProduct}
                  onOpenDetail={setDetailProduct}
                  onToggleCompare={toggleCompare}
                  isCompared={compareList.some(p => p.id === product.id)}
                />
              ))}
            </div>

            {/* Skarby Ula Teaser */}
            <div className="bg-[#2D2821] text-[#FAF5ED] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="px-3 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-bold">
                  Apiterapia & Dary Ula
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF5ED]">
                  Pierzga, Propolis, Pyłek kwiatowy i Wosk
                </h3>
                <p className="text-xs sm:text-sm text-[#C7BDB0] leading-relaxed">
                  Miód to dopiero początek. Odkryj najcenniejsze dary ula prosto z naszej wędrownej pasieki: pierzgę, propolis, pyłek pszczeli, czysty wosk oraz zdrowe odkłady pszczele.
                </p>
                <div className="pt-2">
                  <Link
                    to="/oferta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E5983A] hover:bg-[#D4892A] text-[#24211D] text-xs font-bold transition-all shadow-md"
                  >
                    <span>Zobacz wszystkie Skarby Ula</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Opinie Klientów */}
        <section className="py-20 bg-white border-b border-[#E8DECFA0] content-visibility-auto">
          <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 space-y-12`}>
            {/* Header Sekcji Ocen */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF0E1] text-[#8B5337] text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-[#8B5337]" />
                <span>Głosy Naszych Odbiorców</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#23201C] tracking-tight">
                Opinie o Miodach i Skarbach z Pasieki Usza
              </h2>
              <p className="text-xs sm:text-sm text-[#665848] leading-relaxed">
                Nasze zbiory trafiają do domów koneserów w całej Polsce. Poznaj wrażenia osób, które cenią prawdziwy, surowy miód i dary ula prosto z pasieki.
              </p>

              {/* Social Proof Summary Bar */}
              <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-4 sm:px-6 rounded-2xl bg-[#FAF6F0] border border-[#E8DECFA0] text-xs text-[#524434] shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#23201C]">
                  <div className="flex items-center gap-0.5 text-[#E5983A]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span>4.98 / 5.0</span>
                </div>
                <span className="text-[#D0C2B0] hidden sm:inline">•</span>
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#52B788]" />
                  100% Zweryfikowane zakupy
                </span>
                <span className="text-[#D0C2B0] hidden sm:inline">•</span>
                <span className="text-[#7A6E5E]">
                  Pancerne tuby & wysyłka 24h
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev, idx) => {
                const product = HONEY_PRODUCTS.find(p => p.id === rev.productId);
                return (
                  <div 
                    key={idx} 
                    className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 border border-[#E7DCCE] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3.5">
                      {/* Top Meta: Stars, Date, Verified badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[#E5983A]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D6A4F] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                          <span>Zweryfikowany</span>
                        </span>
                      </div>

                      {/* Etykieta kategorii recenzji */}
                      {rev.categoryLabel && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C4609] bg-[#FAF3E5] px-2.5 py-0.5 rounded-md border border-[#D9821E]/20">
                          <span>{rev.categoryLabel}</span>
                        </div>
                      )}

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-[#4A3F33] italic leading-relaxed">
                        „{rev.text}”
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* Author */}
                      <div className="border-t border-[#EFE5D8] pt-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-serif font-bold text-[#23201C] block">
                            {rev.author}
                          </span>
                          <span className="text-[11px] text-[#8A7966]">
                            {rev.location ? `${rev.location} • ` : ''}{rev.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#A69784] font-medium">
                          {rev.date}
                        </span>
                      </div>

                      {/* Connected Product Link */}
                      {product && (
                        <Link
                          to={`/produkt/${product.id}`}
                          className="pt-2 border-t border-[#EFE5D8] flex items-center justify-between gap-2.5 group/prod hover:bg-[#F2E8DC]/60 -mx-2 -mb-2 p-2 rounded-xl transition-all"
                          title={`Zobacz produkt: ${product.name}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white border border-[#E7DCCE] overflow-hidden shrink-0 shadow-2xs">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover/prod:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9.5px] uppercase font-bold text-[#8B5337] tracking-wider block">
                                Kupiony produkt:
                              </span>
                              <span className="text-xs font-serif font-bold text-[#23201C] group-hover/prod:text-[#8B5337] transition-colors truncate block">
                                {product.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#8B5337] shrink-0">
                            <span>od {product.sizes[0]?.pricePln} zł</span>
                            <ArrowRight className="w-3 h-3 group-hover/prod:translate-x-0.5 transition-transform" />
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Standard Quality & FAQ */}
        <div className="content-visibility-auto">
          <HoneyQualitySection containerClass={displayResolution.containerClass} />
        </div>
        <div className="content-visibility-auto">
          <HoneyFAQSection containerClass={displayResolution.containerClass} />
        </div>
      </main>

      <React.Suspense fallback={null}>
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={onAddToCart}
          onOpenCompare={toggleCompare}
        />
        {!onOpenQuiz && (
          <HoneyFinderQuiz
            isOpen={localQuizOpen}
            onClose={() => setLocalQuizOpen(false)}
            onSelectProduct={(p) => setDetailProduct(p)}
          />
        )}
      </React.Suspense>
    </>
  );
};
