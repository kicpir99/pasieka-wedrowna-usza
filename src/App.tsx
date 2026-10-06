import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { Check, X, Scale } from 'lucide-react';
import { CartItem, HoneyProduct } from './types';
import { useDisplayResolution } from './hooks/useDisplayResolution';
import { HIVE_TREASURE_IDS } from './data/honeyProducts';

// Lazy-loaded heavy overlay components & secondary pages
const CartDrawer = React.lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const ComparisonModal = React.lazy(() => import('./components/ComparisonModal').then(m => ({ default: m.ComparisonModal })));
const HoneyFinderQuiz = React.lazy(() => import('./components/HoneyFinderQuiz').then(m => ({ default: m.HoneyFinderQuiz })));
const ProductPage = React.lazy(() => import('./pages/ProductPage').then(m => ({ default: m.ProductPage })));

// Primary landing page (static for instant FCP)
import { HomePage } from './pages/HomePage';

// Secondary subpages (code-split for optimal initial load speed)
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const ShopPage = React.lazy(() => import('./pages/ShopPage').then(m => ({ default: m.ShopPage })));
const OfferPage = React.lazy(() => import('./pages/OfferPage').then(m => ({ default: m.OfferPage })));
const BlogPage = React.lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));

function GlobalQuizModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <Suspense fallback={null}>
      <HoneyFinderQuiz
        isOpen={isOpen}
        onClose={onClose}
        onSelectProduct={(product) => {
          onClose();
          navigate(`/produkt/${product.id}`);
        }}
      />
    </Suspense>
  );
}

