import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ProductFilter } from '../components/ProductFilter';
import { FilterState, HoneyCategory, HoneyProduct, HealthIntentFilter } from '../types';
import { ProductCard } from '../components/ProductCard';
import { HONEY_PRODUCTS, HONEY_VARIETIES } from '../data/honeyProducts';
import { useProducts } from '../context/ProductContext';
import { getEnrichedProduct, isProductBestseller, isProductRecommended } from '../utils/honeyHelpers';
import { Sparkles, ArrowUp, ShoppingBag, ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';

const ProductDetailModal = React.lazy(() => import('../components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));

interface ShopPageProps {
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
  toggleCompare: (product: HoneyProduct) => void;
  compareList: HoneyProduct[];
  onOpenQuiz?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  onAddToCart,
  displayResolution,
  toggleCompare,
  compareList,
  onOpenQuiz,
}) => {
  const { honeyVarieties } = useProducts();
  const currentHoneyVarieties = honeyVarieties.length > 0 ? honeyVarieties : HONEY_VARIETIES;
  const [detailProduct, setDetailProduct] = useState<HoneyProduct | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pasieka_shop_mobile_expanded') === 'true';
    } catch {
      return false;
    }
  });

  const setMobileExpandedWithStorage = (expanded: boolean) => {
    setIsMobileExpanded(expanded);
    try {
      sessionStorage.setItem('pasieka_shop_mobile_expanded', expanded ? 'true' : 'false');
    } catch {}
  };

  const urlFlavorNote = searchParams.get('nuta');
  const urlCategory = searchParams.get('kategoria') as HoneyCategory | null;
  const urlHealthIntent = searchParams.get('intencja') as HealthIntentFilter | null;
  const validCategories: HoneyCategory[] = ['wszystkie', 'wiosenne', 'letnie', 'lesne-spadz'];
  const validIntents: HealthIntentFilter[] = ['wszystkie', 'odpornosc', 'lagodne', 'koneser', 'prezent'];
  const initialCategory = urlCategory && validCategories.includes(urlCategory) ? urlCategory : 'wszystkie';
  const initialIntent = urlHealthIntent && validIntents.includes(urlHealthIntent) ? urlHealthIntent : 'wszystkie';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    healthIntent: initialIntent,
    consistency: 'all',
    intensity: 'all',
    flavorNote: urlFlavorNote || null,
    searchQuery: '',
    sortBy: 'popular',
  });

  useEffect(() => {
    const noteParam = searchParams.get('nuta') || null;
    const catParam = searchParams.get('kategoria') as HoneyCategory | null;
    const intentParam = searchParams.get('intencja') as HealthIntentFilter | null;
    const targetCat = catParam && validCategories.includes(catParam) ? catParam : 'wszystkie';
    const targetIntent = intentParam && validIntents.includes(intentParam) ? intentParam : 'wszystkie';

    setFilters(prev => {
      if (
        prev.flavorNote === noteParam &&
        prev.category === targetCat &&
        prev.healthIntent === targetIntent
      ) {
        return prev;
      }
      return {
        ...prev,
        flavorNote: noteParam,
        category: targetCat,
        healthIntent: targetIntent,
      };
    });
  }, [searchParams]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newFilters.flavorNote) next.set('nuta', newFilters.flavorNote);
      else next.delete('nuta');

      if (newFilters.category && newFilters.category !== 'wszystkie') next.set('kategoria', newFilters.category);
      else next.delete('kategoria');

      if (newFilters.healthIntent && newFilters.healthIntent !== 'wszystkie') next.set('intencja', newFilters.healthIntent);
      else next.delete('intencja');

      return next;
    });
  };

  const handleSelectFlavorNote = (note: string | null) => {
    handleFilterChange({
      ...filters,
      flavorNote: filters.flavorNote === note ? null : note,
    });
  };

  const filteredProducts = useMemo(() => {
    let result = [...currentHoneyVarieties];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.flavorNotes.some(n => n.toLowerCase().includes(q)) ||
          p.dominantPlant.toLowerCase().includes(q)
      );
    }

    if (filters.category !== 'wszystkie') {
      result = result.filter(p => p.category === filters.category);
    }

    if (filters.healthIntent && filters.healthIntent !== 'wszystkie') {
      result = result.filter(p => {
        const enriched = getEnrichedProduct(p);
        const benefits = enriched.healthBenefits.map(b => b.toLowerCase());
        const uses = p.recommendedUse.map(u => u.toLowerCase());
        const combined = [...benefits, ...uses].join(' ');

        switch (filters.healthIntent) {
          case 'odpornosc':
            return combined.includes('odporn') || combined.includes('przezięb') || combined.includes('gryp') || combined.includes('infekc') || p.id.includes('lipow') || p.id.includes('nawloc') || p.id.includes('spadz');
          case 'lagodne':
            return p.flavorIntensity === 'lagodny' || p.category === 'wiosenne' || combined.includes('dzieci') || p.id.includes('rzepak') || p.id.includes('akacj');
          case 'koneser':
            return p.flavorIntensity === 'wyrazisty' || p.category === 'lesne-spadz' || p.id.includes('grycz') || p.id.includes('spadz') || p.id.includes('wrzos');
          case 'prezent':
            return isProductBestseller(p) || isProductRecommended(p) || p.isLimitedBatch;
          default:
            return true;
        }
      });
    }

    if (filters.consistency !== 'all') {
      result = result.filter(p => p.consistency === filters.consistency);
    }

    if (filters.intensity !== 'all') {
      result = result.filter(p => p.flavorIntensity === filters.intensity);
    }

    if (filters.flavorNote) {
      result = result.filter(p =>
        p.flavorNotes.some(note => note.toLowerCase() === filters.flavorNote?.toLowerCase())
      );
    }

    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.sizes[0]?.pricePln || 0) - (b.sizes[0]?.pricePln || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.sizes[0]?.pricePln || 0) - (a.sizes[0]?.pricePln || 0));
        break;
      case 'harvest':
        result.sort((a, b) => b.harvestYear - a.harvestYear);
        break;
      case 'popular':
      default:
        result.sort((a, b) => {
          const aScore = (isProductBestseller(a) ? 2 : 0) + (isProductRecommended(a) ? 1 : 0);
          const bScore = (isProductBestseller(b) ? 2 : 0) + (isProductRecommended(b) ? 1 : 0);
          if (bScore !== aScore) return bScore - aScore;
          return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        });
        break;
    }

    return result;
  }, [filters]);

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-8 pb-10 sm:pt-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3 sm:space-y-4`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Sklep Pasieki Wędrownej „Usza”</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
            Prawdziwy miodowy zbiór z Dolnego Śląska
          </h1>
          <p className="text-xs sm:text-base text-[#C7BDB0] max-w-2xl mx-auto leading-relaxed">
            Nie standaryzujemy miodu – każdy słoik to unikatowy zapis kwiatów, pożytków leśnych i pracy naszych pszczół. Wybierz swój ulubiony smak prosto z pasieki w Ciechowie.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 sm:pt-4 text-[11px] sm:text-xs text-[#E5983A]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 100% Surowy miód (RAW)
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Bezpieczna dostawa w tubach
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Gwarancja świeżości
            </span>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="katalog" className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 mt-5 sm:mt-10 space-y-4 sm:space-y-8`}>
        {/* Mobile Compact Helper Bar: fast access to Quiz & Skarby Ula without taking screen height */}
        <div className="grid grid-cols-2 gap-2.5 sm:hidden">
          {onOpenQuiz && (
            <button
              type="button"
              onClick={onOpenQuiz}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FDFBF7] to-[#FAF3EA] border border-[#E7DCCE] flex items-center gap-2 text-left shadow-2xs cursor-pointer active:scale-98 transition-transform"
            >
              <div className="w-8 h-8 rounded-xl bg-[#1B4332] flex items-center justify-center shrink-0 text-white shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#E0A94F]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#23201C] truncate">Quiz Doradca</p>
                <p className="text-[10px] text-[#7A6A58] truncate">Dopasuj miód (60s) →</p>
              </div>
            </button>
          )}
          <Link
            to="/oferta"
            className="p-2.5 rounded-2xl bg-gradient-to-br from-[#FDFBF7] to-[#FAF3EA] border border-[#E7DCCE] flex items-center gap-2 text-left shadow-2xs cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-[#2D2821] flex items-center justify-center shrink-0 text-[#E5983A] shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#23201C] truncate">Skarby Ula</p>
              <p className="text-[10px] text-[#7A6A58] truncate">Pierzga, kit, wosk →</p>
            </div>
          </Link>
        </div>

        {/* Desktop Helper Banners: Quiz & Skarby Ula */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Wirtualny Doradca / Quiz */}
          <div className="bg-gradient-to-br from-[#FDFBF7] to-[#FAF3EA] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1B4332] flex items-center justify-center shrink-0 shadow-2xs text-white">
                <Sparkles className="w-5 h-5 text-[#E0A94F]" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#23201C]">
                  Wirtualny Doradca Miodowy
                </h3>
                <p className="text-xs text-[#6B5E4F] mt-0.5 leading-relaxed">
                  Odpowiedz na 3 proste pytania o Twoje potrzeby i smak – wskażemy idealny słoik dla Ciebie lub na prezent.
                </p>
              </div>
            </div>
            <div className="pt-1 flex justify-end">
              {onOpenQuiz && (
                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <span>Rozwiąż Quiz (60 sek.)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Skarby Ula */}
          <div className="bg-gradient-to-br from-[#FDFBF7] to-[#FAF3EA] border border-[#E7DCCE] rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#2D2821] flex items-center justify-center shrink-0 shadow-2xs text-[#E5983A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#23201C]">
                  Szukasz propolisu, pierzgi lub świec?
                </h3>
                <p className="text-xs text-[#6B5E4F] mt-0.5 leading-relaxed">
                  Poznaj naturalne dary ula o wybitnych właściwościach regenerujących, probiotycznych i prozdrowotnych.
                </p>
              </div>
            </div>
            <div className="pt-1 flex justify-end">
              <Link
                to="/oferta"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              >
                <span>Poznaj Skarby Ula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          totalCount={currentHoneyVarieties.length}
          filteredCount={filteredProducts.length}
          totalProductsCount={currentHoneyVarieties.length}
          filteredProductsCount={filteredProducts.length}
        />

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onOpenDetails={setDetailProduct}
                    onOpenDetail={setDetailProduct}
                    onToggleCompare={toggleCompare}
                    isCompared={compareList.some(p => p.id === product.id)}
                    onSelectFlavorNote={handleSelectFlavorNote}
                    activeFlavorNote={filters.flavorNote}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-[#FAF8F5] rounded-3xl border border-[#E7DCCE] space-y-3">
            <span className="text-3xl">🔍</span>
            <h3 className="font-serif text-lg font-bold text-[#23201C]">
              Nie znaleźliśmy produktu o takich parametrach
            </h3>
            <p className="text-xs text-[#716556] max-w-sm mx-auto">
              Spróbuj zmienić filtry lub wyczyścić pole wyszukiwania, by zobaczyć pełną ofertę pasieki.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() =>
                  handleFilterChange({
                    category: 'wszystkie',
                    consistency: 'all',
                    intensity: 'all',
                    flavorNote: null,
                    searchQuery: '',
                    sortBy: 'popular',
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#2D2821] text-[#FAF5ED] text-xs font-semibold hover:bg-[#433B31] cursor-pointer transition-colors"
              >
                Resetuj filtry
              </button>
              {onOpenQuiz && (
                <button
                  onClick={onOpenQuiz}
                  className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#143326] cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E0A94F]" />
                  <span>Rozwiąż quiz i dobierz miód</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Modal szczegółów produktu */}
      <React.Suspense fallback={null}>
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onAddToCart={onAddToCart}
          onOpenCompare={toggleCompare}
          onSelectFlavorNote={handleSelectFlavorNote}
        />
      </React.Suspense>
    </main>
  );
};
