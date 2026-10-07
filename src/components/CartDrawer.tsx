import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartItem, HoneyProduct } from '../types';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Check, Scale, Package, Sparkles, Plus, Lock } from 'lucide-react';
import { HONEY_PRODUCTS } from '../data/honeyProducts';
import { WOO_CONFIG, getWooCommerceCheckoutUrl } from '../services/wooCommerceService';
import { useAuth } from '../context/AuthContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, weightGrams: number, delta: number) => void;
  onRemoveItem: (productId: string, weightGrams: number) => void;
  onClearCart: () => void;
  onAddToCart?: (product: HoneyProduct, weightGrams: number, pricePln: number) => void;
  onNavigateToCatalog?: () => void;
}



export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddToCart,
  onNavigateToCatalog,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [deliveryMethod, setDeliveryMethod] = useState<'paczkomat' | 'kurier' | 'odbior'>('paczkomat');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const location = useLocation();

  const handleGoToCatalog = () => {
    onClose();
    if (onNavigateToCatalog) {
      onNavigateToCatalog();
      return;
    }

    if (location.pathname === '/' || location.pathname === '') {
      const catalogEl = document.getElementById('katalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/sklep');
    }
  };

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 180;
  const subtotal = items.reduce((sum, item) => sum + item.pricePln * item.quantity, 0);

  const deliveryCost =
    deliveryMethod === 'odbior'
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : deliveryMethod === 'paczkomat'
      ? 15
      : 18;

  const total = subtotal + deliveryCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Kalkulacja wagi brutto (miód netto + bezpieczne szkło słoika + amortyzacja komorowa)
  const totalGrossWeightGrams = items.reduce((sum, item) => {
    const netGrams = item.weightGrams || 450;
    // Waga szkła: ~420g dla słoików 900g-1200g, ~270g dla 400g-500g, ~140g dla mniejszych słoików/akcesoriów
    const glassWeightGrams = netGrams >= 900 ? 420 : netGrams >= 400 ? 270 : 140;
    return sum + (netGrams + glassWeightGrams) * item.quantity;
  }, 0);
  const totalWeightKg = (totalGrossWeightGrams / 1000).toFixed(1);
  const totalJarsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Szacowany gabaryt InPost Paczkomat:
  // Gabaryt A: do ok. 3.2 kg (1-2 duże lub 3-4 małe słoiki w tubach)
  // Gabaryt B: 3.2 - 8.5 kg (do 6-8 słoików w pancernych kartonach)
  // Gabaryt C: powyżej 8.5 kg
  const parcelLockerSize =
    totalGrossWeightGrams <= 3200 ? 'Gabaryt A' : totalGrossWeightGrams <= 8500 ? 'Gabaryt B' : 'Gabaryt C';

  const suggestedCrossSell = useMemo(() => {
    if (remainingForFreeShipping <= 0 || remainingForFreeShipping > 55) return null;

    const cartProductIds = new Set(items.map(i => i.id));
    
    // Starannie dobrana pula lekkich, bestsellerowych produktów impulsowych:
    const curatedCandidates = [
      { id: 'swieca-wosk-pszczeli', weight: 150 }, // 22 zł
      { id: 'propolis-kit', weight: 50 },          // 25 zł
      { id: 'pylek-pszczeli', weight: 200 },       // 28 zł
      { id: 'miod-wielokwiatowy', weight: 400 },   // 30 zł
      { id: 'miod-rzepakowy', weight: 400 },       // 30 zł
      { id: 'miod-lipowy', weight: 400 },          // 35 zł
      { id: 'miod-faceliowy', weight: 400 },       // 35 zł
      { id: 'miod-gryczany', weight: 400 },        // 38 zł
      { id: 'miod-akacjowy', weight: 400 },        // 40 zł
      { id: 'miod-lesny', weight: 400 },           // 42 zł
      { id: 'miod-malinowy', weight: 400 },        // 45 zł
      { id: 'miod-mniszkowy', weight: 400 },       // 45 zł
      { id: 'miod-ze-spadzi-iglastej', weight: 400 }, // 50 zł
      { id: 'miod-wrzosowy', weight: 400 },        // 55 zł
    ];

    // Pobierz pełne obiekty i dane cenowe
    const availableItems = curatedCandidates
      .map(cand => {
        const prod = HONEY_PRODUCTS.find(p => p.id === cand.id);
        if (!prod) return null;
        const size = prod.sizes.find(s => s.weightGrams === cand.weight) || prod.sizes[0];
        if (!size || !size.inStock) return null;
        return {
          product: prod,
          size,
          price: size.pricePln,
          alreadyInCart: cartProductIds.has(prod.id),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // KROK 1: Produkty o cenie >= remainingForFreeShipping,
    // aby pojedyncze kliknięcie ZAWSZE odblokowało darmową dostawę (180 zł)
    const qualifyingItems = availableItems.filter(item => item.price >= remainingForFreeShipping);
    const pool = qualifyingItems.length > 0 ? qualifyingItems : availableItems;

    // KROK 2: Sortowanie hybrydowe:
    // 1. Preferuj te, których nie ma jeszcze w koszyku
    // 2. Najmniejsza dopłata ponad brakującą kwotę (optymalizacja wydatku klienta)
    pool.sort((a, b) => {
      if (a.alreadyInCart !== b.alreadyInCart) {
        return a.alreadyInCart ? 1 : -1;
      }
      const diffA = a.price - remainingForFreeShipping;
      const diffB = b.price - remainingForFreeShipping;
      if (diffA >= 0 && diffB >= 0) return diffA - diffB;
      return Math.abs(diffA) - Math.abs(diffB);
    });

    const best = pool[0];
    if (!best) return null;

    return { product: best.product, size: best.size };
  }, [items, remainingForFreeShipping]);

  const handleCheckout = () => {
    onClose();
    navigate('/zamowienie');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div 
          data-lenis-prevent 
          onWheel={(e) => e.stopPropagation()} 
          className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E3D6C4] shadow-2xl flex flex-col justify-between"
        >
          
          {/* Top Bar */}
          <div className="p-5 border-b border-[#E7DDCE] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#945209]" />
              <h3 className="font-serif text-lg font-bold text-[#23201C]">
                Twój Koszyk Pasieczny
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EFE3CF] text-[#7E4207]">
                {items.reduce((sum, i) => sum + i.quantity, 0)} szt.
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6E6150] hover:bg-[#EFE5D6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="px-5 py-3 bg-[#F2E8D8] border-b border-[#E3D4BE] text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-[#685947]">
                  <span>Darmowa dostawa od 180 zł:</span>
                  <span className="font-bold text-[#8C4609]">Brakuje jeszcze {remainingForFreeShipping} zł</span>
                </div>
                <div className="w-full bg-[#E0D2BD] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#945209] h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>

                {/* Inteligentny cross-selling do darmowej dostawy */}
                {suggestedCrossSell && onAddToCart && (
                  <div className="mt-2 pt-2 border-t border-[#E3D4BE]/70 flex items-center justify-between gap-2.5 bg-[#FAF5ED]/90 p-2 rounded-lg border border-[#DECDB8]">
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={suggestedCrossSell.product.imageUrl} 
                        alt={suggestedCrossSell.product.name}
                        className="w-8 h-8 rounded-md object-cover border border-[#DFCDB8] shrink-0" 
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#945209] flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-[#D97706]" /> Dobierz do darmowej dostawy:
                        </span>
                        <p className="text-[11px] font-semibold text-[#2D2821] truncate leading-tight">
                          {suggestedCrossSell.product.name} ({suggestedCrossSell.size.label})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddToCart(suggestedCrossSell.product, suggestedCrossSell.size.weightGrams, suggestedCrossSell.size.pricePln)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-[#945209] hover:bg-[#784107] text-[#FAF8F5] text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                      title="Dodaj do koszyka"
                    >
                      <Plus className="w-3 h-3" />
                      +{suggestedCrossSell.size.pricePln} zł
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#385C31] font-semibold">
                <Truck className="w-4 h-4" />
                <span>Kwalifikujesz się na bezpłatną dostawę!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {orderSubmitted ? (
              <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#E2EFDC] text-[#2F6825] flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#23201C]">
                  Dziękujemy za zamówienie!
                </h4>
                <p className="text-xs text-[#635747] leading-relaxed max-w-xs mx-auto">
                  To zamówienie testowe prototypu. W pełnej wersji nastąpiłoby bezpieczne przekierowanie do płatności BLIK / Przelewy24 oraz wygenerowanie etykiety nadawczej.
                </p>
                <button
                  onClick={() => {
                    setOrderSubmitted(false);
                    onClearCart();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#2D2821] text-[#FAF6F0] text-xs font-semibold hover:bg-[#433B31]"
                >
                  Wróć do sklepu
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 px-2 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EFE4D2] text-[#945209] flex items-center justify-center mx-auto text-2xl shadow-2xs">
                  🍯
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-serif font-bold text-[#2D2821]">
                    Twój koszyk jest jeszcze pusty
                  </p>
                  <p className="text-xs text-[#7B6E5C] max-w-xs mx-auto leading-relaxed">
                    Wybierz surowy miód z naszych dolnośląskich pasiek lub sięgnij po naturalne skarby ula: propolis, pierzgę i świece z wosku.
                  </p>
                </div>

                <div className="pt-2 space-y-2 max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={handleGoToCatalog}
                    id="btn-pusty-koszyk-katalog"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-95"
                  >
                    <span>Przeglądaj miody w sklepie</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E6C065]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/oferta');
                    }}
                    id="btn-pusty-koszyk-skarby"
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF4EB] text-[#8B5337] border border-[#DFCBB5] hover:border-[#8B5337] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    <span>Odkryj Skarby Ula (Apiterapia)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B5337]" />
                  </button>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const itemWeight = item.weightGrams || item.selectedWeightGrams || item.product.sizes[0]?.weightGrams || 450;

                return (
                  <div
                    key={`${item.product.id}-${itemWeight}`}
                    className="flex gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E7DDCE]"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-[#E7DAC8] shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-xs font-bold text-[#23201C] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id, itemWeight)}
                          className="text-[#9E907E] hover:text-[#B91C1C] p-1 rounded-md transition-colors cursor-pointer"
                          title={`Usuń ${item.product.name} (${itemWeight}g) z koszyka`}
                          aria-label={`Usuń ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#716556]">
                        <span className="bg-[#EFE3CF] px-2 py-0.5 rounded font-bold text-[#7C4007]">
                          {itemWeight} g
                        </span>
                        <span>{item.pricePln} zł / szt.</span>
                        {item.subscriptionInterval && (
                          <span className="bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            📧 Przypomnienie za {item.subscriptionInterval} dni (1-Click)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-[#D9CDBD] rounded-lg bg-white overflow-hidden text-xs shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, itemWeight, -1)}
                            className="w-7 h-6 flex items-center justify-center text-[#5D5243] hover:bg-[#ECE0CE] hover:text-[#1B4332] font-bold cursor-pointer transition-colors"
                            title="Zmniejsz ilość"
                            aria-label="Zmniejsz ilość"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-[#2D2821] text-xs select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, itemWeight, 1)}
                            className="w-7 h-6 flex items-center justify-center text-[#5D5243] hover:bg-[#ECE0CE] hover:text-[#1B4332] font-bold cursor-pointer transition-colors"
                            title="Zwiększ ilość"
                            aria-label="Zwiększ ilość"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-xs text-[#1B4332]">
                          {item.pricePln * item.quantity} zł
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}



            {/* Opcje dostawy, waga, gwarancje i zestawienie kosztów wewnątrz przewijanego kontenera (aby nie zabierały 80% ekranu na telefonie) */}
            {!orderSubmitted && items.length > 0 && (
              <div className="pt-2 border-t border-[#E7DDCE] space-y-4">
                {/* Delivery selector */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-[#736655] uppercase tracking-wider block">
                    Metoda dostawy:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setDeliveryMethod('paczkomat')}
                      className={`p-2 rounded-lg text-left border transition-all text-[11px] ${
                        deliveryMethod === 'paczkomat'
                          ? 'border-[#945209] bg-[#F2E5D3] font-semibold text-[#2D2821]'
                          : 'border-[#DFCBB5] bg-[#FAF8F5] text-[#695D4E]'
                      }`}
                    >
                      <span className="block font-bold">Paczkomat</span>
                      <span className="text-[10px] text-[#847461]">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : '15 zł'}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeliveryMethod('kurier')}
                      className={`p-2 rounded-lg text-left border transition-all text-[11px] ${
                        deliveryMethod === 'kurier'
                          ? 'border-[#945209] bg-[#F2E5D3] font-semibold text-[#2D2821]'
                          : 'border-[#DFCBB5] bg-[#FAF8F5] text-[#695D4E]'
                      }`}
                    >
                      <span className="block font-bold">Kurier InPost</span>
                      <span className="text-[10px] text-[#847461]">
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : '18 zł'}
                      </span>
                    </button>

                    <button
                      onClick={() => setDeliveryMethod('odbior')}
                      className={`p-2 rounded-lg text-left border transition-all text-[11px] ${
                        deliveryMethod === 'odbior'
                          ? 'border-[#945209] bg-[#F2E5D3] font-semibold text-[#2D2821]'
                          : 'border-[#DFCBB5] bg-[#FAF8F5] text-[#695D4E]'
                      }`}
                    >
                      <span className="block font-bold">W pasiece</span>
                      <span className="text-[10px] text-[#847461]">0 zł</span>
                    </button>
                  </div>

                  {/* Auto-filled Address & Paczkomat banner for logged-in user */}
                  {deliveryMethod === 'paczkomat' && (
                    <div className="p-2.5 rounded-xl border text-[11px] leading-tight transition-all">
                      {isLoggedIn && user?.address?.parcelLocker ? (
                        <div className="flex items-start gap-2 text-[#1B4332] bg-[#E8F3E6] border border-[#C5E1BF] p-2 rounded-lg">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#1B4332]" />
                          <div>
                            <span className="font-bold block">Paczkomat z Twojego profilu:</span>
                            <span className="text-[#2D5A27]">{user.address.parcelLocker}</span>
                            <span className="text-[10px] text-[#4F7A4A] block mt-0.5">Podstawiony automatycznie bez ponownego wpisywania!</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 text-[#7A6C5B] bg-[#F7F2EB] p-2 rounded-lg border border-[#E5DACD]">
                          <span>Zapisz swój Paczkomat w profilu, by nie wpisywać go ponownie:</span>
                          <button
                            type="button"
                            onClick={() => { onClose(); navigate('/konto'); }}
                            className="shrink-0 text-[10px] font-bold text-[#8B5337] underline hover:text-[#5E321B] cursor-pointer"
                          >
                            {isLoggedIn ? 'Uzupełnij profil →' : 'Zaloguj się →'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {deliveryMethod === 'kurier' && (
                    <div className="p-2.5 rounded-xl border text-[11px] leading-tight transition-all">
                      {isLoggedIn && user?.address?.street ? (
                        <div className="flex items-start gap-2 text-[#1B4332] bg-[#E8F3E6] border border-[#C5E1BF] p-2 rounded-lg">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#1B4332]" />
                          <div>
                            <span className="font-bold block">Adres dostawy z profilu:</span>
                            <span className="text-[#2D5A27]">{user.address.street}, {user.address.postalCode} {user.address.city}</span>
                            <span className="text-[10px] text-[#4F7A4A] block mt-0.5">Podstawiony automatycznie!</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 text-[#7A6C5B] bg-[#F7F2EB] p-2 rounded-lg border border-[#E5DACD]">
                          <span>Konto w pasiece pozwala zapisać adres i kupować 1 kliknięciem:</span>
                          <button
                            type="button"
                            onClick={() => { onClose(); navigate('/konto'); }}
                            className="shrink-0 text-[10px] font-bold text-[#8B5337] underline hover:text-[#5E321B] cursor-pointer"
                          >
                            {isLoggedIn ? 'Uzupełnij adres →' : 'Zaloguj się →'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Wskaźnik wagi przesyłki & format paczki */}
                <div className="p-2.5 rounded-xl bg-[#F5EFE6] border border-[#DFCBB5] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#945209]" />
                      <span className="font-semibold text-[#2D2821]">Waga brutto paczki:</span>
                      <span className="font-bold text-[#945209]">~{totalWeightKg} kg</span>
                    </div>
                    {deliveryMethod === 'paczkomat' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#D8C4AD] text-[10px] font-bold text-[#8C4609]">
                        <Package className="w-3 h-3 text-[#B45309]" />
                        Paczkomat: {parcelLockerSize}
                      </span>
                    )}
                    {deliveryMethod === 'kurier' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#D8C4AD] text-[10px] font-bold text-[#2A6546]">
                        <Truck className="w-3 h-3 text-[#2A6546]" />
                        Kurier: Ubezpieczona
                      </span>
                    )}
                    {deliveryMethod === 'odbior' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#D8C4AD] text-[10px] font-bold text-[#695D4E]">
                        Odbiór na pasiece
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A6C5B] leading-tight">
                    Zawiera {totalJarsCount} {totalJarsCount === 1 ? 'produkt' : totalJarsCount < 5 ? 'produkty' : 'produktów'} (zawartość netto + bezpieczne tuby i opakowania ochronne).
                  </p>
                </div>

                {/* Bezpieczna dostawa z Pasieki Usza (Zero Stłuczek & Termoizolacja) */}
                <div className="p-3 rounded-xl bg-[#EFE7D8] border border-[#DFCDB7] text-[11px] text-[#554736] leading-relaxed shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1B4332] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
                    <span>Bezpieczna dostawa (Zero Stłuczek & Termoizolacja)</span>
                  </div>
                  <p className="text-[11px] text-[#554736] leading-relaxed">
                    Paczki wysyłamy w amortyzujących ekotubach plaster miodu z osłoną termiczną chroniącą biokomponenty ula przed upałem. W razie jakiejkolwiek szkody w transporcie wysyłamy nową paczkę w 24h na nasz koszt.
                  </p>
                </div>

                {/* Subtotal & Details */}
                <div className="space-y-1 pt-2 border-t border-[#EAE0D1] text-xs">
                  <div className="flex justify-between text-[#6D604E]">
                    <span>Wartość produktów:</span>
                    <span className="font-semibold">{subtotal} zł</span>
                  </div>
                  <div className="flex justify-between text-[#6D604E]">
                    <span>Waga całkowita (brutto):</span>
                    <span className="font-semibold">~{totalWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between text-[#6D604E]">
                    <span>Dostawa:</span>
                    <span className="font-semibold">
                      {deliveryCost === 0 ? 'Bezpłatnie' : `${deliveryCost} zł`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Compact Sticky Footer (Summary & Checkout) */}
          {!orderSubmitted && items.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-[#E7DDCE] bg-[#FAF8F5] shrink-0 shadow-lg space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#736655] uppercase tracking-wider block font-medium">Do zapłaty:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#8C4609] leading-none">{total} zł</span>
                    <span className="text-[10px] text-[#847461]">
                      {deliveryCost === 0 ? '(dostawa gratis)' : `(+${deliveryCost} zł dostawa)`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  id="cart-checkout-btn"
                >
                  <span>Przejdź do kasy</span>
                  <ArrowRight className="w-4 h-4 text-[#E5983A]" />
                </button>
              </div>

              {/* Kompaktowy pasek zaufania (Trust Badges) zoptymalizowany pod mobile */}
              <div className="pt-2 border-t border-[#EAE0D1]/80 grid grid-cols-3 gap-1 text-[10px] text-[#695D4E] font-medium">
                <div className="flex items-center justify-center gap-1 text-center py-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2A6546] shrink-0" />
                  <span className="truncate">BLIK & Przelewy</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-center py-0.5 border-x border-[#E3D6C4]/80 px-1">
                  <Truck className="w-3.5 h-3.5 text-[#8C4609] shrink-0" />
                  <span className="truncate">InPost & Kurier 24h</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-center py-0.5">
                  <Lock className="w-3.5 h-3.5 text-[#2A6546] shrink-0" />
                  <span className="truncate">100% Gwarancja szkła</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
