import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/assets';
import { 
  Award, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Info, 
  ShoppingBag, 
  MapPin, 
  CheckCircle2,
  Sparkles,
  Compass,
  ShieldCheck,
  Droplets,
  FileText,
  Coffee,
  Heart,
  Layers,
  Leaf,
  Sliders,
  Monitor,
  Maximize2,
  Trees,
  Flame,
  Feather,
  Zap,
  Sun
} from 'lucide-react';
import { HoneyProduct } from '../types';
import { HONEY_PRODUCTS } from '../data/honeyProducts';
import { HoneyJar3DCarousel } from './HoneyJar3DCarousel';
import { useDisplayResolution } from '../hooks/useDisplayResolution';

export interface VarietyFeature {
  title: string;
  description: string;
  iconName: 'droplets' | 'coffee' | 'shield' | 'heart' | 'flame' | 'trees' | 'sparkles' | 'feather' | 'zap';
}

export interface VarietyItem {
  id: string;
  product: HoneyProduct;
  tagline: string;
  vintageYear: string;
  terroirLocation: string;
  pollenNote: string;
  flavorTastingNotes: string;
  teaPairingNote: string;
  ambientToneHex: string;
  badge: string;
  defaultVideoUrl?: string;
  // Dynamiczna karta po prawej stronie słoika
  cardCategorySubtitle: string;
  cardMainTitle: string;
  cardBadgeIcon: 'coffee' | 'heart' | 'trees' | 'sparkles' | 'feather' | 'sun';
  cardFeatures: VarietyFeature[];
  cardTastingTip: string;
}