interface FloatingCompareBarProps {
  compareList: HoneyProduct[];
  isCompareModalOpen: boolean;
  onRemove: (product: HoneyProduct) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

function FloatingCompareBar({
  compareList,
  isCompareModalOpen,
  onRemove,
  onClear,
  onOpenModal,
}: FloatingCompareBarProps) {
  const location = useLocation();
  const isShop = location.pathname.startsWith('/sklep');

  // Pigułka widoczna jest tylko w sekcji sklepu z miodami
  if (!isShop || compareList.length === 0 || isCompareModalOpen) {
    return null;
  }

  return (
    <aside 
      aria-label="Pasek porównywania odmian miodów"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-fit bg-[#FAF8F5]/95 backdrop-blur-md border border-[#D9821E]/35 rounded-2xl sm:rounded-full shadow-[0_12px_40px_rgba(35,32,28,0.2)] px-3.5 py-2.5 sm:px-5 sm:py-2.5 animate-in slide-in-from-bottom-6 duration-300 ring-1 ring-[#1B4332]/10"
    >
      <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <div className="w-7 h-7 rounded-full bg-[#1B4332] text-[#E6C065] flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <span className="font-serif font-bold text-[#23201C] text-xs sm:text-sm whitespace-nowrap">
            Porównaj ({compareList.length}/3):
          </span>
          <div className="flex gap-1.5 flex-wrap items-center justify-center">
            {compareList.map(p => (
              <div 
                key={p.id} 
                className="flex items-center gap-1.5 bg-white border border-[#D9821E]/25 rounded-full pl-1 pr-2 py-0.5 text-[11px] font-semibold text-[#4A4033] shadow-xs"
              >
                <img src={p.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover bg-[#EFE7DA]" />
                <span className="max-w-[90px] sm:max-w-[120px] truncate">{p.name}</span>
                <button 
                  onClick={() => onRemove(p)} 
                  className="text-[#9C8E7D] hover:text-[#8E5116] transition-colors cursor-pointer p-0.5"
                  title={`Usuń ${p.name} z porównania`}
                  aria-label={`Usuń ${p.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#D9821E]/15">
          <button 
            onClick={onClear}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold text-[#786C5B] hover:text-[#23201C] hover:bg-[#EFE7DA] transition-colors cursor-pointer"
            title="Wyczyść listę porównania"
          >
            Wyczyść
          </button>
          <button 
            onClick={onOpenModal}
            className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143326] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            id="btn-otworz-porownywarke-floating"
          >
            <Scale className="w-3.5 h-3.5 text-[#E6C065]" />
            <span>Porównaj odmiany</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function App() {
  const displayResolution = useDisplayResolution();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [compareList, setCompareList] = useState<HoneyProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [hasPreloadedHome, setHasPreloadedHome] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem('warmia_home_preloaded');
      localStorage.removeItem('warmia_home_preloaded');
    } catch {}
  }, []);

  const handleRemoveFromCompare = (product: HoneyProduct) => {
    setCompareList(prev => prev.filter(p => p.id !== product.id));
  };

  const handleAddToCompare = (product: HoneyProduct) => {
    if (HIVE_TREASURE_IDS.includes(product.id)) return;
    setCompareList(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      if (prev.length >= 3) {
        return [prev[0], prev[1], product];
      }
      return [...prev, product];
    });
  };

  const toggleCompare = (product: HoneyProduct) => {
    if (HIVE_TREASURE_IDS.includes(product.id)) {
      setToastMessage('Porównywarka służy wyłącznie do zestawiania odmian miodów.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) {
        setToastMessage('Możesz porównać maksymalnie 3 miody.');
        setTimeout(() => setToastMessage(null), 3000);
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleAddToCart = (product: HoneyProduct, weightGrams: number, pricePln: number, subscriptionInterval?: number) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => {
          const itemW = item.weightGrams ?? item.selectedWeightGrams ?? item.product.sizes[0]?.weightGrams;
          return item.product.id === product.id && itemW === weightGrams && item.subscriptionInterval === subscriptionInterval;
        }
      );
      if (existing) {
        return prev.map((item) => {
          const itemW = item.weightGrams ?? item.selectedWeightGrams ?? item.product.sizes[0]?.weightGrams;
          return item.product.id === product.id && itemW === weightGrams && item.subscriptionInterval === subscriptionInterval
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        });
      }
      return [
        ...prev, 
        { 
          product, 
          weightGrams, 
          selectedWeightGrams: weightGrams, 
          pricePln, 
          quantity: 1,
          subscriptionInterval,
        }
      ];
    });
    const subText = subscriptionInterval ? ` (autouzupełnianie co ${subscriptionInterval} dni)` : '';
    setToastMessage(`Dodano ${product.name} (${weightGrams}g)${subText} do koszyka!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateQuantity = (productId: string, weightGrams: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          const itemW = item.weightGrams ?? item.selectedWeightGrams ?? item.product.sizes[0]?.weightGrams;
          const isMatch = item.product.id === productId && (!weightGrams || itemW === weightGrams);
          return isMatch
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string, weightGrams: number) => {
    setCartItems((prev) =>
      prev.filter((item) => {
        const itemW = item.weightGrams ?? item.selectedWeightGrams ?? item.product.sizes[0]?.weightGrams;
        const isMatch = item.product.id === productId && (!weightGrams || itemW === weightGrams);
        return !isMatch;
      })
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
    setIsCartOpen(false);
  };

  const lenis = useLenis();

  // Synchronize Lenis smooth scroll with GSAP ScrollTrigger ticker and eliminate mobile jitter
  useEffect(() => {
    if (!lenis) return;
    gsap.ticker.lagSmoothing(0);
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  const scrollToProducts = () => {
    window.location.hash = '#/sklep';
  };

  const handleNavigateToCatalogFromCart = () => {
    setIsCartOpen(false);
    window.location.hash = '#/sklep';
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.pricePln * item.quantity, 0);

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#24211D]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-24 right-6 z-50 bg-[#2D2821] text-[#FAF5ED] px-4 py-3 rounded-2xl shadow-xl border border-[#483F33] flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="w-6 h-6 rounded-full bg-[#E5983A] text-[#2D2821] flex items-center justify-center text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium">{toastMessage}</span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="ml-2 text-xs font-bold text-[#E5983A] hover:underline cursor-pointer"
            >
              Zobacz koszyk →
            </button>
          </div>
        )}

        <Header
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
          containerClass={displayResolution.containerClass}
        />

        <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" /></div>}>
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onAddToCart={handleAddToCart} 
                  displayResolution={displayResolution}
                  toggleCompare={toggleCompare}
                  compareList={compareList}
                  scrollToProducts={scrollToProducts}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                  hasPreloadedHome={hasPreloadedHome}
                  onPreloadComplete={() => setHasPreloadedHome(true)}
                />
              } 
            />
            <Route 
              path="/o-nas" 
              element={
                <AboutUsPage 
                  displayResolution={displayResolution}
                  scrollToProducts={scrollToProducts}
                />
              } 
            />
            <Route 
              path="/sklep" 
              element={
                <ShopPage 
                  onAddToCart={handleAddToCart} 
                  displayResolution={displayResolution}
                  toggleCompare={toggleCompare}
                  compareList={compareList}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                />
              } 
            />
            <Route 
              path="/oferta" 
              element={
                <OfferPage 
                  displayResolution={displayResolution}
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/skarby-ula" 
              element={
                <OfferPage 
                  displayResolution={displayResolution}
                  onAddToCart={handleAddToCart}
                />
              } 
            />
            <Route 
              path="/blog" 
              element={
                <BlogPage 
                  displayResolution={displayResolution}
                />
              } 
            />
            <Route 
              path="/kontakt" 
              element={
                <ContactPage 
                  displayResolution={displayResolution}
                />
              } 
            />
            <Route 
              path="/konto" 
              element={
                <AccountPage 
                  displayResolution={displayResolution}
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              } 
            />
            <Route 
              path="/moje-konto" 
              element={
                <AccountPage 
                  displayResolution={displayResolution}
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              } 
            />
            <Route 
              path="/produkt/:id" 
              element={
                <ProductPage 
                  onAddToCart={handleAddToCart} 
                  onOpenCompare={(p) => {
                    toggleCompare(p);
                    setIsCompareModalOpen(true);
                  }}
                />
              } 
            />
            <Route 
              path="/zamowienie" 
              element={
                <CheckoutPage 
                  items={cartItems}
                  onClearCart={handleClearCart}
                  displayResolution={displayResolution}
                />
              } 
            />
            {/* Catch-all fallback */}
            <Route 
              path="*" 
              element={
                <HomePage 
                  onAddToCart={handleAddToCart} 
                  displayResolution={displayResolution}
                  toggleCompare={toggleCompare}
                  compareList={compareList}
                  scrollToProducts={scrollToProducts}
                  onOpenQuiz={() => setIsQuizOpen(true)}
                  hasPreloadedHome={hasPreloadedHome}
                  onPreloadComplete={() => setHasPreloadedHome(true)}
                />
              } 
            />
          </Routes>
        </Suspense>

        <Footer containerClass={displayResolution.containerClass} />

        {/* Global Modals & Overlays (Rendered on demand with Suspense) */}
        {isCompareModalOpen && (
          <Suspense fallback={null}>
            <ComparisonModal
              isOpen={isCompareModalOpen}
              onClose={() => setIsCompareModalOpen(false)}
              products={compareList}
              onRemove={handleRemoveFromCompare}
              onAdd={handleAddToCompare}
              onAddToCart={handleAddToCart}
            />
          </Suspense>
        )}

        {isCartOpen && (
          <Suspense fallback={null}>
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onAddToCart={handleAddToCart}
              onNavigateToCatalog={handleNavigateToCatalogFromCart}
            />
          </Suspense>
        )}

        <GlobalQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />

        <FloatingCompareBar
          compareList={compareList}
          isCompareModalOpen={isCompareModalOpen}
          onRemove={handleRemoveFromCompare}
          onClear={() => setCompareList([])}
          onOpenModal={() => setIsCompareModalOpen(true)}
        />
      </div>
    </HashRouter>
  );
}

export default App;
