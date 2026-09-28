import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { HONEY_PRODUCTS, HONEY_VARIETIES, HIVE_TREASURES } from '../data/honeyProducts';
import { HoneyProduct } from '../types';
import { getEnrichedProduct, CATEGORY_METADATA } from '../utils/honeyHelpers';
import { ProductReviews } from '../components/ProductReviews';
import { 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Leaf, 
  Star, 
  FileText, 
  Heart, 
  Clock, 
  Truck, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Droplet,
  Beaker,
  MessageSquare,
  AlertCircle,
  Scale,
  HelpCircle,
  Info,
  ShieldAlert,
  Utensils,
  Calendar,
  ChevronDown,
  BookOpen
} from 'lucide-react';

import { useProducts } from '../context/ProductContext';

interface ProductPageProps {
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number, subscriptionInterval?: number) => void;
  onOpenCompare?: (product: HoneyProduct) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onAddToCart, onOpenCompare }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lenis = useLenis();
  const { getProductById, honeyVarieties, hiveTreasures } = useProducts();

  const rawProduct = getProductById(id || '') || HONEY_PRODUCTS.find((p) => p.id === id);

  useLayoutEffect(() => {
    setActiveTab('opis');
    setSelectedSizeIdx(0);
    setActiveImageIndex(0);
    setIsSensoryExpandedMobile(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

    const resetScroll = () => {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true });
        lenis.resize();
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    const t1 = setTimeout(resetScroll, 30);
    const t2 = setTimeout(resetScroll, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [id, lenis]);

  if (!rawProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#FAF6EE]">
        <h1 className="text-3xl font-serif font-bold text-[#241D17] mb-4">Nie znaleziono miodu</h1>
        <p className="text-[#594D42] mb-8">Miód, którego szukasz, mógł zostać wyprzedany lub adres jest niepoprawny.</p>
        <Link to="/" className="px-6 py-3 bg-[#1B4332] text-white rounded-xl font-bold hover:bg-[#143326] transition-colors">
          Wróć do katalogu miodów
        </Link>
      </div>
    );
  }

  const product = getEnrichedProduct(rawProduct);
  const isTreasure = product.productType !== 'honey';
  const prodType = product.productType;

  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'opis' | 'zdrowie' | 'kulinaria' | 'badania' | 'opinie'>('opis');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showConsistencyExplainer, setShowConsistencyExplainer] = useState(false);

  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscription'>('one-time');
  const [subscriptionInterval, setSubscriptionInterval] = useState<30 | 60 | 90>(60);
  const [isSensoryExpandedMobile, setIsSensoryExpandedMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Sticky Add To Cart visibility state & IntersectionObserver targeting the primary button
  const mainBuyButtonRef = useRef<HTMLButtonElement>(null);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);

  useEffect(() => {
    const target = mainBuyButtonRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Pasek pojawia się natychmiast w ułamku sekundy, gdy tylko dolna krawędź przycisku opuści ekran
        const isPastButton = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        setIsStickyBarVisible(isPastButton);
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  
  // Knowledge card tabs horizontal scroll state & affordance
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(true);

  const checkTabsScroll = () => {
    if (!tabsContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
    setCanScrollTabsLeft(scrollLeft > 10);
    setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkTabsScroll();
    const el = tabsContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkTabsScroll, { passive: true });
      window.addEventListener('resize', checkTabsScroll);
      return () => {
        el.removeEventListener('scroll', checkTabsScroll);
        window.removeEventListener('resize', checkTabsScroll);
      };
    }
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsContainerRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const currentSize = product.sizesList[selectedSizeIdx] || product.sizesList[0];
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const activeImage = images[activeImageIndex] || images[0];

  const basePrice = currentSize?.price || 0;
  const effectivePrice = purchaseMode === 'subscription' ? Math.round(basePrice * 0.9) : basePrice;

  // Related products - strictly isolate honey varieties vs. hive treasures
  const candidatePool = isTreasure 
    ? (hiveTreasures.length > 0 ? hiveTreasures : HIVE_TREASURES) 
    : (honeyVarieties.length > 0 ? honeyVarieties : HONEY_VARIETIES);
  const relatedProducts = [...candidatePool]
    .filter(p => p.id !== rawProduct.id)
    .sort((a, b) => {
      const aNotes = a.flavorNotes || [];
      const rawNotes = rawProduct.flavorNotes || [];
      const aSharedNotes = aNotes.filter(n => rawNotes.includes(n)).length;
      const bNotes = b.flavorNotes || [];
      const bSharedNotes = bNotes.filter(n => rawNotes.includes(n)).length;
      if (bSharedNotes !== aSharedNotes) return bSharedNotes - aSharedNotes;
      const aCat = a.category === rawProduct.category ? 1 : 0;
      const bCat = b.category === rawProduct.category ? 1 : 0;
      return bCat - aCat;
    })
    .slice(0, 3)
    .map(getEnrichedProduct);

  const handleAddToCart = () => {
    if (!currentSize) return;
    onAddToCart(
      rawProduct, 
      currentSize.weightGrams, 
      effectivePrice,
      purchaseMode === 'subscription' ? subscriptionInterval : undefined
    );
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleBackToCatalog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isTreasure) {
      navigate('/skarby-ula');
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/sklep');
    }
  };

  const pricePerKg = currentSize && currentSize.weightGrams > 10 ? Math.round((effectivePrice / currentSize.weightGrams) * 1000) : 0;
  const catInfo = isTreasure
    ? {
        label: 'Skarby Ula',
        shortLabel: 'Skarby Ula',
        icon: prodType === 'bee-colony' ? '🐝' : prodType === 'candle' ? '🕯️' : '🌿',
      }
    : (CATEGORY_METADATA[product.category] || {
        label: product.category,
        shortLabel: product.category,
        icon: '🍯',
      });

  // Reusable Product Header (Category badge, Region, Title, Botanical source, Rating stars)
  const renderProductHeader = () => (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3E5] text-[#8C4609] border border-[#D9821E]/25 shadow-2xs">
          {prodType === 'bee-colony' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              <span>Pasieka hodowlana</span>
              <span className="text-[#D9821E]/50">•</span>
              <span className="text-[#1B4332] font-semibold">Sezon 2026</span>
            </>
          ) : prodType === 'candle' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              <span>100% naturalny wosk pszczeli</span>
              <span className="text-[#D9821E]/50">•</span>
              <span className="text-[#1B4332] font-semibold">Rękodzieło</span>
            </>
          ) : prodType === 'apitherapy' ? (
            <>
              <Leaf className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Czysty dar ula</span>
              <span className="text-[#D9821E]/50">•</span>
              <span className="text-[#1B4332] font-semibold">Świeży zbiór {product.harvestYear}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              <span>Miód surowy (raw)</span>
              <span className="text-[#D9821E]/50">•</span>
              <span className="text-[#1B4332] font-semibold">Świeży zbiór {product.harvestYear}</span>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#241D17] leading-tight mb-1.5 sm:mb-2">
        {product.name}
      </h1>

      <p className="text-xs sm:text-sm italic text-[#7A6A5A] mb-2.5 sm:mb-3">
        {prodType === 'bee-colony' 
          ? 'Rasa i linia pszczół: ' 
          : prodType === 'candle' 
          ? 'Surowiec manufaktury: ' 
          : prodType === 'apitherapy' 
          ? 'Pochodzenie i surowiec: ' 
          : 'Nektar botaniczny: '}
        <span className="font-serif font-semibold text-[#594D42] not-italic">{product.botanicalSource}</span>
      </p>

      {/* Rating & Reviews anchor */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="flex items-center text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} 
            />
          ))}
        </div>
        <span className="text-sm font-bold text-[#241D17]">{product.rating.toFixed(1)}</span>
        <span className="text-xs text-[#7A6A5A]">
          ({product.reviewsCount} zweryfikowanych opinii)
        </span>
        <button
          type="button"
          onClick={() => {
            setActiveTab('opinie');
            if (lenis) {
              lenis.scrollTo('#tabs-section');
            } else {
              document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="text-xs text-[#D9821E] hover:underline cursor-pointer ml-1 font-semibold"
        >
          Zobacz recenzje →
        </button>
      </div>
    </div>
  );

  // Reusable Flavor Notes Chips or Specification Chips
  const renderSpecificationBadges = () => {
    if (prodType === 'bee-colony') {
      const colonyHighlights = [
        '5 ramek wielkopolskich',
        'Matka unasieniona 2026',
        'Zwarte, zdrowe czerwienie',
        'Wysoka łagodność pszczół',
        'Szkolenie przy ulu w cenie',
        'Nadzór PLW: WNI 28143502',
      ];
      return (
        <div className="bg-[#FAF3E5]/70 p-4 rounded-2xl border border-[#D9821E]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#594D42] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              Specyfikacja rodziny i pakietu:
            </span>
            <span className="text-[11px] text-[#1B4332] font-semibold hidden sm:inline">Gotowy do zasiedlenia ula</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colonyHighlights.map((feat, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-white text-[#1B4332] border border-[#1B4332]/25 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Check className="w-3 h-3 text-[#D9821E]" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (prodType === 'candle') {
      const candleHighlights = [
        'Ujemna jonizacja powietrza',
        '100% czysty wosk pszczeli',
        'Brak syntetycznej parafiny',
        'Knot z surowej bawełny',
        'Miodowo-propolisowy zapach',
        'Czyste, bezdymne spalanie',
      ];
      return (
        <div className="bg-[#FAF3E5]/70 p-4 rounded-2xl border border-[#D9821E]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#594D42] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              Zalety naturalnego wosku pszczelego:
            </span>
            <span className="text-[11px] text-[#8C4609] font-semibold hidden sm:inline">Zdrowy mikroklimat w domu</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {candleHighlights.map((feat, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-white text-[#8C4609] border border-[#D9821E]/30 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#D9821E]" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (prodType === 'apitherapy') {
      const apitherapyHighlights = product.id === 'propolis-kit'
        ? ['Ponad 300 bioflawonoidów', 'Naturalny antybiotyk ula', 'Estry kwasu kawowego (CAPE)', 'Działanie przeciwbakteryjne', 'Regeneracja tkanek']
        : product.id === 'pierzga-pszczela'
        ? ['Kwas mlekowy z plastra', '3x wyższa przyswajalność', 'Bomba witamin i enzymów', 'Komplet aminokwasów', 'Wzmocnienie krwi i hemoglobiny']
        : ['Bomba witaminowa i białkowa', 'Ponad 250 biopierwiastków', 'Wsparcie serca i naczyń', 'Likwidacja chronicznego zmęczenia', '100% obnóża pyłkowe'];

      return (
        <div className="bg-[#FAF3E5]/70 p-4 rounded-2xl border border-[#D9821E]/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#594D42] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
              Aktywne związki biologiczne & działanie:
            </span>
            <span className="text-[11px] text-[#1B4332] font-semibold hidden sm:inline">100% czysta apiterapia</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {apitherapyHighlights.map((feat, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-white text-[#594D42] border border-[#D9821E]/25 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5"
              >
                <Leaf className="w-3 h-3 text-[#1B4332]" />
                <span>{feat}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }

    // Default honey flavor notes
    return product.flavorNotes && product.flavorNotes.length > 0 ? (
      <div className="bg-[#FAF3E5]/70 p-4 rounded-2xl border border-[#D9821E]/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#594D42] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
            Dominujące nuty smakowe i aromatyczne:
          </span>
          <span className="text-[11px] text-[#8C7A6B] font-medium hidden sm:inline">Kliknij nutę, aby filtrować katalog</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.flavorNotes.map((note, idx) => (
            <button 
              key={idx}
              type="button"
              onClick={() => navigate(`/sklep?nuta=${encodeURIComponent(note)}`)}
              className="px-3.5 py-1.5 bg-white hover:bg-[#1B4332] text-[#594D42] hover:text-white border border-[#D9821E]/30 hover:border-[#1B4332] rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer group"
              title={`Zobacz wszystkie miody z nutą: ${note}`}
            >
              <Sparkles className="w-3 h-3 text-[#D9821E] group-hover:text-[#F3C06B] transition-colors" />
              <span>{note}</span>
              <span className="text-[10px] text-[#8C7A6B] group-hover:text-white/80 ml-0.5">🔍</span>
            </button>
          ))}
        </div>
      </div>
    ) : null;
  };

  // Reusable Sensory Profile or Specification Card
  const renderSensoryAndShipping = () => {
    if (prodType === 'bee-colony') {
      return (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#1B4332]/25 shadow-sm overflow-hidden space-y-2">
          {/* Header */}
          <button
            type="button"
            onClick={() => setIsSensoryExpandedMobile(prev => !prev)}
            className="w-full text-left flex items-center justify-between gap-3 cursor-pointer select-none pb-1"
            aria-expanded={isSensoryExpandedMobile}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-[#1B4332]/20 flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs font-bold">
                🐝
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-[#241D17] text-sm sm:text-base leading-tight">
                    Karta Specyfikacji Odkładu Pszczelego
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 uppercase tracking-wider hidden xs:inline">
                    Nadzór PLW
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7A6A5A] truncate mt-0.5">
                  Pasieka Zarodowo-Produkcyjna Ciechów
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-[#1B4332] hidden sm:inline">
                {isSensoryExpandedMobile ? 'Zwiń specyfikację' : 'Rozwiń specyfikację'}
              </span>
              <div className={`w-8 h-8 rounded-full bg-[#FAF5ED] hover:bg-[#F3E7D3] border border-[#E7DCCE] flex items-center justify-center text-[#8C5815] transition-all duration-300 shadow-2xs ${isSensoryExpandedMobile ? 'bg-[#F2E4CF] border-[#1B4332]' : ''}`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSensoryExpandedMobile ? 'rotate-180 text-[#1B4332]' : ''}`} />
              </div>
            </div>
          </button>

          {/* 3 Prominent Metric Badges when collapsed */}
          {!isSensoryExpandedMobile && (
            <div 
              onClick={() => setIsSensoryExpandedMobile(true)}
              className="pt-1.5 pb-1 cursor-pointer select-none animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FFF8EB] border border-[#E8CBA3] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8C4609] uppercase tracking-wider block">
                    Gniazdo
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#7A3600] block truncate">5 ramek</span>
                    <span className="text-[10px] text-[#A37346] block truncate">Wielkopolskie</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#F4F9F4] border border-[#BBDCBF] flex flex-col justify-between shadow-2xs hover:border-[#1B4332] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block">
                    Królowa
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#143727] block truncate">Matka 2026</span>
                    <span className="text-[10px] text-[#628573] block truncate">Znakowana</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FCF6ED] border border-[#E8D6B7] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8F5917] uppercase tracking-wider block">
                    Szkolenie
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#784407] block truncate">1h w pasiece</span>
                    <span className="text-[10px] text-[#9C7D54] block truncate">W cenie</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full content when expanded */}
          {isSensoryExpandedMobile && (
            <div className="pt-3 border-t border-[#1B4332]/15 space-y-3 sm:space-y-4 block animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#1B4332] text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                    <span>Format gniazda i ramki</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    <strong>5 ramek wielkopolskich</strong> (3 ramki z czerwiem krytym i odkrytym w różnym wieku, 2 ramki osłonowe z miodem i pierzgą).
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#D9821E] text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D9821E]" />
                    <span>Matka pszczela (Królowa)</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Młoda, znakowana opalitkiem rocznika 2026, <strong>unasieniona naturalnie</strong>, po teście plenności (zwarty, równomierny czerw).
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#594D42] text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                    <span>Cechy linii pszczół</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Linia Krainka / Buckfast selekcjonowana na <strong>wyjątkową łagodność</strong>, nierojliwość oraz dynamiczny rozwój i wysoką miodność.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#8C4609] text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#8C4609]" />
                    <span>Instruktaż w pasiece</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    W cenie odkładu: <strong>1-godzinne szkolenie praktyczne</strong> przy otwartym ulu podczas odbioru. Pomoc i doradztwo dla początkujących.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Termin i warunki odbioru:</strong> Czerwiec – Lipiec 2026. Odbiór osobisty w pasiece Ciechów w bezpiecznym, wentylowanym kartonie transportowym.
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsSensoryExpandedMobile(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-[#1B4332] bg-[#FAF5ED] hover:bg-[#F3E7D3] rounded-full border border-[#E7DCCE] cursor-pointer shadow-2xs transition-colors"
                >
                  <span>Zwiń specyfikację odkładu</span>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180 text-[#1B4332]" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (prodType === 'candle') {
      return (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D9821E]/25 shadow-sm overflow-hidden space-y-2">
          {/* Header */}
          <button
            type="button"
            onClick={() => setIsSensoryExpandedMobile(prev => !prev)}
            className="w-full text-left flex items-center justify-between gap-3 cursor-pointer select-none pb-1"
            aria-expanded={isSensoryExpandedMobile}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-800 border border-[#D9821E]/20 flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs font-bold">
                🕯️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-[#241D17] text-sm sm:text-base leading-tight">
                    Karta Manufaktury Świec Woskowych
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#D9821E]/15 text-[#8C4609] border border-[#D9821E]/25 uppercase tracking-wider hidden xs:inline">
                    Zero Parafiny
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7A6A5A] truncate mt-0.5">
                  100% Czysty Wosk Pszczeli z Pasieki
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-[#D9821E] hidden sm:inline">
                {isSensoryExpandedMobile ? 'Zwiń właściwości' : 'Rozwiń właściwości'}
              </span>
              <div className={`w-8 h-8 rounded-full bg-[#FAF5ED] hover:bg-[#F3E7D3] border border-[#E7DCCE] flex items-center justify-center text-[#8C5815] transition-all duration-300 shadow-2xs ${isSensoryExpandedMobile ? 'bg-[#F2E4CF] border-[#D9821E]' : ''}`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSensoryExpandedMobile ? 'rotate-180 text-[#D9821E]' : ''}`} />
              </div>
            </div>
          </button>

          {/* 3 Prominent Metric Badges when collapsed */}
          {!isSensoryExpandedMobile && (
            <div 
              onClick={() => setIsSensoryExpandedMobile(true)}
              className="pt-1.5 pb-1 cursor-pointer select-none animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FFF8EB] border border-[#E8CBA3] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8C4609] uppercase tracking-wider block">
                    Surowiec
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#7A3600] block truncate">100% Cera</span>
                    <span className="text-[10px] text-[#A37346] block truncate">Wosk pszczeli</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#F4F9F4] border border-[#BBDCBF] flex flex-col justify-between shadow-2xs hover:border-[#1B4332] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block">
                    Jonizacja
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#143727] block truncate">Jony ujemne</span>
                    <span className="text-[10px] text-[#628573] block truncate">Oczyszcza</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FCF6ED] border border-[#E8D6B7] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8F5917] uppercase tracking-wider block">
                    Płomień
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#784407] block truncate">Do 3x dłużej</span>
                    <span className="text-[10px] text-[#9C7D54] block truncate">Bez sadzy</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full content when expanded */}
          {isSensoryExpandedMobile && (
            <div className="pt-3 border-t border-[#D9821E]/15 space-y-3 sm:space-y-4 block animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#1B4332] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#1B4332]" />
                    <span>Ujemna jonizacja powietrza</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Płomień wosku pszczelego emituje jony ujemne, które oczyszczają powietrze z kurzu, smogu elektromagnetycznego i alergenów.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#D9821E] text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#D9821E]" />
                    <span>Wydłużony czas palenia</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Wosk pszczeli pali się do 3x dłużej niż syntetyczna parafina. Płomień jest jasny, ciepły i nie wydziela szkodliwego dymu.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#8C4609] text-xs flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-[#8C4609]" />
                    <span>100% Naturalny surowiec</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Pochodzi z dziewiczej węzy i odsklepin naszej pasieki. Brak sztucznych barwników, substancji ropopochodnych i ołowianych knotów.
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#594D42] text-xs flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#C1382B]" />
                    <span>Naturalny zapach ula</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    Podczas palenia w pokoju unosi się kojący, delikatny zapach naturalnego miodu i propolisu, ułatwiający relaks i sen.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsSensoryExpandedMobile(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-[#8C5815] bg-[#FAF5ED] hover:bg-[#F3E7D3] rounded-full border border-[#E7DCCE] cursor-pointer shadow-2xs transition-colors"
                >
                  <span>Zwiń właściwości świecy</span>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180 text-[#D9821E]" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (prodType === 'apitherapy') {
      const isPropolis = product.id === 'propolis-kit';
      const isPierzga = product.id === 'pierzga-pszczela';

      const cardTitle = isPropolis
        ? 'Karta Czystości & Mocy Propolisu'
        : isPierzga
        ? 'Karta Biologiczna Pierzgi Pszczelej'
        : 'Karta Witaminowa Obnóży Pyłkowych';

      const cardSubtitle = isPropolis
        ? 'Surowy kit pszczeli z żywic drzew leśnych'
        : isPierzga
        ? 'Chleb pszczeli – fermentowany pyłek z komórek plastra'
        : 'Wielobarwne ziarna pyłkowe z kwitnących łąk Warmii';

      const cardBadge = isPropolis
        ? '100% Kit Pszczeli'
        : isPierzga
        ? 'Najwyższa Biodostępność'
        : 'Bogactwo Biopierwiastków';

      const pill1Title = isPropolis ? 'Flawonoidy' : isPierzga ? 'Fermentacja' : '22% Białka';
      const pill1Value = isPropolis ? '300+ związków' : isPierzga ? 'Kwas mlekowy' : 'Aminokwasy';
      const pill1Sub = isPropolis ? 'CAPE i polifenole' : isPierzga ? 'Ciepło ula' : 'Pełen aminogram';

      const pill2Title = isPropolis ? 'Nalewka 20%' : isPierzga ? 'Wchłanianie' : 'Żywe enzymy';
      const pill2Value = isPropolis ? 'Baza spirytusowa' : isPierzga ? 'Przyswajalność >85%' : 'Suszenie <38°C';
      const pill2Sub = isPropolis ? 'Ekstrakt leczniczy' : isPierzga ? '3x szybciej' : '100% aktywności';

      const pill3Title = isPropolis ? 'Bioaktywność' : isPierzga ? 'Witalność' : 'Aktywacja';
      const pill3Value = isPropolis ? 'Tarcza ula' : isPierzga ? 'Odbudowa' : 'Namaczanie';
      const pill3Sub = isPropolis ? 'Naturalny antybiotyk' : isPierzga ? 'Żelazo i enzymy' : 'Min. 6 godzin';

      const box1Title = isPropolis ? 'Flawonoidy i CAPE' : isPierzga ? 'Fermentacja mlekowa' : '22% Białka roślinnego';
      const box1Text = isPropolis
        ? 'Ponad 300 związków fenolowych i estrów kwasu kawowego o silnym działaniu antybakteryjnym.'
        : isPierzga
        ? 'Naturalnie zakiszona w cieple ula. Kwas mlekowy rozpuszcza twarde otoczki pyłku.'
        : 'Komplet aminokwasów egzogennych i biopierwiastków niezbędnych do odbudowy tkanek.';

      const box2Title = isPropolis ? 'Baza do nalewki 20%' : isPierzga ? 'Przyswajalność > 85%' : 'Reżim suszenia < 38°C';
      const box2Text = isPropolis
        ? 'Idealny surowiec do sporządzenia domowej nalewki spirytusowej (maceracja 2-3 tygodnie).'
        : isPierzga
        ? '3-krotnie szybsze i pełniejsze wchłanianie witamin i mikroelementów niż ze zwykłego pyłku.'
        : 'Powolne suszenie mikronawiewem – żywe enzymy ulowe zachowują 100% aktywności.';

      const box3Title = isPropolis ? 'Naturalny antybiotyk' : isPierzga ? 'Odbudowa hemoglobiny' : 'Zasada namaczania';
      const box3Text = isPropolis
        ? 'Skuteczna ochrona jamy ustnej i gardła bez wywoływania zjawiska lekooporności bakterii.'
        : isPierzga
        ? 'Potężna dawka łatwo przyswajalnego żelaza przy anemii, rekonwalescencji i wyczerpaniu.'
        : 'Namoczenie w letniej wodzie na noc (min. 6h) powoduje pęknięcie ziaren i uwolnienie witamin.';

      const box4Title = isPropolis ? 'Przechowywanie kitu' : isPierzga ? 'Rytuał przyjmowania' : 'Zalecany cykl kuracji';
      const box4Text = isPropolis
        ? 'Szczelny słój, suche i ciemne miejsce poniżej 20°C. Kit nie traci właściwości przez lata.'
        : isPierzga
        ? '1 łyżeczka rano na czczo – powoli rozgryzać, by enzymy wchłaniały się już pod językiem.'
        : '1-2 łyżeczki dziennie w cyklach 30-dniowych, szczególnie w okresach przesilenia.';

      return (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D9821E]/25 shadow-sm overflow-hidden space-y-2">
          {/* Header */}
          <button
            type="button"
            onClick={() => setIsSensoryExpandedMobile(prev => !prev)}
            className="w-full text-left flex items-center justify-between gap-3 cursor-pointer select-none pb-1"
            aria-expanded={isSensoryExpandedMobile}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-900 border border-[#D9821E]/20 flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs font-bold">
                {isPropolis ? '🛡️' : isPierzga ? '👑' : '🌸'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-[#241D17] text-sm sm:text-base leading-tight">
                    {cardTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 uppercase tracking-wider hidden xs:inline">
                    {cardBadge}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#7A6A5A] truncate mt-0.5">{cardSubtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-[#D9821E] hidden sm:inline">
                {isSensoryExpandedMobile ? 'Zwiń właściwości' : 'Rozwiń właściwości'}
              </span>
              <div className={`w-8 h-8 rounded-full bg-[#FAF5ED] hover:bg-[#F3E7D3] border border-[#E7DCCE] flex items-center justify-center text-[#8C5815] transition-all duration-300 shadow-2xs ${isSensoryExpandedMobile ? 'bg-[#F2E4CF] border-[#D9821E]' : ''}`}>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSensoryExpandedMobile ? 'rotate-180 text-[#D9821E]' : ''}`} />
              </div>
            </div>
          </button>

          {/* 3 Prominent Metric Badges when collapsed */}
          {!isSensoryExpandedMobile && (
            <div 
              onClick={() => setIsSensoryExpandedMobile(true)}
              className="pt-1.5 pb-1 cursor-pointer select-none animate-in fade-in duration-200"
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FFF8EB] border border-[#E8CBA3] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8C4609] uppercase tracking-wider block">
                    {pill1Title}
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#7A3600] block truncate">{pill1Value}</span>
                    <span className="text-[10px] text-[#A37346] block truncate">{pill1Sub}</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#F4F9F4] border border-[#BBDCBF] flex flex-col justify-between shadow-2xs hover:border-[#1B4332] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block">
                    {pill2Title}
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#143727] block truncate">{pill2Value}</span>
                    <span className="text-[10px] text-[#628573] block truncate">{pill2Sub}</span>
                  </div>
                </div>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FCF6ED] border border-[#E8D6B7] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8F5917] uppercase tracking-wider block">
                    {pill3Title}
                  </span>
                  <div className="mt-1">
                    <span className="text-xs sm:text-sm font-extrabold text-[#784407] block truncate">{pill3Value}</span>
                    <span className="text-[10px] text-[#9C7D54] block truncate">{pill3Sub}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full content when expanded */}
          {isSensoryExpandedMobile && (
            <div className="pt-3 border-t border-[#D9821E]/15 space-y-3 sm:space-y-4 block animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#1B4332] text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                    <span>{box1Title}</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    {box1Text}
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#D9821E] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D9821E]" />
                    <span>{box2Title}</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    {box2Text}
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#8C4609] text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#8C4609]" />
                    <span>{box3Title}</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    {box3Text}
                  </p>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] space-y-1">
                  <div className="font-bold text-[#594D42] text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                    <span>{box4Title}</span>
                  </div>
                  <p className="text-[11px] text-[#594D42] leading-relaxed">
                    {box4Text}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsSensoryExpandedMobile(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-[#8C5815] bg-[#FAF5ED] hover:bg-[#F3E7D3] rounded-full border border-[#E7DCCE] cursor-pointer shadow-2xs transition-colors"
                >
                  <span>Zwiń właściwości biologiczne</span>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180 text-[#D9821E]" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default honey sensory card
    return (
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D9821E]/25 shadow-sm overflow-hidden space-y-2">
        {/* Header - standard e-commerce accordion header with full row clickability & fixed top-right chevron button */}
        <button
          type="button"
          onClick={() => setIsSensoryExpandedMobile(prev => !prev)}
          className="w-full text-left flex items-center justify-between gap-3 cursor-pointer select-none pb-1"
          aria-expanded={isSensoryExpandedMobile}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FAF3E5] border border-[#D9821E]/20 flex items-center justify-center text-sm sm:text-base shrink-0 shadow-2xs">
              🍯
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-[#241D17] text-sm sm:text-base leading-tight">
                  Profil sensoryczny odmiany
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 uppercase tracking-wider hidden xs:inline">
                  Autentyczna Partia
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#7A6A5A] truncate mt-0.5">
                Karta degustacyjna ulowego nektaru
              </p>
            </div>
          </div>

          {/* Consistent Fixed-Position Toggle Button on Far Right (Standard Top-Tier Accordion) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-[#D9821E] hidden sm:inline">
              {isSensoryExpandedMobile ? 'Zwiń wykres' : 'Rozwiń wykres'}
            </span>
            <div className={`w-8 h-8 rounded-full bg-[#FAF5ED] hover:bg-[#F3E7D3] border border-[#E7DCCE] flex items-center justify-center text-[#8C5815] transition-all duration-300 shadow-2xs ${isSensoryExpandedMobile ? 'bg-[#F2E4CF] border-[#D9821E]' : ''}`}>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSensoryExpandedMobile ? 'rotate-180 text-[#D9821E]' : ''}`} />
            </div>
          </div>
        </button>

        {/* 3 Prominent Sensory Metric Badges: visible ONLY when collapsed to prevent duplicate scales */}
        {!isSensoryExpandedMobile && (
          <div 
            onClick={() => setIsSensoryExpandedMobile(true)}
            className="pt-1.5 pb-1 cursor-pointer select-none animate-in fade-in duration-200"
          >
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Pigułka 1: Słodycz */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FFF8EB] border border-[#E8CBA3] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8C4609] uppercase tracking-wider block">
                  Słodycz
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm sm:text-base font-extrabold text-[#7A3600]">
                    {product.tasteProfile.sweetness}<span className="text-[10px] sm:text-[11px] font-normal text-[#A37346]">/5</span>
                  </span>
                  <div className="flex gap-0.5" title={`${product.tasteProfile.sweetness} na 5`}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span 
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${dot <= product.tasteProfile.sweetness ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pigułka 2: Rześkość */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#F4F9F4] border border-[#BBDCBF] flex flex-col justify-between shadow-2xs hover:border-[#1B4332] transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#1B4332] uppercase tracking-wider block">
                  Rześkość
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm sm:text-base font-extrabold text-[#143727]">
                    {product.tasteProfile.acidity}<span className="text-[10px] sm:text-[11px] font-normal text-[#628573]">/5</span>
                  </span>
                  <div className="flex gap-0.5" title={`${product.tasteProfile.acidity} na 5`}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span 
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${dot <= product.tasteProfile.acidity ? 'bg-[#1B4332]' : 'bg-[#D0E2D2]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pigułka 3: Aromat */}
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#FCF6ED] border border-[#E8D6B7] flex flex-col justify-between shadow-2xs hover:border-[#D9821E] transition-colors">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#8F5917] uppercase tracking-wider block">
                  Aromat
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm sm:text-base font-extrabold text-[#784407]">
                    {product.tasteProfile.aroma}<span className="text-[10px] sm:text-[11px] font-normal text-[#9C7D54]">/5</span>
                  </span>
                  <div className="flex gap-0.5" title={`${product.tasteProfile.aroma} na 5`}>
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <span 
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${dot <= product.tasteProfile.aroma ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content: Visible when expanded */}
        {isSensoryExpandedMobile && (
          <div className="pt-3 border-t border-[#D9821E]/15 space-y-3 sm:space-y-4 block animate-in fade-in duration-200">
            {/* Paski sensoryczne: Słodycz, Kwasowość, Aromat */}
            <div className="space-y-3 pt-1">
              {/* Poziom słodyczy */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#594D42]">Poziom słodyczy</span>
                  <span className="font-bold text-[#8C4609]">{product.tasteProfile.sweetness} / 5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        lvl <= product.tasteProfile.sweetness ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[#7A6A5A]">
                  {product.tasteProfile.sweetness <= 2 ? 'Wytrawny, mało słodki' : product.tasteProfile.sweetness <= 4 ? 'Umiarkowanie zbalansowany' : 'Głęboka, aksamitna słodycz'}
                </p>
              </div>

              {/* Kwasowość / Rześkość */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#594D42]">Kwasowość / Rześkość</span>
                  <span className="font-bold text-[#1B4332]">{product.tasteProfile.acidity} / 5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        lvl <= product.tasteProfile.acidity ? 'bg-[#1B4332]' : 'bg-[#D0E2D2]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[#7A6A5A]">
                  {product.tasteProfile.acidity <= 2 ? 'Łagodny, maślany finisz' : 'Rześka, świeża nuta cytrusowo-kwiatowa'}
                </p>
              </div>

              {/* Intensywność aromatu */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#594D42]">Intensywność aromatu</span>
                  <span className="font-bold text-[#D9821E]">{product.tasteProfile.aroma} / 5</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        lvl <= product.tasteProfile.aroma ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[#7A6A5A]">
                  Wyraźny bukiet wyczuwalny natychmiast po odkręceniu słoika.
                </p>
              </div>
            </div>

            {/* Barwa & Krystalizacja - 2 kompaktowe boksy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] text-xs space-y-1">
                <span className="font-bold text-[#8C4609] text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D9821E]" />
                  Krystalizacja
                </span>
                <p className="text-[11px] text-[#594D42] leading-tight">{product.tasteProfile.crystallization}</p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] text-xs space-y-1">
                <span className="font-bold text-[#1B4332] text-[11px] flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-[#1B4332]" />
                  Barwa miodu
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/25 shrink-0 shadow-2xs"
                    style={{ backgroundColor: product.colorHex }}
                  />
                  <p className="text-[11px] text-[#594D42] leading-tight font-medium">{product.tasteProfile.color}</p>
                </div>
              </div>
            </div>

            {/* Bottom close trigger button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setIsSensoryExpandedMobile(false)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold text-[#8C5815] bg-[#FAF5ED] hover:bg-[#F3E7D3] rounded-full border border-[#E7DCCE] cursor-pointer shadow-2xs transition-colors"
              >
                <span>Zwiń wykres sensoryczny</span>
                <ChevronDown className="w-3.5 h-3.5 rotate-180 text-[#D9821E]" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#FAF6EE] min-h-screen pt-4 pb-28 lg:pb-28 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Quick Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 sm:mb-6">
        
        {/* MOBILE ONLY (< sm): Single sleek row with Back button on left + Quick Actions on right */}
        <div className="flex sm:hidden items-center justify-between gap-2 py-2 border-b border-[#D9821E]/15">
          <Link
            to={isTreasure ? '/skarby-ula' : '/sklep'}
            onClick={handleBackToCatalog}
            className="inline-flex items-center gap-1.5 font-bold text-xs text-[#1B4332] hover:text-[#D9821E] transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#D9821E]/20 shadow-2xs shrink-0"
            id="btn-powrot-katalog-mobile"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTreasure ? 'Skarby Ula' : 'Katalog miodów'}</span>
          </Link>

          {/* Compact Action Icons Group on Mobile */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isTreasure && onOpenCompare && (
              <button
                type="button"
                onClick={() => onOpenCompare(rawProduct)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#1B4332] bg-white rounded-xl border border-[#1B4332]/25 hover:bg-[#1B4332] hover:text-white transition-all cursor-pointer shadow-2xs"
                title="Porównaj ten miód w tabeli"
                aria-label="Porównaj ten miód"
              >
                <Scale className="w-3.5 h-3.5 text-[#D9821E]" />
                <span className="text-[11px]">Porównaj</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 text-[#594D42] hover:text-[#D9821E] bg-white rounded-xl border border-[#D9821E]/20 hover:border-[#D9821E] transition-colors cursor-pointer relative shadow-2xs"
              title="Kopiuj link do tego produktu"
              aria-label="Kopiuj link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#1B4332]" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-[#1B4332] text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap font-medium z-30">
                  Skopiowano!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* DESKTOP ONLY (>= sm): Full breadcrumb path + Detailed Honey switcher */}
        <div className="hidden sm:flex items-center justify-between gap-4 py-3 border-b border-[#D9821E]/20">
          <div className="flex items-center flex-wrap gap-2 text-sm text-[#7A6A5A]">
            <Link
              to={isTreasure ? '/skarby-ula' : '/sklep'}
              onClick={handleBackToCatalog}
              className="inline-flex items-center gap-1.5 font-bold text-[#1B4332] hover:text-[#D9821E] transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-[#D9821E]/20 shadow-xs"
              id="btn-powrot-katalog-desktop"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isTreasure ? 'Skarby Ula' : 'Katalog miodów'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D9821E]/60" />
            
            <Link
              to={isTreasure ? '/skarby-ula' : `/sklep?kategoria=${product.category}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#594D42] hover:text-[#1B4332] hover:bg-white bg-white/70 px-3 py-1.5 rounded-xl border border-[#D9821E]/20 hover:border-[#1B4332]/30 shadow-2xs transition-all cursor-pointer group"
              title={`Filtruj zbiory: ${catInfo.label}`}
            >
              <span>{catInfo.icon}</span>
              <span className="group-hover:underline">{catInfo.label}</span>
            </Link>

            <ChevronRight className="w-3.5 h-3.5 text-[#D9821E]/60" />
            <span className="font-semibold text-[#241D17] truncate max-w-[300px]">
              {product.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isTreasure && onOpenCompare && (
              <button
                type="button"
                onClick={() => onOpenCompare(rawProduct)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#1B4332] hover:text-white hover:bg-[#1B4332] bg-white rounded-xl border border-[#1B4332]/30 transition-all cursor-pointer shadow-xs"
                title="Porównaj ten miód z inną odmianą w tabeli"
              >
                <Scale className="w-3.5 h-3.5 text-[#D9821E]" />
                <span>Porównaj</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-[#594D42] hover:text-[#D9821E] bg-white rounded-xl border border-[#D9821E]/20 hover:border-[#D9821E] transition-colors cursor-pointer relative"
              title="Kopiuj link do tego produktu"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#1B4332]" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -top-8 right-0 bg-[#1B4332] text-white text-[11px] px-2.5 py-1 rounded-md shadow-md whitespace-nowrap font-medium">
                  Skopiowano link!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: Product Title & Category & Rating directly above Gallery (E-commerce standard) */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 mb-4">
        {renderProductHeader()}
      </div>

      {/* Main Product Showcase: Left Gallery + Right Buy Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Interactive Photo & Texture Gallery (6 Cols on desktop) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-[4/3] sm:aspect-square bg-white rounded-3xl border border-[#D9821E]/25 shadow-md overflow-hidden group">
              
              {/* Badges on main photo */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
                {product.badge && (
                  <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${product.badgeClass || 'bg-[#D9821E] text-white'} shadow-sm`}>
                    {product.badge}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#1B4332] border border-[#1B4332]/20 backdrop-blur-xs shadow-2xs">
                  {prodType === 'bee-colony'
                    ? 'Nadzór Weterynaryjny PLW'
                    : prodType === 'candle'
                    ? '100% Czysty Wosk Pszczeli'
                    : prodType === 'apitherapy'
                    ? '100% Czysta Apiterapia'
                    : '100% Surowy i Nieprażony'}
                </span>
              </div>

              {/* Main Image with smooth transition */}
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = product.imageUrl;
                }}
              />

              {/* Photo Caption / Angle Indicator */}
              <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                Zdjęcie {activeImageIndex + 1} z {images.length}
              </div>
            </div>

            {/* Thumbnail selector strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white shadow-xs ${
                      activeImageIndex === idx 
                        ? 'border-[#D9821E] ring-2 ring-[#D9821E]/30 scale-[1.02]' 
                        : 'border-[#D9821E]/20 hover:border-[#D9821E]/60 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} perspektywa ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = product.imageUrl;
                      }}
                    />
                    <div className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/65 text-white px-1.5 py-0.5 rounded">
                      {prodType === 'bee-colony'
                        ? (idx === 0 ? 'Rodzina' : 'Ramki')
                        : prodType === 'candle'
                        ? (idx === 0 ? 'Świeca' : 'Wosk')
                        : prodType === 'apitherapy'
                        ? (idx === 0 ? 'Produkt' : 'Struktura')
                        : (idx === 0 ? 'Słoik' : idx === 1 ? 'Patoka' : idx === 2 ? 'Pasieka' : 'Struktura')}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* DESKTOP ONLY: Safe Shipping & Sensory Card under gallery */}
            <div className="hidden lg:block space-y-4">
              {renderSensoryAndShipping()}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Header, Purchase Controls & Key Specs (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* DESKTOP ONLY: Header info */}
            <div className="hidden lg:block">
              {renderProductHeader()}
            </div>

            {/* Tagline */}
            <div className="p-4 bg-[#FAF3E5] rounded-2xl border-l-4 border-[#D9821E] text-sm font-medium text-[#594D42] leading-relaxed shadow-2xs">
              „{product.tagline}”
            </div>

            {/* DESKTOP ONLY: Quick Tasting Notes or Specs Tags directly under header */}
            <div className="hidden lg:block">
              {renderSpecificationBadges()}
            </div>

            {/* Purchase Card: Gramature Selector, Price, Add to Cart */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D9821E]/30 shadow-md space-y-5">
              
              {/* Kompaktowa Metryka Partii & Żywych Enzymów / Specyfikacja produktu */}
              {prodType === 'bee-colony' ? (
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#594D42] uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                        Status hodowlany:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
                        Rezerwacja Sezon 2026
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FAF3E5] text-[#8C4609] border border-[#D9821E]/20" title="Rejestr PLW">
                        🏥 Nadzór PLW: WNI 28143502
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1.5 border-t border-[#EFE7DA]">
                    <span className="truncate pr-2">
                      5 ramek wielkopolskich + matka unasieniona 2026 + szkolenie przy ulu
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConsistencyExplainer(!showConsistencyExplainer)}
                      className="text-[#D9821E] hover:text-[#8C4609] font-bold shrink-0 cursor-pointer text-[11px] underline"
                    >
                      {showConsistencyExplainer ? 'Zwiń szczegóły ▲' : 'Warunki odbioru ▼'}
                    </button>
                  </div>

                  {showConsistencyExplainer && (
                    <div className="pt-2.5 border-t border-[#EFE7DA] space-y-2 text-xs text-[#524637] animate-in fade-in duration-200">
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] space-y-1 shadow-2xs">
                        <strong className="text-[#1B4332] block font-bold">Odbiór w bezpiecznym pudle transportowym:</strong>
                        <p className="leading-relaxed">
                          Odkłady wydawane są w specjalistycznych, wentylowanych transporterach z podwójną siatką. Odbiór wczesnym rankiem lub o zmroku.
                        </p>
                      </div>
                      <div className="p-3 bg-[#FAF3E5] rounded-xl border border-[#D9821E]/25 text-[11px] space-y-1 shadow-2xs">
                        <strong className="text-[#8C4609] block font-bold">Praktyczne szkolenie w pasiece w cenie:</strong>
                        <p className="leading-relaxed">
                          Podczas odbioru wspólnie otwieramy gniazdo, oceniamy czerwienie matki i omawiamy pierwsze kroki po przesiedleniu do Twojego ula.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : prodType === 'candle' ? (
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#E7DDCE] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#594D42] uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                        Manufaktura:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-50 text-amber-900 border-amber-300">
                        100% Czysty Wosk Pszczeli
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FAF3E5] text-[#8C4609] border border-[#D9821E]/20">
                        🕯️ Knot bawełniany
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1.5 border-t border-[#EFE7DA]">
                    <span className="truncate pr-2">
                      Rękodzieło z węzy pasiecznej • Zero parafiny i chemicznych wybielaczy
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConsistencyExplainer(!showConsistencyExplainer)}
                      className="text-[#D9821E] hover:text-[#8C4609] font-bold shrink-0 cursor-pointer text-[11px] underline"
                    >
                      {showConsistencyExplainer ? 'Zwiń wskazówki ▲' : 'Wskazówki palenia ▼'}
                    </button>
                  </div>

                  {showConsistencyExplainer && (
                    <div className="pt-2.5 border-t border-[#EFE7DA] space-y-2 text-xs text-[#524637] animate-in fade-in duration-200">
                      <div className="p-3 bg-white rounded-xl border border-[#D9821E]/25 text-[11px] space-y-1 shadow-2xs">
                        <strong className="text-[#8C4609] block font-bold">Zasada pierwszego palenia:</strong>
                        <p className="leading-relaxed">
                          Pal świecę jednorazowo min. 2 godziny, by wosk roztopił się po brzegi – zapobiegnie to tunelowaniu i zapewni maksymalny czas palenia.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : prodType === 'apitherapy' ? (
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#E7DDCE] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#594D42] uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-[#1B4332]" />
                        Apiterapia:
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-amber-100 text-amber-900 border-amber-300">
                        100% Czysty Surowiec
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FAF3E5] text-[#8C4609] border border-[#D9821E]/20">
                        🌡️ Reżim suszenia: max 38°C
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1.5 border-t border-[#EFE7DA]">
                    <span className="truncate pr-2">
                      Żywy surowiec biologiczny o pełnej aktywności enzymatycznej
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConsistencyExplainer(!showConsistencyExplainer)}
                      className="text-[#D9821E] hover:text-[#8C4609] font-bold shrink-0 cursor-pointer text-[11px] underline"
                    >
                      {showConsistencyExplainer ? 'Zwiń zasady ▲' : 'Więcej o kuracji ▼'}
                    </button>
                  </div>

                  {showConsistencyExplainer && (
                    <div className="pt-2.5 border-t border-[#EFE7DA] space-y-2 text-xs text-[#524637] animate-in fade-in duration-200">
                      <div className="p-3 bg-[#FAF3E5] rounded-xl border border-[#D9821E]/25 text-[11px] space-y-1 shadow-2xs">
                        <strong className="text-[#1B4332] block font-bold">Zasada ochrony enzymów (max 40°C):</strong>
                        <p className="leading-relaxed">
                          Nigdy nie dodawaj produktów apiterapeutycznych do gorących napojów. Cenne enzymy pszczele ulegają denaturacji powyżej 40°C.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#E7DDCE] space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#594D42] uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5 text-[#D9821E]" />
                        Partia:
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${product.consistencyInfo.badgeClass}`}>
                        {product.consistencyInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FAF3E5] text-[#8C4609] border border-[#D9821E]/20" title="Chroń żywe enzymy ula">
                        🌡️ Reżim ula: max 40°C
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1.5 border-t border-[#EFE7DA]">
                    <span className="truncate pr-2">
                      {product.consistencyInfo.shortExplanation}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowConsistencyExplainer(!showConsistencyExplainer)}
                      className="text-[#D9821E] hover:text-[#8C4609] font-bold shrink-0 cursor-pointer text-[11px] underline"
                    >
                      {showConsistencyExplainer ? 'Zwiń wyjaśnienie ▲' : 'Więcej o krysztale i enzymach ▼'}
                    </button>
                  </div>

                  {/* Rozwijane szczegóły partii i enzymów (dla dociekliwych, nie zapycha głównego widoku) */}
                  {showConsistencyExplainer && (
                    <div className="pt-2.5 border-t border-[#EFE7DA] space-y-2 text-xs text-[#524637] animate-in fade-in duration-200">
                      {product.consistencyInfo.hasGlucoseBloom && (
                        <div className="p-3 bg-white rounded-xl border border-[#D9821E]/25 text-[11px] space-y-1 shadow-2xs">
                          <strong className="text-[#8C4609] block font-bold">Biały nalot na ściankach słoika („kwiat miodu”):</strong>
                          <p className="leading-relaxed">{product.consistencyInfo.glucoseBloomInfo}</p>
                        </div>
                      )}
                      <div className="p-3 bg-[#FAF3E5] rounded-xl border border-[#D9821E]/25 text-[11px] space-y-1 shadow-2xs">
                        <strong className="text-[#1B4332] block font-bold">Żelazna zasada 40°C (Ochrona enzymów ula):</strong>
                        <p className="leading-relaxed">
                          Miód zachowuje pełną moc biologiczną (diastazę, lizozym i inhibinę) wyłącznie do temperatury 40°C. 
                          Dodawaj go do lekko przestudzonej herbaty lub letniej wody.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Gramature / Variant selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#594D42]">
                    {prodType === 'bee-colony'
                      ? 'Wybierz pakiet odkładu:'
                      : prodType === 'candle'
                      ? 'Wybierz rodzaj świecy:'
                      : prodType === 'apitherapy'
                      ? 'Wybierz gramaturę opakowania:'
                      : 'Wybierz gramaturę słoika:'}
                  </label>
                  <span className="text-xs text-[#7A6A5A]">
                    {prodType === 'bee-colony' ? (
                      <strong className="text-[#1B4332]">Pakiet ze szkoleniem w pasiece</strong>
                    ) : prodType === 'candle' ? (
                      <strong className="text-[#1B4332]">Cena za 1 sztukę</strong>
                    ) : prodType === 'apitherapy' ? (
                      <span>Cena: <strong className="text-[#1B4332]">{currentSize ? Math.round((effectivePrice / currentSize.weightGrams) * 100) : 0} zł / 100g</strong></span>
                    ) : (
                      <span>Cena jednostkowa: <strong className="text-[#1B4332]">{pricePerKg} zł / kg</strong></span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                  {product.sizesList.map((size, idx) => {
                    const isSelected = selectedSizeIdx === idx;
                    const isLargest = idx === product.sizesList.length - 1 && product.sizesList.length > 1;

                    return (
                      <button
                        key={size.gram + idx}
                        type="button"
                        onClick={() => setSelectedSizeIdx(idx)}
                        className={`relative flex flex-col items-center justify-between p-3 pt-3.5 pb-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm ring-2 ring-[#1B4332]/25 scale-[1.01]'
                            : 'bg-[#FAF6EE] text-[#594D42] border-[#D9821E]/25 hover:border-[#D9821E] hover:bg-white'
                        }`}
                      >
                        {isLargest && (
                          <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs ${
                            isSelected ? 'bg-[#E5983A] text-[#14100C] ring-1 ring-white/40' : 'bg-[#1B4332] text-white'
                          }`}>
                            {prodType === 'apitherapy' || prodType === 'honey' ? 'Najtaniej' : 'Wybór'}
                          </span>
                        )}
                        <div className="text-base font-bold tracking-tight leading-tight tabular-nums">
                          {size.gram}
                        </div>
                        <div className={`text-xs font-bold mt-1 ${isSelected ? 'text-[#F3C06B]' : 'text-[#8C5815]'}`}>
                          {purchaseMode === 'subscription' ? Math.round(size.price * 0.9) : size.price} zł
                        </div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-white/65' : 'text-[#8C7A6B]'}`}>
                          {prodType === 'bee-colony'
                            ? '5 ramek + szkolenie'
                            : prodType === 'candle'
                            ? '100% wosk pszczeli'
                            : prodType === 'apitherapy'
                            ? `${Math.round((size.price / size.weightGrams) * 100)} zł / 100g`
                            : `${Math.round(((purchaseMode === 'subscription' ? Math.round(size.price * 0.9) : size.price) / size.weightGrams) * 1000)} zł/kg`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model zakupu: Jednorazowy vs Autouzupełnianie spiżarni (wyłącznie dla miodu i apiterapii) */}
              {(prodType === 'honey' || prodType === 'apitherapy') && (
                <div className="pt-2 border-t border-[#D9821E]/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#594D42]">
                      Wybierz model zakupu:
                    </label>
                    {purchaseMode === 'subscription' && (
                      <span className="text-[10px] font-bold text-[#1B4332] bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                        ✓ Aktywny stały rabat -10%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPurchaseMode('one-time')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        purchaseMode === 'one-time'
                          ? 'bg-[#1B4332]/5 border-[#1B4332] text-[#1B4332] ring-1 ring-[#1B4332]'
                          : 'bg-[#FAF8F5] border-[#DFCBB5] text-[#594D42] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Zakup jednorazowy</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          purchaseMode === 'one-time' ? 'border-[#1B4332] bg-[#1B4332]' : 'border-[#A69784]'
                        }`}>
                          {purchaseMode === 'one-time' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A6A5A] block mt-1">
                        Cena standardowa ({basePrice} zł)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPurchaseMode('subscription')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        purchaseMode === 'subscription'
                          ? 'bg-[#E5983A]/10 border-[#D9821E] text-[#8C4609] ring-1 ring-[#D9821E]'
                          : 'bg-[#FAF8F5] border-[#DFCBB5] text-[#594D42] hover:bg-white'
                      }`}
                    >
                      <span className="absolute top-0 right-0 bg-[#D9821E] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                        -10% Rabat
                      </span>
                      <div className="flex items-center justify-between font-bold">
                        <span>Autouzupełnianie</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          purchaseMode === 'subscription' ? 'border-[#D9821E] bg-[#D9821E]' : 'border-[#A69784]'
                        }`}>
                          {purchaseMode === 'subscription' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A6A5A] block mt-1">
                        Dostawa co {subscriptionInterval} dni • <strong>{effectivePrice} zł</strong> • Bez umowy
                      </span>
                    </button>
                  </div>

                  {/* Rozwijany elastyczny selektor częstotliwości autouzupełniania */}
                  {purchaseMode === 'subscription' && (
                    <div className="p-3 bg-[#FFFDF9] rounded-2xl border border-[#D9821E]/30 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#3B2D20] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#D9821E]" />
                          Częstotliwość dostaw spiżarni:
                        </span>
                        <span className="text-[10px] text-[#1B4332] font-semibold bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                          Stały rabat -10%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { days: 30, label: 'Co 30 dni', sub: 'Codzienna herbata' },
                          { days: 60, label: 'Co 60 dni', sub: 'Rekomendowane', badge: 'Popularne' },
                          { days: 90, label: 'Co 90 dni', sub: 'Okazjonalnie' },
                        ].map((opt) => {
                          const isActive = subscriptionInterval === opt.days;
                          return (
                            <button
                              key={opt.days}
                              type="button"
                              onClick={() => setSubscriptionInterval(opt.days as 30 | 60 | 90)}
                              className={`py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer relative ${
                                isActive
                                  ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                                  : 'bg-white text-[#524637] border-[#DFD3C2] hover:bg-[#FAF6EE] hover:border-[#D9821E]/50'
                              }`}
                            >
                              {opt.badge && (
                                <span className={`absolute -top-1.5 right-1.5 text-[8px] font-black uppercase px-1 rounded-full ${
                                  isActive ? 'bg-[#E5983A] text-[#1B4332]' : 'bg-[#1B4332] text-white'
                                }`}>
                                  {opt.badge}
                                </span>
                              )}
                              <span className="block font-bold text-xs sm:text-[13px] leading-tight">
                                {opt.label}
                              </span>
                              <span className={`block text-[9px] mt-0.5 leading-tight ${
                                isActive ? 'text-[#E0D8CB]' : 'text-[#8C7A6B]'
                              }`}>
                                {opt.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[10.5px] text-[#7A6A5A] flex items-center gap-1.5 pt-0.5">
                        <Check className="w-3 h-3 text-[#1B4332] shrink-0" />
                        <span>Możesz przesunąć termin, wstrzymać lub anulować w dowolnym momencie w 1 kliknięcie bez umów.</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Price & Quantity & CTA */}
              <div className="pt-2 border-t border-[#D9821E]/15">
                <div className="bg-[#FAF6EE]/80 rounded-2xl p-4 border border-[#D9821E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shadow-2xs">
                  <div>
                    <span className="text-[11px] text-[#7A6A5A] uppercase tracking-wider block font-bold">
                      Razem do zapłaty:
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-sans text-3xl sm:text-4xl font-black text-[#1B4332] tracking-tight tabular-nums">
                        {(effectivePrice * quantity).toFixed(2)}
                      </span>
                      <span className="text-base font-bold text-[#8C7A6B]">zł</span>
                      {quantity > 1 && (
                        <span className="text-xs text-[#7A6A5A] font-medium ml-1">
                          ({quantity} × {effectivePrice} zł)
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#1B4332] font-semibold block mt-0.5">
                      {prodType === 'bee-colony'
                        ? '✓ Odbiór w wentylowanym transporterze w pasiece Ciechów'
                        : prodType === 'candle'
                        ? '✓ Rękodzieło ze 100% czystego wosku z bawełnianym knotem'
                        : prodType === 'apitherapy'
                        ? '✓ Szczelne opakowanie chroniące przed wilgocią i światłem'
                        : '✓ Świeży rozlew z pasieki w szklanym słoiku'}
                    </span>
                  </div>

                  {/* Refined Quantity Counter */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 pt-1 sm:pt-0">
                    <span className="text-[10px] uppercase font-bold text-[#8C7A6B] tracking-wider">
                      {prodType === 'bee-colony'
                        ? 'Liczba rodzin (odkładów):'
                        : prodType === 'candle'
                        ? 'Liczba świec:'
                        : prodType === 'apitherapy'
                        ? 'Liczba opakowań:'
                        : 'Liczba słoików:'}
                    </span>
                    <div className="flex items-center border border-[#D9821E]/30 rounded-xl bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center font-bold text-[#594D42] hover:bg-[#FAF6EE] hover:text-[#1B4332] transition-colors cursor-pointer text-base"
                        title="Zmniejsz ilość"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-[#241D17]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold text-[#594D42] hover:bg-[#FAF6EE] hover:text-[#1B4332] transition-colors cursor-pointer text-base"
                        title="Zwiększ ilość"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    ref={mainBuyButtonRef}
                    onClick={handleAddToCart}
                    className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-base text-white bg-[#1B4332] hover:bg-[#143326] transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-dodaj-koszyk-glowny"
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-5 h-5 text-[#E6C065]" />
                        <span>Dodano do koszyka!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Dodaj do koszyka • {((currentSize?.price || 0) * quantity).toFixed(2)} zł</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-[#594D42] pt-2 px-1">
                    <span className="flex items-center gap-1.5 font-semibold text-[#1B4332]">
                      <CheckCircle2 className="w-4 h-4 text-[#1B4332]" />
                      {prodType === 'bee-colony' ? 'Rezerwacja aktywna (Dostępny)' : 'Świeża partia z pasieki (Dostępny)'}
                    </span>
                    <span className="text-[#7A6A5A]">
                      {prodType === 'bee-colony' ? 'Odbiór osobisty' : 'Darmowa dostawa od 199 zł'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust & Safe Delivery Strip: clean single line on mobile, grid on desktop */}
              <div className="pt-3 border-t border-[#D9821E]/15 hidden sm:grid grid-cols-3 gap-2 text-center text-[11px] text-[#594D42]">
                <div className="flex items-center justify-center gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                  <span className="font-semibold">{prodType === 'bee-colony' ? 'Odbiór osobisty' : 'Wysyłka w 24h'}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332] shrink-0" />
                  <span className="font-semibold">{prodType === 'bee-colony' ? 'Transporter z wentylacją' : 'Zero stłuczek'}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE]">
                  <Truck className="w-3.5 h-3.5 text-[#D9821E] shrink-0" />
                  <span className="font-semibold">{prodType === 'bee-colony' ? 'Szkolenie przy ulu' : 'Paczkomat & DPD'}</span>
                </div>
              </div>

              {/* Mobile compact trust indicators */}
              <div className="pt-2.5 border-t border-[#D9821E]/15 flex sm:hidden items-center justify-around text-[10.5px] text-[#594D42] py-1 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE]/80">
                <span className="flex items-center gap-1 font-semibold text-[#1B4332]">
                  <CheckCircle2 className="w-3 h-3" /> Wysyłka 24h
                </span>
                <span className="text-[#D9821E]/40">•</span>
                <span className="flex items-center gap-1 font-semibold text-[#1B4332]">
                  <ShieldCheck className="w-3 h-3" /> Pancerne tuby
                </span>
                <span className="text-[#D9821E]/40">•</span>
                <span className="flex items-center gap-1 font-semibold text-[#D9821E]">
                  <Truck className="w-3 h-3" /> Paczkomat
                </span>
              </div>
            </div>

            {/* MOBILE ONLY: Specification Badges, Sensory Card & Safe Shipping after Buy Box */}
            <div className="lg:hidden space-y-4 pt-2">
              {renderSpecificationBadges()}
              {renderSensoryAndShipping()}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED TABS SECTION: Opis, Zdrowie, Kulinaria, Badania, Opinie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" id="tabs-section">
        <div className="bg-white rounded-3xl border border-[#D9821E]/25 shadow-sm overflow-hidden">
          
          {/* Card Header & Tabs Navigation */}
          <div className="p-4 sm:p-6 lg:p-7 border-b border-[#D9821E]/15 bg-white space-y-4">
            {/* Header branding & context matching Sensory Card aesthetic */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D9821E]/15 flex items-center justify-center text-[#D9821E] shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif font-bold text-lg sm:text-xl text-[#241D17]">
                      {isTreasure 
                        ? (prodType === 'bee-colony' 
                            ? 'Kompendium Wiedzy o Rodzinie Pszczelej' 
                            : prodType === 'candle' 
                            ? 'Przewodnik po Manufakturze i Pielęgnacji' 
                            : 'Karta Wiedzy i Działanie Apiterapii')
                        : 'Karta Wiedzy o Miodzie'}
                    </h2>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                      {product.name}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#7A6A5A] mt-0.5">
                    Szczegółowe informacje, tradycja zbioru, certyfikaty i opinie
                  </p>
                </div>
              </div>

              {/* Verified badge - Desktop */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-[#D9821E]/20 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D9821E]" />
                <span>100% Czyste Pszczelarstwo Wędrowne</span>
              </div>

              {/* Mobile indicator informing about horizontal swipe */}
              <div className="flex sm:hidden items-center gap-1.5 text-[11px] font-bold text-[#8C5815] bg-[#FAF5ED] px-2.5 py-1 rounded-full border border-[#E7DCCE] self-start">
                <span>5 sekcji</span>
                <span className="text-[#D9821E]">•</span>
                <span className="text-[#D9821E] flex items-center gap-0.5 font-medium">
                  przesuń w bok <ChevronRight className="w-3 h-3 inline" />
                </span>
              </div>
            </div>

            {/* Segmented Pill Navigation Bar */}
            <div className="relative group">
              {/* Left scroll arrow button on mobile when scrolled */}
              {canScrollTabsLeft && (
                <button
                  type="button"
                  onClick={() => scrollTabs('left')}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 text-[#8C5815] hover:text-[#1B4332] border border-[#EADBCC] shadow-sm flex items-center justify-center sm:hidden active:scale-90 transition-all z-10 cursor-pointer"
                  aria-label="Przewiń zakładki w lewo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Left edge fade */}
              {canScrollTabsLeft && (
                <div className="pointer-events-none absolute left-1 top-1.5 bottom-1.5 w-8 bg-gradient-to-r from-[#FAF7F2] to-transparent rounded-l-xl sm:hidden z-5" />
              )}

              <div 
                ref={tabsContainerRef}
                onScroll={checkTabsScroll}
                className="bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#EADBCC] flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth pr-8 sm:pr-1.5"
              >
                {(prodType === 'bee-colony' ? [
                  { id: 'opis', label: 'Specyfikacja i Szkolenie', icon: FileText },
                  { id: 'zdrowie', label: 'Zdrowotność & Genetyka', icon: ShieldCheck },
                  { id: 'kulinaria', label: 'Odbiór i Hodowla', icon: Clock },
                  { id: 'badania', label: 'Świadectwo Weterynaryjne', icon: CheckCircle2 },
                  { id: 'opinie', label: `Opinie (${product.reviewsCount})`, icon: MessageSquare },
                ] : prodType === 'candle' ? [
                  { id: 'opis', label: 'Rękodzieło i Skład', icon: FileText },
                  { id: 'zdrowie', label: 'Aromaterapia i Jonizacja', icon: Sparkles },
                  { id: 'kulinaria', label: 'Instrukcja Palenia', icon: Leaf },
                  { id: 'badania', label: 'Czystość Wosku 100%', icon: ShieldCheck },
                  { id: 'opinie', label: `Opinie (${product.reviewsCount})`, icon: MessageSquare },
                ] : prodType === 'apitherapy' ? [
                  { id: 'opis', label: 'Opis i Pozyskiwanie', icon: FileText },
                  { id: 'zdrowie', label: 'Działanie Lecznicze', icon: Heart },
                  { id: 'kulinaria', label: 'Dawkowanie i Przepisy', icon: Leaf },
                  { id: 'badania', label: 'Czystość i Badania', icon: Beaker },
                  { id: 'opinie', label: `Opinie (${product.reviewsCount})`, icon: MessageSquare },
                ] : [
                  { id: 'opis', label: 'Opis i Pochodzenie', icon: FileText },
                  { id: 'zdrowie', label: 'Właściwości Zdrowotne', icon: Heart },
                  { id: 'kulinaria', label: 'Jak Stosować & Pairing', icon: Leaf },
                  { id: 'badania', label: 'Badania Laboratoryjne', icon: Beaker },
                  { id: 'opinie', label: `Opinie (${product.reviewsCount})`, icon: MessageSquare },
                ]).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-white text-[#1B4332] shadow-xs border border-[#D9821E]/30 scale-[1.01]'
                          : 'text-[#6E6053] hover:text-[#241D17] hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#D9821E]' : 'text-[#8C7A6B]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right edge fade */}
              {canScrollTabsRight && (
                <div className="pointer-events-none absolute right-1 top-1.5 bottom-1.5 w-10 bg-gradient-to-l from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent rounded-r-xl sm:hidden z-5" />
              )}

              {/* Right scroll arrow button on mobile when more tabs can be reached */}
              {canScrollTabsRight && (
                <button
                  type="button"
                  onClick={() => scrollTabs('right')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 text-[#D9821E] hover:text-[#8C4609] border border-[#EADBCC] shadow-sm flex items-center justify-center sm:hidden active:scale-90 transition-all z-10 cursor-pointer"
                  aria-label="Przewiń zakładki w prawo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Content Panels */}
          <div className="p-5 sm:p-8 lg:p-10 bg-white">
            
            {/* TAB 1: OPIS I SPECYFIKACJA */}
            {activeTab === 'opis' && (
              <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#241D17] mb-3">
                    {prodType === 'bee-colony'
                      ? 'Specyfikacja odkładu i program szkolenia'
                      : prodType === 'candle'
                      ? 'Rękodzieło ze 100% czystego wosku pszczelego'
                      : prodType === 'apitherapy'
                      ? 'Pozyskiwanie i czystość biologiczna superfood ula'
                      : 'Historia zbioru i specyfika odmiany'}
                  </h3>
                  <p className="text-[#594D42] text-sm sm:text-base leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <p className="text-[#594D42] text-sm sm:text-base leading-relaxed">
                    {prodType === 'bee-colony' ? (
                      'Odkład pszczeli to kompletna biologiczna jednostka produkcyjna gotowa do natychmiastowego rozwoju. Pszczoły obsiadają 5 ramek wielkopolskich, posiadają zapasy miodu i pierzgi oraz młodą, znakowaną matkę pszczelą z bieżącego sezonu. Wraz z odbiorem rodziny otrzymujesz profesjonalne szkolenie wstępne z mistrzem pszczelarskim w naszej pasiece w Ciechowie.'
                    ) : prodType === 'candle' ? (
                      'Nasze świece powstają ręcznie w małych partiach z dziewiczego wosku pszczelego pozyskiwanego z węzy i odsklepin naszej pasieki. Nie zawierają parafiny, stearyny ani sztucznych aromatów. Płomień świecy uwalnia ciepły, miodowy mikroklimat i emituje dobroczynne jony ujemne oczyszczające powietrze z kurzu i smogu.'
                    ) : prodType === 'apitherapy' ? (
                      'Surowce apiterapeutyczne pozyskujemy wyłącznie w szczycie pożytkowym na Warmii. Zbiór i selekcja odbywają się ręcznie z zachowaniem rygorystycznego reżimu temperaturowego (do 38°C), co pozwala zachować nienaruszone enzymy ulowe, witaminy i bioflawonoidy o potężnym działaniu prozdrowotnym.'
                    ) : (
                      'Nasz miód nie jest poddawany szkodliwym procesom pasteryzacji, dekrystalizacji termicznej ani filtracji ciśnieniowej. Trafia do słoika dokładnie w takiej postaci, w jakiej stworzyły go pszczoły w czystym ekosystemie Dolnego Śląska i Warmii. Zachowuje naturalne pyłki kwiatowe, drobiny wosku i propolisu oraz pełną bioaktywność enzymatyczną.'
                    )}
                  </p>
                </div>

                {/* Facts grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D9821E]/15">
                  <div className="bg-white p-5 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-1.5">
                    <p className="text-[11px] text-[#D9821E] uppercase font-bold tracking-wider mb-1">
                      {prodType === 'bee-colony'
                        ? 'Termin & Miejsce Odbioru'
                        : prodType === 'candle'
                        ? 'Czystość Surowca'
                        : product.id === 'propolis-kit'
                        ? 'Pochodzenie Żywic'
                        : product.id === 'pierzga-pszczela'
                        ? 'Forma Biologiczna'
                        : product.id === 'pylek-pszczeli'
                        ? 'Pochodzenie Obnóży'
                        : 'Położenie Pasieki'}
                    </p>
                    <p className="font-bold text-[#1B4332] text-base">
                      {prodType === 'bee-colony'
                        ? 'Pasieka Ciechów • Czerwiec / Lipiec 2026'
                        : prodType === 'candle'
                        ? '100% Cera Flava'
                        : product.id === 'propolis-kit'
                        ? 'Lasy Warmii i Mazur'
                        : product.id === 'pierzga-pszczela'
                        ? 'Pszczeli Chleb Ulowy'
                        : product.id === 'pylek-pszczeli'
                        ? 'Kwitnące łąki Warmii'
                        : product.region}
                    </p>
                    <p className="text-xs sm:text-sm text-[#594D42] mt-1 leading-relaxed">
                      {prodType === 'bee-colony'
                        ? 'Odbiór osobisty w wentylowanym pudle transportowym. Możliwy przyjazd z własnym ulem.'
                        : prodType === 'candle' 
                        ? 'Wytopiony z odsklepin i dziewiczej węzy pasiecznej, bez dodatku parafiny i stearyny.'
                        : product.id === 'propolis-kit'
                        ? 'Żywice pąków drzew liściastych i iglastych (topola, olcha, sosna, brzoza).'
                        : product.id === 'pierzga-pszczela'
                        ? 'Pyłek kwiatowy naturalnie zakiszony kwasem mlekowym w komórkach plastra pszczelego.'
                        : product.id === 'pylek-pszczeli'
                        ? 'Wielobarwny pyłek z czystych, dzikich łąk, facelii, mniszka i zagajników Warmii.'
                        : 'Dziewicze tereny leśne i łąkowe wolne od intensywnego przemysłu.'}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-1.5">
                    <p className="text-[11px] text-[#D9821E] uppercase font-bold tracking-wider mb-1">
                      {prodType === 'bee-colony' 
                        ? 'Skład Biologiczny Rodziny' 
                        : prodType === 'candle' 
                        ? 'Knot Bawełniany' 
                        : product.id === 'propolis-kit'
                        ? 'Baza do Ekstrakcji'
                        : product.id === 'pierzga-pszczela'
                        ? 'Przyswajalność'
                        : product.id === 'pylek-pszczeli'
                        ? 'Reżim Termiczny'
                        : 'Metoda Pozyskiwania'}
                    </p>
                    <p className="font-bold text-[#1B4332] text-base">
                      {prodType === 'bee-colony' 
                        ? '3 ramki czerwiu + 2 z pokarmem' 
                        : prodType === 'candle' 
                        ? 'Niebielona bawełna' 
                        : product.id === 'propolis-kit'
                        ? 'Nalewka 20% lub maść'
                        : product.id === 'pierzga-pszczela'
                        ? 'Ponad 3x wyższa niż pyłku'
                        : product.id === 'pylek-pszczeli'
                        ? 'Maksymalnie 38°C'
                        : 'Wirowanie na zimno'}
                    </p>
                    <p className="text-xs sm:text-sm text-[#594D42] mt-1 leading-relaxed">
                      {prodType === 'bee-colony' 
                        ? 'Czerw w każdym stadium (jaja, larwy, kryty) gwarantujący ciągłość pokoleniową rodziny.' 
                        : prodType === 'candle' 
                        ? 'Knot z surowej, niebielonej bawełny bez rdzenia ołowianego – stabilny płomień bez dymu.' 
                        : product.id === 'propolis-kit'
                        ? 'Czysty surowiec idealny do sporządzenia domowej nalewki spirytusowej (macerat 20%).'
                        : product.id === 'pierzga-pszczela'
                        ? 'Enzymatycznie rozpuszczone otoczki komórkowe ułatwiają natychmiastowe wchłanianie.'
                        : product.id === 'pylek-pszczeli'
                        ? 'Powolne suszenie mikronawiewem – żywe enzymy ulowe zachowują 100% aktywności.'
                        : 'Tradycyjna miodarka radialna, temperatura poniżej 25°C.'}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-1.5">
                    <p className="text-[11px] text-[#D9821E] uppercase font-bold tracking-wider mb-1">
                      {prodType === 'bee-colony' 
                        ? 'Program Szkolenia w Cenie' 
                        : prodType === 'candle' 
                        ? 'Czas Palenia' 
                        : product.id === 'propolis-kit'
                        ? 'Selekcja Partii'
                        : product.id === 'pierzga-pszczela'
                        ? 'Metoda Pozyskania'
                        : product.id === 'pylek-pszczeli'
                        ? 'Zasada Spożywania'
                        : 'Sezon Pozyskania'}
                    </p>
                    <p className="font-bold text-[#1B4332] text-base">
                      {prodType === 'bee-colony' 
                        ? 'Przegląd gniazda i profilaktyka' 
                        : prodType === 'candle' 
                        ? 'Do 3x dłużej niż parafina' 
                        : product.id === 'propolis-kit'
                        ? '100% czysty kit ulowy'
                        : product.id === 'pierzga-pszczela'
                        ? 'Wydobycie z plastrów'
                        : product.id === 'pylek-pszczeli'
                        ? 'Wymaga namoczenia'
                        : `Zbiór ${product.harvestYear}`}
                    </p>
                    <p className="text-xs sm:text-sm text-[#594D42] mt-1 leading-relaxed">
                      {prodType === 'bee-colony' 
                        ? '1-godzinny instruktaż z mistrzem pszczelarskim: ocena matki, praca podkurzaczem, karmienie i leczenie.' 
                        : prodType === 'candle' 
                        ? 'Gęsty wosk pszczeli (temperatura topnienia 62–64°C) spala się czysto i bardzo powoli.' 
                        : product.id === 'propolis-kit'
                        ? 'Pozyskiwany za pomocą specjalnych poławiaczy kratowych bez mechanicznych zanieczyszczeń.'
                        : product.id === 'pierzga-pszczela'
                        ? 'Ręczne wyjmowanie poszczególnych komórek pierzgi z dojrzałych plastrów woskowych.'
                        : product.id === 'pylek-pszczeli'
                        ? 'Zalanie letnią wodą na min. 6-8h przed wypiciem powoduje pęknięcie ziaren i uwolnienie witamin.'
                        : `Świeży surowiec z bieżącego sezonu (${product.harvestMonth}).`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WŁAŚCIWOŚCI ZDROWOTNE & APITERAPIA / GENETYKA */}
            {activeTab === 'zdrowie' && (
              <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#241D17] mb-2">
                    {prodType === 'bee-colony'
                      ? 'Zdrowotność rodziny i genetyka pszczół'
                      : prodType === 'candle'
                      ? 'Aromaterapia i ujemna jonizacja powietrza'
                      : 'Właściwości prozdrowotne i apiterapia'}
                  </h3>
                  <p className="text-sm sm:text-base text-[#594D42] leading-relaxed">
                    {prodType === 'bee-colony'
                      ? 'Gwarancja zdrowotności, czystości rasowej i łagodności matki pszczelej pod nadzorem PLW.'
                      : prodType === 'candle'
                      ? 'Czysty wosk pszczeli tworzy w pomieszczeniu uzdrawiający mikroklimat wolny od smogu i kurzu.'
                      : 'Prawdziwy surowiec z ula to bioaktywny dar natury o udokumentowanym działaniu prozdrowotnym.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.healthBenefits.map((benefit, idx) => {
                    const [title, desc] = benefit.includes('–')
                      ? benefit.split('–').map(s => s.trim())
                      : [benefit, ''];

                    return (
                      <div 
                        key={idx}
                        className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-[#D9821E]" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-[#1B4332]">{title}</p>
                          {desc && (
                            <p className="text-xs sm:text-sm text-[#594D42] mt-1 leading-relaxed">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Beekeeper Warning & Safety for the specific product */}
                <div className="space-y-3">
                  {prodType === 'bee-colony' ? (
                    <>
                      <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-emerald-950 mb-1">
                            Świadectwo zdrowotności Powiatowego Lekarza Weterynarii:
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Pasieka znajduje się pod urzędowym nadzorem weterynaryjnym (WNI 28143502). Rodziny są badane pod kątem zgnilca amerykańskiego (AFB) i chorób zakaźnych czerwiu. Do każdego odkładu wydawane jest zaświadczenie weterynaryjne.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#8C4609] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-[#8C4609]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Selekcja na wysoką łagodność (Carnica / Buckfast):
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Matka pszczela pochodzi z linii hodowlanej charakteryzującej się wyjątkowym spokojem na plastrach i niską skłonnością do żądlenia. Umożliwia to komfortową naukę i pracę przy ulu nawet początkującym pasjonatom.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : prodType === 'candle' ? (
                    <>
                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <Sparkles className="w-5 h-5 text-[#D9821E]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Ulga dla alergików i osób z astmą:
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            W przeciwieństwie do parafiny ropopochodnej (emitującej benzen i toluen), wosk pszczeli jonizuje ujemnie powietrze, neutralizując unoszące się drobinki smogu, kurzu, dymu i zarodników grzybów.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#8C4609] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-[#8C4609]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Zasady bezpiecznego palenia:
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Nigdy nie pozostawiaj zapalonej świecy bez nadzoru dorosłych. Świecę należy stawiać na żaroodpornej podstawce z dala od firanek, materiałów łatwopalnych i przeciągów.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : prodType === 'apitherapy' ? (
                    <>
                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <AlertCircle className="w-5 h-5 text-[#D9821E]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Ochrona enzymów ulowych (Zasada 40°C):
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Nigdy nie rozpuszczaj produktów apiterapeutycznych (pierzgi, pyłku, propolisu) w płynach o temperaturze powyżej 40°C! W wyższych temperaturach białka enzymatyczne, cenne biopierwiastki i witaminy ulegają termicznej degradacji.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#8C4609] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-[#8C4609]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Próba uczuleniowa (Bezpieczeństwo apiterapii):
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Czyste produkty ulowe charakteryzują się bardzo wysoką aktywnością biologiczną. Osoby z podejrzeniem alergii na pyłki lub produkty pszczele powinny rozpoczynać kurację od minimalnej ilości (np. 1 ziarenko pyłku/pierzgi pod język lub 1 kropla nalewki propolisowej na skórę) i obserwować reakcję organizmu.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <AlertCircle className="w-5 h-5 text-[#D9821E]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Ochrona enzymów miodu (Zasada 40°C):
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Prawdziwy miód na zimno zachowuje pełnię aktywnych enzymów pszczelich (inhibina, lizozym). Nigdy nie dodawaj miodu do wrzątku ani herbaty cieplejszej niż 40°C – wysoka temperatura niszczy enzymy, a miód traci swoje unikalne właściwości prozdrowotne.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border border-[#D9821E]/20 shadow-2xs flex items-start gap-3.5 leading-relaxed">
                        <div className="w-8 h-8 rounded-xl bg-[#FAF3E5] text-[#8C4609] flex items-center justify-center border border-[#D9821E]/25 shrink-0 mt-0.5">
                          <ShieldAlert className="w-5 h-5 text-[#8C4609]" />
                        </div>
                        <div>
                          <strong className="block text-sm sm:text-base font-bold text-[#1B4332] mb-1">
                            Próba uczuleniowa i bezpieczeństwo:
                          </strong>
                          <p className="text-xs sm:text-sm text-[#594D42] leading-relaxed">
                            Surowy, niefiltrowany miód zawiera mikroskopijne cząstki naturalnego pyłku roślinnego. Osoby ze skłonnością do silnych alergii pyłkowych powinny zaczynać spożywanie nowej odmiany od niewielkiej ilości (np. 1/4 łyżeczki). Zgodnie z zaleceniami pediatrycznymi, miodu nie podajemy niemowlętom poniżej 1. roku życia.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: JAK STOSOWAĆ & ODBIÓR & HODOWLA */}
            {activeTab === 'kulinaria' && (
              <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#241D17] mb-2">
                    {prodType === 'bee-colony'
                      ? 'Wytyczne odbioru i zasiedlenia odkładu w ulu'
                      : prodType === 'candle'
                      ? 'Instrukcja prawidłowego palenia świecy'
                      : prodType === 'apitherapy'
                      ? 'Dawkowanie i sprawdzone przepisy kuracji'
                      : 'Inspiracje kulinarne i zalecenia spożywania'}
                  </h3>
                  <p className="text-sm text-[#594D42]">
                    {prodType === 'bee-colony'
                      ? 'Praktyczne kroki od odbioru w pasiece po udany rozwój rodziny w Twojej pasiece.'
                      : prodType === 'candle'
                      ? 'Jak cieszyć się optymalnym płomieniem, miodowym zapachem i maksymalnym czasem palenia.'
                      : prodType === 'apitherapy'
                      ? 'Jak optymalnie włączyć ten produkt do codziennej diety i profilaktyki zdrowotnej.'
                      : 'Jak w pełni wykorzystać potencjał smakowy i odżywczy tego miodu w codziennej diecie.'}
                  </p>
                </div>

                {/* Werdykt Doradcy • Kiedy wybrać ten produkt */}
                {product.advisorVerdict && (
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-[#E6C065] flex items-center justify-center shadow-xs shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#D9821E] uppercase tracking-wider block">
                          Werdykt Pszczelarza & Doradcy
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-[#1B4332]">
                          Kiedy i dla kogo warto wybrać {product.name}?
                        </h4>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#3A332A] leading-relaxed font-normal sm:pl-12">
                      {product.advisorVerdict}
                    </p>

                    {product.masterTip && (
                      <div className="sm:ml-12 pt-3 border-t border-[#D9821E]/15 flex items-start gap-2.5 text-xs sm:text-sm text-[#594D42] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#D9821E]/15">
                        <span className="px-2 py-0.5 rounded-md bg-[#1B4332] text-white font-bold text-[10px] uppercase tracking-wider shrink-0 mt-0.5">
                          Wskazówka mistrza
                        </span>
                        <span className="leading-relaxed italic">{product.masterTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Highlighted box - Dawkowanie / transport / palenie */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#D9821E] uppercase tracking-wider block">
                        {prodType === 'bee-colony' 
                          ? 'Logistyka & Odbiór' 
                          : prodType === 'candle' 
                          ? 'Rytuał palenia' 
                          : 'Zalecenia dzienne'}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-[#1B4332]">
                        {prodType === 'bee-colony' 
                          ? 'Rekomendowane warunki transportu odkładu' 
                          : prodType === 'candle' 
                          ? 'Zalecany czas sesji palenia' 
                          : 'Zalecana kuracja codzienna'}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-[#3A332A] leading-relaxed font-normal sm:pl-12">
                    {prodType === 'bee-colony' 
                      ? product.pairing 
                      : prodType === 'candle' 
                      ? 'Pal świecę jednorazowo przez minimum 2-3 godziny, by roztopić wosk równomiernie do samych krawędzi słoika (zapobiega to tunelowaniu i gwarantuje najdłuższy czas palenia).' 
                      : product.detailedUsage.recommendedDose}
                  </p>
                </div>

                {/* Food pairing box for honeys */}
                {prodType === 'honey' && product.pairing && (
                  <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-[#D9821E] uppercase tracking-wider block">
                          Kulinaria & Pairing
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-[#1B4332]">
                          Rekomendowane połączenia smakowe (Food Pairing)
                        </h4>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#3A332A] leading-relaxed font-normal sm:pl-12">
                      {product.pairing}
                    </p>
                  </div>
                )}

                {/* Usage points */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D9821E]/20 shadow-2xs space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF3E5] text-[#D9821E] flex items-center justify-center border border-[#D9821E]/25 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#D9821E] uppercase tracking-wider block">
                        Inspiracje & Wskazówki
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-[#1B4332]">
                        {prodType === 'bee-colony' 
                          ? 'Procedura krok po kroku w pasiece' 
                          : prodType === 'candle' 
                          ? 'Wskazówki pasiecznej manufaktury' 
                          : 'Praktyczne sposoby podania i inspiracje'}
                      </h4>
                    </div>
                  </div>

                  <div className="sm:pl-12">
                    <ul className="grid grid-cols-1 gap-2.5">
                      {product.detailedUsage.culinaryIdeas.map((idea, i) => (
                        <li 
                          key={i} 
                          className="flex items-start gap-3 text-sm text-[#3A332A] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#D9821E]/15 leading-relaxed"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#1B4332] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BADANIA LABORATORYJNE & ŚWIADECTWO WETERYNARYJNE */}
            {activeTab === 'badania' && (
              <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#241D17] mb-2">
                      {prodType === 'bee-colony'
                        ? 'Świadectwo weterynaryjne i rejestr pasieki'
                        : prodType === 'candle'
                        ? 'Atest czystości wosku pszczelego'
                        : 'Parametry laboratoryjne i mikrobiologiczne'}
                    </h3>
                    <p className="text-sm sm:text-base text-[#594D42] leading-relaxed">
                      {prodType === 'bee-colony'
                        ? 'Legalna pasieka hodowlana pod stałą kontrolą Powiatowego Lekarza Weterynarii.'
                        : prodType === 'candle'
                        ? '100% czysty wosk pszczeli badany na brak zafałszowań parafiną i stearyną.'
                        : 'Każda partia surowca ulowego przechodzi rygorystyczne badania czystości.'}
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 text-xs font-bold text-[#1B4332] self-start sm:self-center shrink-0">
                    {prodType === 'bee-colony' 
                      ? 'Nadzór Weterynaryjny PIW' 
                      : prodType === 'candle' 
                      ? 'Czystość Cera Flava 100%' 
                      : 'Certyfikat Weterynaryjny PIW'}
                  </div>
                </div>

                {/* Lab Table */}
                <div className="overflow-x-auto border border-[#D9821E]/20 rounded-2xl shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-[#D9821E]/20 text-[#D9821E] uppercase text-[11px] font-bold tracking-wider bg-[#FAF8F5]">
                        <th className="py-3.5 px-4">Badany parametr</th>
                        <th className="py-3.5 px-4">Wynik partii</th>
                        <th className="py-3.5 px-4">Wymóg formalny / Norma</th>
                        <th className="py-3.5 px-4 text-right">Ocena</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9821E]/10">
                      {prodType === 'bee-colony' ? (
                        <>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Identyfikator partii odkładów</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#D9821E]">{product.labAnalysis.lotNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Ewidencja pasieczna</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Zgodny</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Rejestr Powiatowego Lekarza Weterynarii</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">WNI 28143502</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">PIW Ostróda / Morąg</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Rejestrowany</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Badanie w kierunku zgnilca amerykańskiego (AFB)</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">Wynik ujemny (brak przetrwalników)</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Urzędowa norma PLW</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Wolna od chorób</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Matka pszczela (Królowa)</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">Młoda 2026, znakowana opalitkiem</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Unasieniona, czerwiąca</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Pełna plenność</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Stan czerwiu i gniazda</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">3 ramki czerwiu + 2 ramki pokarmu</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Ramka wielkopolska</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Prawidłowy</td>
                          </tr>
                        </>
                      ) : prodType === 'candle' ? (
                        <>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Numer partii manufaktury</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#D9821E]">{product.labAnalysis.lotNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Identyfikowalność partii</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Zgodny</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Zawartość czystego wosku pszczelego</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">100.0% (Cera flava)</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Brak domieszek</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ 100% Czysty wosk</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Zawartość parafiny / stearyny</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">0.0% (Całkowity brak)</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Maksymalnie 0.0%</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Czysty ekologicznie</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Temperatura topnienia wosku</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">62.8°C</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Norma 62.0 - 65.0°C</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Zgodny z normą PN</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Rodzaj knota</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">100% surowa bawełna (bez ołowiu)</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Bezpieczeństwo dróg oddechowych</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Czyste spalanie</td>
                          </tr>
                        </>
                      ) : prodType === 'apitherapy' ? (
                        <>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Numer partii rozlewu/konfekcji</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#D9821E]">{product.labAnalysis.lotNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Identyfikowalność</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Zgodny</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Wilgotność surowca</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.waterContent}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Norma apiterapeutyczna</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Bezpieczna trwałość</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Aktywność biologiczna / Składniki czynne</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.diastaseNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Wysokie stężenie</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Pełna bioaktywność</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Czystość chemiczna i mikrobiologiczna</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">Zgodna z wymogami GIS</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Brak metali ciężkich i pestycydów</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Certyfikowany</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Numer partii rozlewu</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#D9821E]">{product.labAnalysis.lotNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Identyfikowalność</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Zgodny</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Zawartość wody (wilgotność)</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.waterContent}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Maksymalnie 20.0%</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Doskonała gęstość</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Liczba diastazowa (aktywność enzymów)</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.diastaseNumber}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Minimum 8.0 wg Schade</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Bardzo wysoka</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 px-4 font-semibold text-[#241D17]">Zawartość HMF (hydroksymetylfurfural)</td>
                            <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.hmf}</td>
                            <td className="py-3.5 px-4 text-[#7A6A5A]">Maksymalnie 40.0 mg/kg</td>
                            <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Świeży, niepodgrzewany</td>
                          </tr>
                          {product.labAnalysis.conductivity && (
                            <tr>
                              <td className="py-3.5 px-4 font-semibold text-[#241D17]">Przewodność właściwa</td>
                              <td className="py-3.5 px-4 font-bold text-[#1B4332]">{product.labAnalysis.conductivity}</td>
                              <td className="py-3.5 px-4 text-[#7A6A5A]">Potwierdzenie czystości</td>
                              <td className="py-3.5 px-4 text-right text-[#1B4332] font-bold">✓ Certyfikowany</td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#D9821E]/20 text-sm text-[#594D42] flex items-center gap-3.5 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-[#1B4332] shrink-0" />
                  <span>
                    Pasieka znajduje się pod stałym nadzorem Powiatowego Lekarza Weterynarii. 
                    Rejestr RHD: <strong>WNI 28143502</strong>. Czyste produkty pszczele bez sztucznych dodatków.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 5: OPINIE */}
            {activeTab === 'opinie' && (
              <ProductReviews productName={product.name} productId={product.id} productType={prodType} />
            )}

          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="border-t border-[#D9821E]/20 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9821E]">
                {isTreasure ? 'Tradycja i pasja Pasieki Usza' : 'Poznaj zbiory Pasieki Usza'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#241D17]">
                {isTreasure ? 'Poznaj pozostałe Skarby Ula' : 'Zobacz także inne odmiany miodów'}
              </h3>
            </div>
            <Link
              to={isTreasure ? '/skarby-ula' : '/sklep'}
              className="text-xs font-bold text-[#1B4332] hover:text-[#D9821E] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isTreasure ? 'Wszystkie Skarby Ula w ofercie' : 'Wszystkie miody w ofercie'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relProd) => {
              const relImage = relProd.images?.[0] || relProd.imageUrl;
              const firstSize = relProd.sizesList[0];

              return (
                <div
                  key={relProd.id}
                  onClick={() => {
                    navigate(`/produkt/${relProd.id}`);
                  }}
                  className="bg-white rounded-3xl border border-[#D9821E]/20 overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF6EE]">
                      <img
                        src={relImage}
                        alt={relProd.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = relProd.imageUrl;
                        }}
                      />
                      {relProd.badge && (
                        <span className={`absolute top-3 left-3 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-xs ${relProd.badgeClass || 'bg-[#D9821E]'}`}>
                          {relProd.badge}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                        {relProd.harvestYear}
                      </span>
                    </div>

                    <div className="p-5">
                      <p className="text-[11px] font-semibold text-[#D9821E] uppercase tracking-wider mb-1">
                        {CATEGORY_METADATA[relProd.category]?.label || (relProd.productType === 'apitherapy' ? 'Apiterapia' : 'Skarby Ula')}
                      </p>
                      <h4 className="text-base font-bold text-[#241D17] group-hover:text-[#D9821E] transition-colors line-clamp-1 mb-1.5 font-serif">
                        {relProd.name}
                      </h4>
                      <p className="text-xs text-[#7A6A5A] line-clamp-2 mb-3 leading-relaxed">
                        {relProd.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-[#D9821E]/10 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-[#7A6A5A] block">od ({firstSize?.gram || '450g'}):</span>
                      <span className="text-base font-extrabold text-[#1B4332]">{firstSize?.price || 38} zł</span>
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#1B4332] bg-[#FAF6EE] group-hover:bg-[#1B4332] group-hover:text-white border border-[#1B4332]/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Szczegóły</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODERN RESPONSIVE STICKY BOTTOM BUY BAR */}
      <aside 
        aria-label="Pasek szybkiego zakupu"
        className={`fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#DFCBB5] shadow-2xl transition-all duration-300 transform ${
          isStickyBarVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* LEWA STRONA: Miniatura, Nazwa produktu i Cena */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-[#DFCBB5] bg-white shrink-0 shadow-2xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = product.imageUrl;
              }}
            />
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#23201C] truncate leading-tight">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="font-sans font-black text-sm sm:text-base text-[#1B4332] tabular-nums">
                  {((effectivePrice || 0) * quantity).toFixed(2)} zł
                </span>
                {quantity > 1 && (
                  <span className="text-[10px] text-[#7A6A5A] hidden sm:inline">
                    ({quantity} × {effectivePrice} zł)
                  </span>
                )}
                {purchaseMode === 'subscription' && (
                  <span className="text-[9.5px] font-bold text-[#8C4609] bg-[#E5983A]/20 px-1.5 py-0.5 rounded-md leading-none">
                    -10% co {subscriptionInterval} dni
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ŚRODEK & PRAWA STRONA: Wybór gramatury, Licznik ilości i Przycisk */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Przełącznik gramatur dla desktopu / tabletu */}
            {product.sizesList.length > 1 && (
              <div className="hidden md:flex items-center gap-1 bg-[#EFE7DC] p-1 rounded-xl border border-[#DFD3C2]">
                {product.sizesList.map((size, idx) => {
                  const isSelected = selectedSizeIdx === idx;
                  return (
                    <button
                      key={size.gram + idx}
                      type="button"
                      onClick={() => setSelectedSizeIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] text-white shadow-2xs'
                          : 'text-[#594D42] hover:text-[#1B4332] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {size.gram}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Kompaktowy selektor gramatur na mobile */}
            {product.sizesList.length > 1 && (
              <div className="md:hidden flex items-center">
                <select
                  value={selectedSizeIdx}
                  onChange={(e) => setSelectedSizeIdx(Number(e.target.value))}
                  className="text-[11px] font-bold text-[#1B4332] bg-[#FAF5ED] border border-[#D9821E]/30 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
                  aria-label="Wybierz gramaturę"
                >
                  {product.sizesList.map((size, idx) => (
                    <option key={idx} value={idx}>
                      {size.gram}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Licznik sztuk */}
            <div className="hidden sm:flex items-center border border-[#D9821E]/30 rounded-xl bg-white overflow-hidden shadow-2xs h-8 sm:h-9">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-full flex items-center justify-center font-bold text-[#594D42] hover:bg-[#FAF6EE] hover:text-[#1B4332] transition-colors cursor-pointer text-sm"
                title="Zmniejsz ilość"
              >
                -
              </button>
              <span className="w-7 text-center font-bold text-xs text-[#241D17] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-full flex items-center justify-center font-bold text-[#594D42] hover:bg-[#FAF6EE] hover:text-[#1B4332] transition-colors cursor-pointer text-sm"
                title="Zwiększ ilość"
              >
                +
              </button>
            </div>

            {/* Główny przycisk dodania do koszyka */}
            <button
              onClick={handleAddToCart}
              className="py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#1B4332] hover:bg-[#143326] transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
              id="btn-dodaj-koszyk-sticky"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-[#E6C065]" />
                  <span>Dodano!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#F3C06B]" />
                  <span className="hidden xs:inline">Dodaj do koszyka</span>
                  <span className="xs:hidden">Do koszyka</span>
                </>
              )}
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
};