export const HERO_VARIETIES: VarietyItem[] = [
  {
    id: 'lipowy',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-lipowy') || HONEY_PRODUCTS[0],
    defaultVideoUrl: getAssetUrl('videos/lipowy-v2.webm'),
    tagline: 'Królewski miód lipowy pozyskiwany z pachnącego kwiatu lipy drobnolistnej. Niezastąpiony do wieczornego kubka gorącej herbaty z cytryną w chłodne dni.',
    vintageYear: 'Zbiór Letni 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Czysty nektar lipy drobnolistnej • Naturalnie łagodzi gardło',
    flavorTastingNotes: 'Głęboki, ciepły zapach kwiatu lipy, delikatnie żywiczny finisz i aksamitna słodycz.',
    teaPairingNote: 'Najlepszy z czarną herbatą i cytryną lub naparem z suszonej lipy.',
    ambientToneHex: '#E5983A',
    badge: 'Klasyk do Gorącej Herbaty',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Ciepło Domu & Herbata',
    cardBadgeIcon: 'coffee',
    cardFeatures: [
      {
        title: 'Wirowany na zimno (RAW)',
        description: 'Nigdy nie podgrzewany powyżej 36°C. Zachowuje 100% enzymów, pyłków i aromat kwiatów lipy.',
        iconName: 'droplets'
      },
      {
        title: 'Sekret do gorącej herbaty',
        description: 'Dodawaj do kubka po przestudzeniu do ok. 40°C — wtedy olejki eteryczne koją gardło bez utraty enzymów.',
        iconName: 'coffee'
      },
      {
        title: 'Brak standaryzacji',
        description: 'Nie mieszamy miodu w masę. Prawdziwy, czysty zbiór od naszych wędrownych rodzin pszczelich.',
        iconName: 'shield'
      }
    ],
    cardTastingTip: 'Prawdziwy klasyk na chłodne wieczory: łyżka miodu, plaster cytryny i świeży napar lipowy.'
  },
  {
    id: 'gryczany',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-gryczany') || HONEY_PRODUCTS[5],
    defaultVideoUrl: getAssetUrl('videos/gryczany.mp4'),
    tagline: 'Ciemny, wyrazisty miód o zapachu palonego karmelu. Cudownie rozgrzewa i idealnie pasuje do pajdy wiejskiego chleba z masłem.',
    vintageYear: 'Zbiór Sierpniowy 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Bogaty w naturalne żelazo i rutynę • Krzepiący i sycący',
    flavorTastingNotes: 'Intensywny aromat melasy i palonych ziaren, głęboki ciemnobrunatny kolor i mocny smak.',
    teaPairingNote: 'Idealny do mocnej herbaty z imbirem oraz jako dodatek do domowego piernika.',
    ambientToneHex: '#E57A22',
    badge: 'Na Chłodne Wieczory',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Moc Krzepy & Żelazo',
    cardBadgeIcon: 'heart',
    cardFeatures: [
      {
        title: 'Rekordowa zawartość rutyny',
        description: 'Gryka obficie nasyca miód rutyną i łatwo przyswajalnym żelazem, które naturalnie wzmacniają serce i naczynia.',
        iconName: 'heart'
      },
      {
        title: 'Aromat palonego karmelu',
        description: 'Intensywny, korzenno-wytrawny bukiet i ciemna barwa melasy. Prawdziwa gratka dla miłośników wyrazistego smaku.',
        iconName: 'flame'
      },
      {
        title: 'Do ciemnego pieczywa i piernika',
        description: 'Niezastąpiony do tradycyjnych staropolskich pierników, sosów pieczeniowych i pajdy wiejskiego chleba z masłem.',
        iconName: 'coffee'
      }
    ],
    cardTastingTip: 'Wypróbuj z mocną czarną herbatą z plastrem imbiru — genialnie rozgrzewa po jesiennym spacerze.'
  },
  {
    id: 'akacja',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-akacjowy') || HONEY_PRODUCTS[3],
    defaultVideoUrl: getAssetUrl('videos/akacja-v2.webm'),
    tagline: 'Złocisto-jasny, wyjątkowo łagodny nektar z białej akacji. Długo płynny, aksamitny – słodzi napoje bez zmiany ich naturalnego smaku.',
    vintageYear: 'Zbiór Czerwcowy 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Nektar z robinii akacjowej • Wyjątkowo łagodny dla żołądka',
    flavorTastingNotes: 'Niezwykle subtelny, z nutą wanilii i wiosennych kwiatów, aksamitnie gładki na języku.',
    teaPairingNote: 'Wspaniale słodzi herbatę rumiankową, miętę, melisę i zieloną herbatę.',
    ambientToneHex: '#DDA83B',
    badge: 'Delikatny i Łagodny',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Aksamitny Nektar & Żołądek',
    cardBadgeIcon: 'feather',
    cardFeatures: [
      {
        title: 'Najłagodniejszy dla żołądka',
        description: 'Wyjątkowo niska kwasowość i aksamitna delikatność. Polecany przy kłopotach trawiennych, zgadze i dla dzieci.',
        iconName: 'feather'
      },
      {
        title: 'Miesiącami płynny (patoka)',
        description: 'Wysoka zawartość naturalnej fruktozy sprawia, że krystalizuje najwolniej ze wszystkich polskich miodów.',
        iconName: 'droplets'
      },
      {
        title: 'Czysty słodzik niepsujący smaku',
        description: 'Subtelny, waniliowy bukiet nie zmienia smaku delikatnych ziół, mięty, rumianku, melisy czy herbaty zielonej.',
        iconName: 'coffee'
      }
    ],
    cardTastingTip: 'Znakomity do słodzenia wieczornych ziół wyciszających i letnich domowych lemoniad.'
  },
  {
    id: 'rzepakowy',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-rzepakowy') || HONEY_PRODUCTS[6],
    defaultVideoUrl: getAssetUrl('videos/rzepakowy-v2.webm'),
    tagline: 'Kremowobiały, puszysty krem z pierwszych majowych kwiatów. Rozpływa się w ustach, dając uczucie ciepła i domowego spokoju.',
    vintageYear: 'Zbiór Majowy 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Pierwsze wiosenne miodobranie • Błyskawiczny zastrzyk energii',
    flavorTastingNotes: 'Puszysty, perłowy krem o łagodnym, ciepłym smaku świeżego mleka i miodu.',
    teaPairingNote: 'Niezastąpiony do porannej herbaty i chrupiącej ciepłej bułki z masłem.',
    ambientToneHex: '#D4AA55',
    badge: 'Pierwszy Zbiór Wiosenny',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Wiosenny Krem & Serce',
    cardBadgeIcon: 'sun',
    cardFeatures: [
      {
        title: 'Najszybsza energia dla serca',
        description: 'Ponad 50% łatwo przyswajalnej glukozy błyskawicznie odżywia mięsień sercowy i regeneruje po wysiłku.',
        iconName: 'zap'
      },
      {
        title: 'Śnieżnobiały puszysty krem',
        description: 'Kremowany na zimno tuż po odwirowaniu. Ma aksamitną, perłową strukturę i rozpływa się w ustach.',
        iconName: 'droplets'
      },
      {
        title: 'Pierwszy zbiór wiosenny',
        description: 'Wiosenne miodobranie z wolnych od zanieczyszczeń łąk. Łagodny, ciepły zapach polskiego maja.',
        iconName: 'shield'
      }
    ],
    cardTastingTip: 'Niezrównany rano na chrupiącą bułkę z wiejskim masłem do kubka kawy zbożowej lub mleka.'
  },
  {
    id: 'wrzosowy',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-wrzosowy') || HONEY_PRODUCTS[1],
    defaultVideoUrl: getAssetUrl('videos/wrzosowy-v2.webm'),
    tagline: 'Szlachetny, galaretowaty miód z dzikich pożytków wrzosowych. Niezwykle rzadki rarytas o wytrawnym, głębokim smaku.',
    vintageYear: 'Zbiór Wrześniowy 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Królewski miód z wrzosu • Galaretowata konsystencja',
    flavorTastingNotes: 'Aromatyczny, lekko gorzkawy, głęboki smak wrzosowiska o bursztynowo-rubinowej barwie.',
    teaPairingNote: 'Doskonały do degustacji łyżeczką oraz do wykwintnych serów i orzechów.',
    ambientToneHex: '#A05C22',
    badge: 'Rarytas Pasieki Usza',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Królewski Wrzos & Galaretka',
    cardBadgeIcon: 'sparkles',
    cardFeatures: [
      {
        title: 'Naturalna konsystencja galaretki',
        description: 'Miód wrzosowy jako jedyny posiada naturalną galaretowatą strukturę bogatą w białka i biopierwiastki.',
        iconName: 'sparkles'
      },
      {
        title: 'Wsparcie układu moczowego',
        description: 'Tradycyjnie stosowany przy schorzeniach nerek, dróg moczowych oraz dla zdrowia prostaty.',
        iconName: 'heart'
      },
      {
        title: 'Trudny zbiór jesienny',
        description: 'Ostatnie miodobranie w roku, wymagające ogromnego kunsztu i specjalnych odsklepiaczy.',
        iconName: 'shield'
      }
    ],
    cardTastingTip: 'Znakomity do deski długodojrzewających serów, orzechów włoskich i pieczonego pieczywa.'
  },
  {
    id: 'spadziowy',
    product: HONEY_PRODUCTS.find(p => p.id === 'miod-ze-spadzi-iglastej') || HONEY_PRODUCTS[2],
    defaultVideoUrl: getAssetUrl('videos/spadziowy.mp4'),
    tagline: 'Szlachetny, ciemny miód ze spadzi drzew iglastych. Żywiczny aromat i naturalne wsparcie odporności.',
    vintageYear: 'Zbiór Leśny 2026',
    terroirLocation: 'Pasieka Wędrowna Usza • Dolny Śląsk',
    pollenNote: 'Spadź iglasta • 9-krotnie więcej biopierwiastków niż w miodach nektarowych',
    flavorTastingNotes: 'Łagodny, leśno-żywiczny aromat, głęboka barwa i nienachalna, stonowana słodycz.',
    teaPairingNote: 'Wyborny do powolnego kosztowania z drewnianej łyżeczki i do naparów z igliwia lub dzikiej róży.',
    ambientToneHex: '#C44D1E',
    badge: 'Rarytas Pasieki Usza',
    cardCategorySubtitle: 'PASIEKA WĘDROWNA • DOLNY ŚLĄSK',
    cardMainTitle: 'Królewska Spadź & Minerały',
    cardBadgeIcon: 'trees',
    cardFeatures: [
      {
        title: '9x więcej biopierwiastków',
        description: 'Spadź iglasta ze świerków i jodeł zawiera 9-krotnie więcej potasu, magnezu i fosforu niż miody kwiatowe.',
        iconName: 'trees'
      },
      {
        title: 'Żywiczny aromat lasu',
        description: 'Głęboka, ciemnobrunatna barwa z zielonkawym refleksem oraz szlachetna słodycz z nutą leśnego igliwia.',
        iconName: 'droplets'
      },
      {
        title: 'Królewska tarcza odporności',
        description: 'Od stuleci ceniony za silne działanie wzmacniające organizm i wsparcie dróg oddechowych.',
        iconName: 'shield'
      }
    ],
    cardTastingTip: 'Najlepiej kosztować powoli z drewnianej łyżeczki, dając mu rozpuścić się na języku.'
  },
];

