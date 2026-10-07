import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HoneyProduct } from '../types';
import { getEnrichedProduct, CATEGORY_METADATA } from '../utils/honeyHelpers';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  MapPin, 
  Award, 
  ExternalLink, 
  Scale,
  Droplet,
  Info
} from 'lucide-react';

interface ProductDetailModalProps {
  product: HoneyProduct | null;
  onClose: () => void;
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onOpenFullView?: (product: HoneyProduct) => void;
  onOpenCompare?: (product: HoneyProduct) => void;
  onSelectFlavorNote?: (note: string) => void;
}

interface ProductDetailModalContentProps {
  rawProduct: HoneyProduct;
  onClose: () => void;
  onAddToCart: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onOpenFullView?: (product: HoneyProduct) => void;
  onOpenCompare?: (product: HoneyProduct) => void;
  onSelectFlavorNote?: (note: string) => void;
}

const ProductDetailModalContent: React.FC<ProductDetailModalContentProps> = ({
  rawProduct,
  onClose,
  onAddToCart,
  onOpenFullView,
  onOpenCompare,
  onSelectFlavorNote,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, toggleFavorite, isFavorite } = useAuth();
  const isFav = isFavorite(rawProduct.id);
  const product = getEnrichedProduct(rawProduct);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const currentSize = product.sizesList[selectedSizeIndex] || product.sizesList[0];
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  const handleAdd = () => {
    if (!currentSize) return;
    for (let i = 0; i < quantity; i++) {
      onAddToCart(rawProduct, currentSize.weightGrams, currentSize.price);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleGoToFullView = () => {
    try {
      sessionStorage.setItem('pasieka_last_product_id', rawProduct.id);
      sessionStorage.setItem('pasieka_home_scroll_y', String(window.pageYOffset || document.documentElement.scrollTop || 0));
      sessionStorage.removeItem('pasieka_from_hero');
    } catch {
      // ignore storage errors
    }
    document.body.style.overflow = '';
    onClose();
    if (onOpenFullView) {
      onOpenFullView(rawProduct);
    } else {
      navigate(`/produkt/${rawProduct.id}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        data-lenis-prevent
        className="relative w-full max-w-2xl lg:max-w-3xl bg-[#FAF6EE] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D9821E]/35 overflow-hidden h-[84dvh] sm:h-[86dvh] max-h-[780px] flex flex-col animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Top Actions: Favorite (if logged in) + Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => toggleFavorite(rawProduct.id)}
              className={`p-2.5 rounded-full transition-all cursor-pointer shadow-sm border ${
                isFav
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-[#FAF6EE]/80 hover:bg-[#EADBCA] text-[#594D42] hover:text-rose-500 border-[#D9821E]/15'
              }`}
              title={isFav ? "Usuń z ulubionych miodów" : "Dodaj do ulubionych miodów"}
              aria-label="Ulubione"
              id="modal-quick-fav-top-btn"
            >
              <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#FAF6EE]/80 hover:bg-[#EADBCA] text-[#594D42] hover:text-[#241D17] transition-colors cursor-pointer shadow-sm border border-[#D9821E]/15"
            title="Zamknij podgląd"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div 
          ref={scrollRef}
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-modal-scroll p-5 sm:p-8 space-y-6 select-text"
        >
          {/* Header & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5 pr-10">
              {product.badge && (
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${product.badgeClass || 'bg-[#D9821E] text-white'} shadow-xs`}>
                  {product.badge}
                </span>
              )}
              {product.productType === 'honey' ? (
                <Link
                  to={`/sklep?kategoria=${rawProduct.category}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1B4332]/10 hover:bg-[#1B4332] text-[#1B4332] hover:text-white border border-[#1B4332]/25 transition-all shadow-2xs cursor-pointer group"
                  title={`Filtruj zbiory: ${CATEGORY_METADATA[rawProduct.category]?.label || rawProduct.category}`}
                >
                  <span>{CATEGORY_METADATA[rawProduct.category]?.icon || '🍯'}</span>
                  <span>{CATEGORY_METADATA[rawProduct.category]?.shortLabel || rawProduct.category}</span>
                  <span className="text-[10px] opacity-60 group-hover:opacity-100 ml-0.5">→</span>
                </Link>
              ) : (
                <Link
                  to="/skarby-ula"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8C4609]/10 hover:bg-[#8C4609] text-[#8C4609] hover:text-white border border-[#8C4609]/25 transition-all shadow-2xs cursor-pointer group"
                  title="Zobacz Skarby Ula"
                >
                  <span>🌿</span>
                  <span>Skarby Ula</span>
                  <span className="text-[10px] opacity-60 group-hover:opacity-100 ml-0.5">→</span>
                </Link>
              )}
              <span className="text-xs text-[#7A6A5A] flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-full border border-[#D9821E]/15">
                <MapPin className="w-3.5 h-3.5 text-[#D9821E]" />
                {product.region}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#241D17] leading-tight">
                  {product.name}
                </h2>
                <p className="text-xs sm:text-sm italic text-[#7A6A5A] mt-1">
                  {product.productType === 'bee-colony' && 'Rasa i linia hodowlana: '}
                  {product.productType === 'candle' && 'Surowiec i knot: '}
                  {product.productType === 'apitherapy' && 'Pochodzenie surowca: '}
                  {product.productType === 'honey' && 'Źródło nektaru: '}
                  <span className="font-semibold text-[#594D42] not-italic">{product.botanicalSource}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                {onOpenCompare && product.productType === 'honey' && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCompare(rawProduct);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#1B4332] bg-white hover:bg-[#EADBCA] border border-[#1B4332]/30 transition-all shadow-xs cursor-pointer"
                    title="Porównaj ten miód w tabeli właściwości i cen"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#D9821E]" />
                    <span>Porównaj</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleGoToFullView}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] transition-all shadow-xs cursor-pointer"
                >
                  <span>Pełna karta</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Image Gallery in Modal */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FFFDF9] p-4 rounded-2xl border border-[#D9821E]/20">
            <div className="sm:col-span-7 aspect-[16/10] rounded-xl overflow-hidden bg-white border border-[#D9821E]/15 relative group">
              <img
                src={images[activePhotoIdx] || images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = product.imageUrl;
                }}
              />
              <span className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-md font-medium">
                Zdjęcie {activePhotoIdx + 1} z {images.length}
              </span>
            </div>

            <div className="sm:col-span-5 space-y-2.5">
              <p className="text-xs font-bold text-[#594D42] uppercase tracking-wide">
                {product.productType === 'honey' ? 'Galeria odmiany:' : 'Galeria produktu:'}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                      activePhotoIdx === i 
                        ? 'border-[#D9821E] ring-2 ring-[#D9821E]/30 scale-[1.02]' 
                        : 'border-[#D9821E]/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="miniaturka" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGoToFullView}
                className="w-full mt-2 text-left text-xs font-bold text-[#D9821E] hover:underline cursor-pointer block"
              >
                {product.productType === 'honey'
                  ? 'Zobacz pełny opis, badania lab i opinie →'
                  : 'Zobacz pełny opis, specyfikację i szczegóły →'}
              </button>
            </div>
          </div>

          {/* Tagline & Description */}
          <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#D9821E]/20">
            <p className="font-semibold text-[#D9821E] text-sm mb-1.5">„{product.tagline}”</p>
            <p className="text-[#594D42] text-xs sm:text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Cechy / Nuty / Etykiety */}
          {rawProduct.flavorNotes && rawProduct.flavorNotes.length > 0 && (
            <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#D9821E]/20 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-[#594D42] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                  {product.productType === 'honey' ? 'Dominujące nuty smakowe i aromatyczne:' : 'Cechy i parametry:'}
                </span>
                {product.productType === 'honey' && (
                  <span className="text-[11px] text-[#8C7A6B] font-medium">Kliknij nutę, by przefiltrować katalog</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {rawProduct.flavorNotes.map((note, idx) => {
                  if (product.productType === 'honey') {
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          document.body.style.overflow = '';
                          onClose();
                          if (onSelectFlavorNote) {
                            onSelectFlavorNote(note);
                          } else {
                            navigate(`/sklep?nuta=${encodeURIComponent(note)}`);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#1B4332] text-[#594D42] hover:text-white border border-[#D9821E]/30 hover:border-[#1B4332] rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer group"
                        title={`Filtruj miody o nucie: ${note}`}
                      >
                        <Sparkles className="w-3 h-3 text-[#D9821E] group-hover:text-[#F3C06B] transition-colors" />
                        <span>{note}</span>
                        <span className="text-[10px] text-[#A69888] group-hover:text-white/80 ml-0.5">🔍</span>
                      </button>
                    );
                  }

                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white text-[#594D42] border border-[#D9821E]/25 rounded-full text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#D9821E]" />
                      <span>{note}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile: Sensory profile for honey VS Specification summary for non-honey */}
          {product.productType === 'honey' ? (
            <div>
              <h3 className="text-base font-bold text-[#241D17] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9821E]" />
                Profil sensoryczny i cechy miodu
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {/* Sweetness */}
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/15 shadow-2xs">
                  <div className="flex justify-between text-xs font-semibold text-[#594D42] mb-1.5">
                    <span>Poziom słodyczy</span>
                    <span className="text-[#D9821E] font-bold">{product.tasteProfile.sweetness}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div 
                        key={lvl} 
                        className={`h-2 flex-1 rounded-full ${
                          lvl <= product.tasteProfile.sweetness ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Acidity */}
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/15 shadow-2xs">
                  <div className="flex justify-between text-xs font-semibold text-[#594D42] mb-1.5">
                    <span>Kwasowość / Rześkość</span>
                    <span className="text-[#1B4332] font-bold">{product.tasteProfile.acidity}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div 
                        key={lvl} 
                        className={`h-2 flex-1 rounded-full ${
                          lvl <= product.tasteProfile.acidity ? 'bg-[#1B4332]' : 'bg-[#EADDC7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Aroma */}
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/15 shadow-2xs">
                  <div className="flex justify-between text-xs font-semibold text-[#594D42] mb-1.5">
                    <span>Intensywność aromatu</span>
                    <span className="text-[#D9821E] font-bold">{product.tasteProfile.aroma}/5</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div 
                        key={lvl} 
                        className={`h-2 flex-1 rounded-full ${
                          lvl <= product.tasteProfile.aroma ? 'bg-[#D9821E]' : 'bg-[#EADDC7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#D9821E]/15">
                  <span className="font-semibold text-[#7A6A5A] block mb-0.5">Barwa miodu:</span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/25 shrink-0 shadow-2xs"
                      style={{ backgroundColor: product.colorHex }}
                    />
                    <span className="text-[#241D17] font-medium">{product.tasteProfile.color}</span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#D9821E]/15">
                  <span className="font-semibold text-[#7A6A5A] block mb-0.5">Krystalizacja:</span>
                  <span className="text-[#241D17] font-medium">{product.tasteProfile.crystallization}</span>
                </div>
              </div>
            </div>
          ) : product.productType === 'bee-colony' ? (
            <div>
              <h3 className="text-base font-bold text-[#241D17] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                Specyfikacja pakietu i warunki hodowlane
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#1B4332]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block mb-1">Siła rodziny</span>
                  <p className="text-xs font-bold text-[#241D17]">5 ramek Wielkopolskich</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">3 ramki czerwiu krytego + 2 ramki z pokarmem i pierzgą</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#1B4332]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block mb-1">Matka pszczela</span>
                  <p className="text-xs font-bold text-[#241D17]">Krainka / Buckfast 2026</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Ze sprawdzonym czerwieniem, znakowana opalitkiem</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#1B4332]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block mb-1">Gwarancja i wsparcie</span>
                  <p className="text-xs font-bold text-[#241D17]">Nadzór PLW + Szkolenie</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Świadectwo zdrowia oraz praktyczny instruktaż w pasiece</p>
                </div>
              </div>
            </div>
          ) : product.productType === 'candle' ? (
            <div>
              <h3 className="text-base font-bold text-[#241D17] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9821E]" />
                Charakterystyka świecy woskowej
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Skład</span>
                  <p className="text-xs font-bold text-[#241D17]">100% Wosk pszczeli</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Czysty wosk Cera Flava bez parafiny i sztucznych barwników</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Knot</span>
                  <p className="text-xs font-bold text-[#241D17]">Naturalna bawełna</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Niekielichujący knot bez rdzenia ołowianego</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Działanie</span>
                  <p className="text-xs font-bold text-[#241D17]">Ujemna jonizacja</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Neutralizuje smog, kurz i promieniowanie elektromagnetyczne</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-base font-bold text-[#241D17] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D9821E]" />
                Parametry bioaktywności i czystości
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Pochodzenie</span>
                  <p className="text-xs font-bold text-[#241D17]">100% Dolny Śląsk</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Zbiór z czystych, dolnośląskich pożytków wędrownych</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Przetwarzanie</span>
                  <p className="text-xs font-bold text-[#241D17]">Suszenie &lt; 38°C</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Ochrona wrażliwych enzymów i biopierwiastków</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#D9821E]/20 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9821E] block mb-1">Biodostępność</span>
                  <p className="text-xs font-bold text-[#241D17]">Maksymalna</p>
                  <p className="text-[11px] text-[#7A6A5A] mt-0.5">Produkt surowy, nienapromieniowywany i niefiltrowany</p>
                </div>
              </div>
            </div>
          )}

          {/* Health / Usage Benefits */}
          <div>
            <h3 className="text-base font-bold text-[#241D17] mb-2.5 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C1382B]" />
              {product.productType === 'bee-colony' && 'Cechy biologiczne i zalety odkładu'}
              {product.productType === 'candle' && 'Zalety świecy z wosku pszczelego'}
              {product.productType === 'apitherapy' && 'Właściwości apiterapeutyczne'}
              {product.productType === 'honey' && 'Właściwości zdrowotne'}
            </h3>
            <ul className="space-y-2">
              {product.healthBenefits.map((benefit, i) => (
                <li key={i} className="text-xs sm:text-sm text-[#594D42] flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advisor verdict */}
          {product.advisorVerdict && (
            <div className="text-xs text-[#241D17] bg-gradient-to-r from-[#1B4332]/[0.06] to-[#D9821E]/12 p-3.5 rounded-xl border border-[#1B4332]/20 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
                <Award className="w-3.5 h-3.5 text-[#D9821E]" />
                <span className="uppercase tracking-wider text-[11px]">Werdykt Doradcy • Kiedy wybrać:</span>
              </div>
              <p className="leading-relaxed font-medium text-[#241D17]">
                {product.advisorVerdict}
              </p>
            </div>
          )}

          {/* Pairing / Usage tip */}
          <div className="text-xs text-[#594D42] bg-[#FAF3E6] p-3.5 rounded-xl border border-[#D9821E]/25">
            <strong className="text-[#241D17] font-bold">
              {product.productType === 'bee-colony' && 'Wskazówka hodowlana: '}
              {product.productType === 'candle' && 'Wskazówka użytkowania: '}
              {product.productType === 'apitherapy' && 'Zalecenie stosowania: '}
              {product.productType === 'honey' && 'Propozycja serwowania: '}
            </strong>
            {product.pairing}
          </div>

          {/* Status partii / warunki - dopasowane do typu */}
          {product.productType === 'honey' ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D9821E]/25 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-[#594D42]">
                  <Droplet className="w-3.5 h-3.5 text-[#D9821E]" />
                  Stan skupienia partii:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] ${product.consistencyInfo.badgeClass}`}>
                  {product.consistencyInfo.label}
                </span>
              </div>

              {product.consistencyInfo.hasGlucoseBloom && (
                <div className="bg-[#FAF3E5] p-2.5 rounded-xl text-[11px] text-[#7A5016] flex items-start gap-2 border border-[#D9821E]/25 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9821E] shrink-0 mt-0.5" />
                  <span>
                    <strong>Biały nalot na szkle?</strong> To tzw. „kwiat miodu” – bezsporny dowód na 100% surowy, niefiltrowany i nieprzegrzewany miód!
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1 border-t border-[#D9821E]/10">
                <span className="flex items-center gap-1 text-[#8C4609] font-semibold">
                  <span>🌡️ Chroń enzymy: max 40°C</span>
                </span>
                <span className="text-[#1B4332] font-semibold">Wirowany na zimno</span>
              </div>
            </div>
          ) : product.productType === 'bee-colony' ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1B4332]/25 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-[#1B4332]">
                  <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                  Status odkładu:
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-bold border text-[11px] bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/30">
                  Zamówienia na sezon 2026 (Maj-Czerwiec)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1 border-t border-[#D9821E]/10">
                <span className="font-semibold text-[#1B4332]">
                  📍 Pasieka Ciechów • Odbiór osobisty
                </span>
                <span className="text-[#8C4609] font-semibold">WNT PLW 28143502</span>
              </div>
            </div>
          ) : product.productType === 'candle' ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D9821E]/25 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-[#D9821E]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                  Czysty wosk pszczeli:
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-bold border text-[11px] bg-[#FFF8EB] text-[#8C4609] border-[#D9821E]/30">
                  100% Cera Flava
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1 border-t border-[#D9821E]/10">
                <span className="font-semibold text-[#241D17]">
                  🕯️ Przed paleniem przytnij knot do 5 mm
                </span>
                <span className="text-[#1B4332] font-semibold">Brak dymu i parafiny</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D9821E]/25 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-[#594D42]">
                  <Droplet className="w-3.5 h-3.5 text-[#D9821E]" />
                  Warunki przechowywania:
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-bold border text-[11px] bg-[#E8F5E9] text-[#1B4332] border-[#1B4332]/30">
                  Poniżej 18°C w ciemnym miejscu
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7A6A5A] pt-1 border-t border-[#D9821E]/10">
                <span className="flex items-center gap-1 text-[#8C4609] font-semibold">
                  <span>🌡️ Nie zalewać wrzątkiem (&gt; 40°C)</span>
                </span>
                <span className="text-[#1B4332] font-semibold">100% surowy</span>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Footer: Nieruchomy pasek z wyborem gramatury, ceną, ilością i dodaniem do koszyka */}
        <div className="p-3 sm:p-4 bg-white/98 backdrop-blur-md border-t border-[#D9821E]/25 shrink-0 shadow-lg rounded-b-2xl sm:rounded-b-3xl z-10 space-y-2">
          {/* Wybór gramatury / wariantu */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] text-[#7A6A5A]">
              <span className="font-bold uppercase tracking-wider text-[#594D42]">
                {product.productType === 'bee-colony' && 'Wybierz pakiet:'}
                {product.productType === 'candle' && 'Wybierz wariant świecy:'}
                {product.productType === 'apitherapy' && 'Wybierz gramaturę:'}
                {product.productType === 'honey' && 'Wybierz gramaturę:'}
              </span>
              {currentSize && (
                <span>
                  {product.productType === 'bee-colony' && <strong className="text-[#1B4332]">Pakiet ze szkoleniem</strong>}
                  {product.productType === 'candle' && <strong className="text-[#1B4332]">Cena za sztukę</strong>}
                  {product.productType === 'apitherapy' && (
                    <>Cena / 100g: <strong className="text-[#1B4332]">{Math.round((currentSize.price / currentSize.weightGrams) * 100)} zł</strong></>
                  )}
                  {product.productType === 'honey' && (
                    <>Cena / kg: <strong className="text-[#1B4332]">{Math.round((currentSize.price / currentSize.weightGrams) * 1000)} zł</strong></>
                  )}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {product.sizesList.map((size, idx) => {
                const isSelected = selectedSizeIndex === idx;
                const isLargest = idx === product.sizesList.length - 1 && product.sizesList.length > 1;

                let unitLabel = '';
                if (product.productType === 'bee-colony') {
                  unitLabel = 'Kompletny odkład';
                } else if (product.productType === 'candle') {
                  unitLabel = 'Wosk Cera Flava';
                } else if (product.productType === 'apitherapy') {
                  unitLabel = `${Math.round((size.price / size.weightGrams) * 100)} zł/100g`;
                } else {
                  unitLabel = `${Math.round((size.price / size.weightGrams) * 1000)} zł/kg`;
                }

                return (
                  <button
                    key={size.gram + idx}
                    type="button"
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`relative flex items-center justify-between px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs ring-1 ring-[#1B4332]/20'
                        : 'bg-[#FAF6EE] text-[#241D17] border-[#D9821E]/30 hover:border-[#D9821E] hover:bg-white'
                    }`}
                  >
                    {isLargest && (
                      <span className={`absolute -top-1.5 right-1 text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full whitespace-nowrap ${
                        isSelected ? 'bg-[#E5983A] text-[#14100C]' : 'bg-[#1B4332] text-[#FAF5ED]'
                      }`}>
                        Najtaniej
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-xs leading-tight">{size.gram}</div>
                      <div className={`text-[9px] font-mono leading-tight ${isSelected ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
                        {unitLabel}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-[#F3C06B]' : 'text-[#8C5815]'}`}>
                        {size.price} zł
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Dolna linia: Podsumowanie ceny + Stepper + Przycisk Dodaj do koszyka */}
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 pt-1 border-t border-[#EAE0D1]">
            <div className="min-w-0">
              <span className="text-[9.5px] text-[#7A6A5A] uppercase font-bold tracking-wider block leading-none mb-0.5">
                Cena:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-lg sm:text-2xl font-black text-[#1B4332] leading-none tabular-nums">
                  {((currentSize?.price || 0) * quantity).toFixed(2)} zł
                </span>
                {quantity > 1 && (
                  <span className="text-[10px] text-[#7A6A5A] hidden xs:inline">
                    ({quantity}×{currentSize?.price})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="flex items-center border border-[#D9821E]/30 rounded-xl bg-[#FAF6EE] overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#594D42] hover:bg-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  title="Zmniejsz ilość"
                >
                  -
                </button>
                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-[#241D17]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#594D42] hover:bg-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                  title="Zwiększ ilość"
                >
                  +
                </button>
              </div>

              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => toggleFavorite(rawProduct.id)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    isFav
                      ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-2xs'
                      : 'bg-[#FAF6EE] border-[#D9821E]/30 text-[#594D42] hover:text-rose-500 hover:border-rose-300'
                  }`}
                  title={isFav ? "Usuń z ulubionych miodów" : "Dodaj do ulubionych miodów"}
                  aria-label="Ulubione"
                  id="modal-quick-fav-bottom-btn"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-125 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}

              <button
                type="button"
                onClick={handleAdd}
                className={`py-2 sm:py-2.5 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md ${
                  addedAnimation
                    ? 'bg-[#2E7D32] text-white scale-[1.01]'
                    : 'bg-[#1B4332] hover:bg-[#143326] text-white active:scale-[0.99]'
                }`}
                id="modal-quick-add-btn"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#E6C065]" />
                    <span>Dodano!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Dodaj do koszyka</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenFullView,
  onOpenCompare,
  onSelectFlavorNote,
}) => {
  if (!product) return null;

  return (
    <ProductDetailModalContent
      key={product.id}
      rawProduct={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
      onOpenFullView={onOpenFullView}
      onOpenCompare={onOpenCompare}
      onSelectFlavorNote={onSelectFlavorNote}
    />
  );
};