const renderFeatureIcon = (iconName: VarietyFeature['iconName']) => {
  switch (iconName) {
    case 'droplets':
      return <Droplets className="w-3.5 h-3.5 text-[#E5983A]" />;
    case 'coffee':
      return <Coffee className="w-3.5 h-3.5 text-[#E5983A]" />;
    case 'shield':
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    case 'heart':
      return <Heart className="w-3.5 h-3.5 text-rose-400" />;
    case 'flame':
      return <Flame className="w-3.5 h-3.5 text-amber-500" />;
    case 'trees':
      return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
    case 'sparkles':
      return <Sparkles className="w-3.5 h-3.5 text-amber-300" />;
    case 'feather':
      return <Feather className="w-3.5 h-3.5 text-amber-200" />;
    case 'zap':
      return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    default:
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  }
};

const renderBadgeIcon = (badgeIcon: VarietyItem['cardBadgeIcon']) => {
  switch (badgeIcon) {
    case 'coffee':
      return <Coffee className="w-4 h-4 text-[#E0A94F]" />;
    case 'heart':
      return <Heart className="w-4 h-4 text-rose-400" />;
    case 'trees':
      return <Trees className="w-4 h-4 text-emerald-400" />;
    case 'sparkles':
      return <Sparkles className="w-4 h-4 text-amber-300" />;
    case 'feather':
      return <Feather className="w-4 h-4 text-amber-200" />;
    case 'sun':
      return <Sun className="w-4 h-4 text-amber-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-[#E0A94F]" />;
  }
};

// ─── HeroTextPanel ──────────────────────────────────────────────────────────
// Isolated sub-component so that `selectedIdx` changes trigger a clean
// GSAP stagger reveal without touching the 3D carousel or ambient layers.
interface HeroTextPanelProps {
  selectedIdx: number;
  currentItem: VarietyItem;
  currentProduct: HoneyProduct;
  selectedSizeIdx: number;
  setSelectedSizeIdx: (idx: number) => void;
  selectedSize: { weightGrams: number; pricePln: number };
  onAddToCart?: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onOpenProductDetail?: (product: HoneyProduct) => void;
  onScrollToProducts: () => void;
}

const HeroTextPanel: React.FC<HeroTextPanelProps> = ({
  selectedIdx,
  currentItem,
  currentProduct,
  selectedSizeIdx,
  setSelectedSizeIdx,
  selectedSize,
  onAddToCart,
  onOpenProductDetail,
  onScrollToProducts,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const children = Array.from(wrapper.children) as HTMLElement[];
    if (children.length === 0) return;
    gsap.killTweensOf(children);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.08, delay: 0.15 }
      );
    } else {
      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power2.out', stagger: 0.06 }
      );
    }
  }, [selectedIdx]);

  return (
    <div
      ref={wrapperRef}
      className="order-2 lg:order-1 lg:col-span-5 xl:col-span-5 text-center lg:text-left space-y-3 sm:space-y-4 md:space-y-5"
    >
      {/* Badges row */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
        <div
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border shadow-sm bg-[#261E17]/80 backdrop-blur-sm"
          style={{
            borderColor: `${currentItem.ambientToneHex}45`,
            color: currentItem.ambientToneHex
          }}
        >
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" style={{ color: currentItem.ambientToneHex }} />
          <span>{currentItem.badge}</span>
        </div>
        <span className="text-[11px] sm:text-xs text-[#C5BCAD] font-sans px-2.5 py-1 rounded-full bg-[#2A221A]/80 border border-[#44362A]">
          {currentItem.vintageYear} • Zbiór Dolnośląski
        </span>
      </div>

      {/* Title & tagline */}
      <div className="space-y-1.5 sm:space-y-2">
        <Link
          to={`/produkt/${currentProduct.id}`}
          className="group inline-block text-left"
          title={`Przejdź do dedykowanej podstrony: ${currentProduct.name}`}
        >
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-[#FAF7F2] group-hover:text-[#E0A94F] transition-colors tracking-tight leading-[1.1] flex items-center justify-center lg:justify-start gap-2 sm:gap-2.5">
            <span>{currentProduct.name}</span>
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 text-[#E0A94F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all inline-block shrink-0" />
          </h1>
        </Link>
        <p className="text-xs sm:text-sm text-[#D5CCBE] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
          {currentItem.tagline}
        </p>
      </div>

      {/* Wybór wielkości słoika */}
      <div className="space-y-1.5 max-w-md mx-auto lg:mx-0 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[#B8AEA0]">
          <span>Wybierz pojemność słoika:</span>
          <span className="text-[#E0A94F] font-semibold">{selectedSize.weightGrams}g ({selectedSize.pricePln} zł)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {currentProduct.sizes.map((s, idx) => {
            const isSizeActive = idx === selectedSizeIdx;
            const isLarge = s.weightGrams >= 900;
            return (
              <button
                key={s.weightGrams}
                onClick={() => setSelectedSizeIdx(idx)}
                className={`py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold flex flex-col items-start justify-between gap-1 transition-all border text-left cursor-pointer ${
                  isSizeActive
                    ? 'bg-[#E0A94F]/20 border-[#E0A94F] text-[#FAF7F2] shadow-md shadow-black/40 ring-1 ring-[#E0A94F]/40'
                    : 'bg-[#261E17]/80 border-[#3E3024] text-[#D8CEBF] hover:border-[#6B533E] hover:bg-[#33281F]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs sm:text-sm">{s.weightGrams}g</span>
                  <span className={`font-mono text-[11px] sm:text-xs ${isSizeActive ? 'text-[#E0A94F] font-bold' : 'text-[#A3998C]'}`}>
                    {s.pricePln} zł
                  </span>
                </div>
                <span className="text-[9.5px] sm:text-[10px] text-[#A3998C] font-normal leading-none">
                  {isLarge ? 'Duży spiżarniany' : 'Poręczny stołowy'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Akcje zakupu */}
      <div className="space-y-2 max-w-md mx-auto lg:mx-0 pt-0.5 sm:pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(currentProduct, selectedSize.weightGrams, selectedSize.pricePln)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#E0A94F] hover:bg-[#E8B663] text-[#1A1511] font-bold text-xs sm:text-sm shadow-lg shadow-black/30 transition-all active:scale-98 cursor-pointer"
              id="hero-btn-dodaj-koszyk"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Kup teraz • {selectedSize.pricePln} zł</span>
            </button>
          )}
          <Link
            to={`/produkt/${currentProduct.id}`}
            onClick={() => {
              try {
                sessionStorage.setItem('pasieka_last_product_id', currentProduct.id);
                sessionStorage.setItem('pasieka_home_scroll_y', '0');
                sessionStorage.setItem('pasieka_from_hero', 'true');
              } catch {}
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 rounded-2xl bg-[#282018]/90 hover:bg-[#382C22] border border-[#4A3B2D] hover:border-[#E0A94F]/70 text-[#FAF7F2] font-bold text-xs sm:text-sm shadow-md transition-all group cursor-pointer"
            id="hero-btn-karta-miodu"
            title={`Otwórz pełną podstronę miodu: ${currentProduct.name}`}
          >
            <span>Karta miodu &amp; badania</span>
            <ArrowRight className="w-4 h-4 text-[#E0A94F] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 pt-0.5 text-[11px] sm:text-[11.5px] text-[#9E9485]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Wysyłka w 24h prosto z pasieki</span>
          </div>
          {onOpenProductDetail && (
            <button
              onClick={() => onOpenProductDetail(currentProduct)}
              className="font-medium flex items-center gap-1 hover:underline transition-colors cursor-pointer text-[#E0A94F]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Szybki podgląd ({currentProduct.batchNumber})</span>
            </button>
          )}
        </div>
        {onScrollToProducts && (
          <div className="flex sm:hidden items-center justify-center pt-2">
            <button
              onClick={onScrollToProducts}
              className="flex items-center gap-1.5 text-xs font-medium text-[#E0A94F] hover:underline cursor-pointer"
            >
              <span>Zobacz całą domową spiżarnię miodów</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Hero ────────────────────────────────────────────────────────────────────

interface HeroProps {
  onScrollToProducts: () => void;
  onOpenQuiz: () => void;
  onAddToCart?: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onOpenProductDetail?: (product: HoneyProduct) => void;
  displayResolution?: ReturnType<typeof useDisplayResolution>;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToProducts,
  onAddToCart,
  onOpenProductDetail,
  displayResolution,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(1); // default to 900g
  const [targetPresetAngle, setTargetPresetAngle] = useState<number | null>(null);

  const fallbackResolution = useDisplayResolution();
  const res = displayResolution || fallbackResolution;
  const activeContainerClass = res.containerClass;

  const currentItem = HERO_VARIETIES[selectedIdx] || HERO_VARIETIES[0];
  const currentProduct = currentItem.product;

  const selectedSize = currentProduct.sizes[selectedSizeIdx] || currentProduct.sizes[0] || { weightGrams: 900, pricePln: 68 };

  const handlePrevVariety = () => {
    setSelectedIdx((prev) => (prev - 1 + HERO_VARIETIES.length) % HERO_VARIETIES.length);
  };

  const handleNextVariety = () => {
    setSelectedIdx((prev) => (prev + 1) % HERO_VARIETIES.length);
  };

  const triggerAnglePreset = (angle: number) => {
    setTargetPresetAngle(angle);
    setTimeout(() => setTargetPresetAngle(null), 150);
  };

  return (
    <section
      className="relative min-h-[calc(100vh-80px)] w-full bg-[#1A1511] text-[#FAF7F2] overflow-hidden flex flex-col justify-between select-none border-b border-[#362B22]"
    >
      {/* Ambient Apiary & Raw Honey Glow - Ciepłe rozświetlenie miodem w głębi pasieki */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.75] transition-colors duration-700"
        style={{
          background: `radial-gradient(ellipse 90% 75% at 50% 45%, ${currentItem.ambientToneHex}18 0%, rgba(224, 169, 79, 0.10) 45%, transparent 75%)`
        }}
      />

      {/* Dolny gradient miękko łączący Hero z sekcją 3D scrollingu */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1A1511] via-[#1A1511]/70 to-transparent pointer-events-none z-10" />

      {/* Subtelna organiczna tekstura lnu / drewna */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Hexagonal Honeycomb Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 z-0 transition-opacity duration-1000"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='208' viewBox='0 0 60 104' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l26 15v30L30 60 4 45V15L30 0zM30 104L4 89V59l26-15 26 15v30L30 104zM0 52l-26-15V7l26-15 26 15v30L0 52zm60 0L34 37V7l26-15 26 15v30L60 52z' fill='none' stroke='%23E0A94F' stroke-width='0.75' stroke-opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 208px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 65%)'
        }}
      />

      {/* TOP BAR: REGIONALNY KLIMAT PASIEKI */}
      <div className={`relative z-30 adaptive-container ${activeContainerClass} px-3 sm:px-6 lg:px-8 2xl:px-10 pt-3 sm:pt-5 flex items-center justify-start gap-3`}>
        <div className="flex items-center gap-2 text-xs text-[#C5BCAD] font-sans">
          <MapPin className="w-3.5 h-3.5 text-[#E0A94F] shrink-0" />
          <span className="text-[#FAF7F2] font-medium">{currentItem.terroirLocation}</span>
        </div>
      </div>

      {/* CENTRAL STAGE: EDITORIAL 2-COLUMN BALANCED LAYOUT (ZOPTYMALIZOWANY POD EKRANY MOBILNE, 16:9 I 21:9) */}
      <div className={`relative z-20 adaptive-container ${activeContainerClass} px-3 sm:px-6 lg:px-8 2xl:px-10 my-auto py-2 sm:py-6 grid grid-cols-1 lg:grid-cols-12 items-center gap-3 sm:gap-8 lg:gap-10 2xl:gap-14`}>
        
        {/* RIGHT COLUMN (NA MOBILE NA GÓRZE): Duża centralna scenografia 3D z obracającym się słoikiem i dynamicznymi dymkami */}
        <div className="order-1 lg:order-2 lg:col-span-7 xl:col-span-7 relative flex items-center justify-center w-full min-h-[300px] sm:min-h-[500px]">
          {/* Szlachetny ciepły miodowo-bursztynowy portal w tle słoika */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[500px] aspect-[1/1.2] rounded-full blur-[60px] opacity-75 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, #2B2119 0%, ${currentItem.ambientToneHex}30 40%, transparent 70%)`
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[400px] aspect-[1/1.2] rounded-full blur-[40px] opacity-85 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, #15100C 0%, #241D17 50%, transparent 70%)`
            }}
          />

          <HoneyJar3DCarousel
            varieties={HERO_VARIETIES}
            selectedIndex={selectedIdx}
            onSelectIndex={(idx) => setSelectedIdx(idx)}
            targetAnglePreset={targetPresetAngle}
            onAddToCart={() =>
              onAddToCart &&
              onAddToCart(
                currentProduct,
                selectedSize.weightGrams,
                selectedSize.pricePln
              )
            }
            onOpenDetails={() => onOpenProductDetail && onOpenProductDetail(currentProduct)}
          />
        </div>

        {/* LEFT COLUMN: Opowieść o miodzie, wybór słoika i zamówienie */}
        <HeroTextPanel
          selectedIdx={selectedIdx}
          currentItem={currentItem}
          currentProduct={currentProduct}
          selectedSizeIdx={selectedSizeIdx}
          setSelectedSizeIdx={setSelectedSizeIdx}
          selectedSize={selectedSize}
          onAddToCart={onAddToCart}
          onOpenProductDetail={onOpenProductDetail}
          onScrollToProducts={onScrollToProducts}
        />

      </div>

      {/* BOTTOM BAR: Minimalist Floating Editorial Variety Bar - Widoczny na tabletach i desktopie, ukryty na telefonach */}
      <div className="relative z-30 w-full px-2 sm:px-6 lg:px-8 2xl:px-10 pb-4 sm:pb-6 lg:pb-8 pt-1 hidden sm:block">
        <div className={`adaptive-container ${activeContainerClass} flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3`}>
          
          {/* Subtle Pasieka Note */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#B8AEA0] min-w-[200px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E0A94F]/80" />
            <span className="font-light tracking-wide">Zbiory odmianowe Pasieki Usza</span>
          </div>

          {/* Floating Editorial Selector Track */}
          <div className="inline-flex max-w-[calc(100vw-1.5rem)] items-center gap-1 p-1 sm:p-1.5 rounded-full bg-[#241D16]/90 backdrop-blur-md border border-[#443629]/90 shadow-2xl overflow-hidden">
            {/* Left Chevron */}
            <button
              onClick={handlePrevVariety}
              aria-label="Poprzedni miód"
              className="p-1 sm:p-1.5 rounded-full text-[#B0A697] hover:text-[#FAF7F2] hover:bg-[#382C22] transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Variety Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {HERO_VARIETIES.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                const p = item.product;

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIdx(idx)}
                    title={p.name}
                    className={`relative w-[130px] h-8 px-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 shrink-0 select-none cursor-pointer ${
                      isSelected
                        ? 'text-[#FAF7F2] font-semibold bg-[#3A2D20] border border-[#E0A94F]/70 shadow-md'
                        : 'text-[#9E9485] hover:text-[#FAF7F2] hover:bg-[#30241A]/60 border border-transparent font-medium'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-transform ${isSelected ? 'scale-125 ring-2 ring-[#E0A94F]/50' : 'opacity-70'}`}
                      style={{ backgroundColor: p.colorHex }}
                    />
                    <span className="tracking-wide truncate text-center">
                      {p.name.replace('Miód ', '')}
                    </span>
                    {isSelected && (
                      <span 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#E0A94F]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Chevron */}
            <button
              onClick={handleNextVariety}
              aria-label="Następny miód"
              className="p-1 sm:p-1.5 rounded-full text-[#B0A697] hover:text-[#FAF7F2] hover:bg-[#382C22] transition-colors shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Spacer to balance Pasieka Note and keep track centered on desktop */}
          <div className="hidden lg:block min-w-[200px]" />
        </div>
      </div>
    </section>
  );
};
