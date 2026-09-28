import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, Menu, X, ChevronDown, ArrowRight, User } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  cartItemCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onOpenAccount?: () => void;
  containerClass?: string;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  cartSubtotal,
  onOpenCart,
  onOpenQuiz,
  onOpenAccount,
  containerClass,
}) => {
  const { isLoggedIn, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [treasuresMenuOpen, setTreasuresMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToCatalog = (category?: string, intent?: string) => {
    setMegaMenuOpen(false);
    setTreasuresMenuOpen(false);
    setMobileMenuOpen(false);

    const searchParams = new URLSearchParams();
    if (category && category !== 'wszystkie') {
      searchParams.set('kategoria', category);
    }
    if (intent && intent !== 'wszystkie') {
      searchParams.set('intencja', intent);
    }

    const searchStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    navigate({
      pathname: '/sklep',
      search: searchStr,
    });
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  const isShopOrProduct = location.pathname.startsWith('/sklep') || location.pathname.startsWith('/produkt');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EBE4D8] transition-all">
      {/* Main navigation */}
      <div className={`adaptive-container ${containerClass || ''} px-4 sm:px-6 lg:px-8 2xl:px-10 relative`}>
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Logo brand */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center group cursor-pointer py-1"
            title="Pasieka wędrowna Usza - Strona Główna"
          >
            <img 
              src={getAssetUrl('assets/logo-usza.png')} 
              alt="Pasieka Wędrowna Usza" 
              className="h-14 sm:h-18 md:h-20 lg:h-[82px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors py-1 ${
                isActive('/') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
              }`}
            >
              Strona Główna
            </Link>

            <Link
              to="/o-nas"
              className={`text-sm font-semibold transition-colors py-1 ${
                isActive('/o-nas') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
              }`}
            >
              O nas
            </Link>

            {/* Sklep z Mega Menu */}
            <div 
              className="relative py-6"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <Link
                to="/sklep"
                className={`text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer py-1 ${
                  isActive('/sklep') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
                }`}
                title="Przejdź do pełnego sklepu"
              >
                <span>Sklep</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180 text-[#8B5337]' : 'text-[#8C7A6B]'}`} />
              </Link>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full -left-12 w-[680px] bg-[#FAF7F2] rounded-2xl border border-[#E4D9CA] shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="grid grid-cols-3 gap-6 pb-5 border-b border-[#EADFCF]">
                    
                    {/* Kolumna 1: Miody Wiosenne */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('wiosenne')}
                        className="text-[11px] uppercase font-bold text-[#8C7A6B] hover:text-[#1B4332] tracking-wider block text-left transition-colors cursor-pointer"
                      >
                        🌸 Zbiory Wiosenne
                      </button>
                      <ul className="space-y-1.5 text-xs">
                        <li>
                          <Link to="/produkt/miod-rzepakowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Rzepakowy (kremowany)
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-mniszkowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Mniszkowy
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-akacjowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Akacjowy
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-wielokwiatowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Wielokwiatowy
                          </Link>
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('wiosenne')}
                        className="text-[11px] font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>Zobacz zbiory wiosenne</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Kolumna 2: Miody Letnie */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('letnie')}
                        className="text-[11px] uppercase font-bold text-[#8C7A6B] hover:text-[#1B4332] tracking-wider block text-left transition-colors cursor-pointer"
                      >
                        ☀️ Zbiory Letnie
                      </button>
                      <ul className="space-y-1.5 text-xs">
                        <li>
                          <Link to="/produkt/miod-lipowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Lipowy (Aleje Ciechów)
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-malinowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Malinowy
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-faceliowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Faceliowy
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-nawlociowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Nawłociowy
                          </Link>
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('letnie')}
                        className="text-[11px] font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>Zobacz zbiory letnie</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Kolumna 3: Miody Leśne & Spadziowe */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('lesne-spadz')}
                        className="text-[11px] uppercase font-bold text-[#8C7A6B] hover:text-[#1B4332] tracking-wider block text-left transition-colors cursor-pointer"
                      >
                        🌲 Leśne & Spadź
                      </button>
                      <ul className="space-y-1.5 text-xs">
                        <li>
                          <Link to="/produkt/miod-ze-spadzi-iglastej" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód ze Spadzi Iglastej
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-lesny" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Leśny
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-gryczany" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Gryczany
                          </Link>
                        </li>
                        <li>
                          <Link to="/produkt/miod-wrzosowy" onClick={() => setMegaMenuOpen(false)} className="text-[#3D3428] hover:text-[#8B5337] font-medium block">
                            Miód Wrzosowy
                          </Link>
                        </li>
                      </ul>
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('lesne-spadz')}
                        className="text-[11px] font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>Zobacz leśne & spadź</span>
                        <span>→</span>
                      </button>
                    </div>

                  </div>

                  {/* Mega Menu Footer Banner */}
                  <div className="pt-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#695D4E] font-medium">
                        Szukasz propolisu, pierzgi lub świec?
                      </span>
                      <Link
                        to="/oferta"
                        onClick={() => setMegaMenuOpen(false)}
                        className="font-bold text-[#8B5337] hover:text-[#6A3D27] hover:underline inline-flex items-center gap-1 bg-[#F1E6D8] hover:bg-[#E8DCCB] px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>Skarby Ula</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMegaMenuOpen(false);
                        onOpenQuiz();
                      }}
                      className="text-xs font-bold text-[#1B4332] hover:text-[#8B5337] transition-colors flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#DFCBB5] shadow-2xs hover:shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                      <span>Quiz Doboru Miodu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Skarby Ula z dedykowanym Dropdown Menu */}
            <div 
              className="relative py-6"
              onMouseEnter={() => setTreasuresMenuOpen(true)}
              onMouseLeave={() => setTreasuresMenuOpen(false)}
            >
              <Link
                to="/oferta"
                className={`text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer py-1 ${
                  isActive('/oferta') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
                }`}
              >
                <span>Skarby Ula</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${treasuresMenuOpen ? 'rotate-180 text-[#8B5337]' : 'text-[#8C7A6B]'}`} />
              </Link>

              {treasuresMenuOpen && (
                <div className="absolute top-full -left-12 w-[370px] bg-[#FAF7F2] rounded-2xl border border-[#E4D9CA] shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                  <div className="border-b border-[#EADFCF] pb-2.5">
                    <span className="text-[11px] uppercase font-bold text-[#8C7A6B] tracking-wider block">
                      🛡️ Apiterapia & Rzemiosło
                    </span>
                    <p className="text-[11px] text-[#695D4E] mt-0.5">
                      Najcenniejsze dary ula z naszej pasieki
                    </p>
                  </div>

                  <ul className="space-y-1 text-xs">
                    <li>
                      <Link 
                        to="/produkt/pierzga-pszczela" 
                        onClick={() => setTreasuresMenuOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[#F2E8DC] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-[#24211D] group-hover:text-[#8B5337] block">Pierzga Pszczela (Bee Bread)</span>
                          <span className="text-[10px] text-[#7A6B5B]">Naturalny probiotyk i superfood</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5337] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/produkt/propolis-kit" 
                        onClick={() => setTreasuresMenuOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[#F2E8DC] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-[#24211D] group-hover:text-[#8B5337] block">Propolis (Kit pszczeli)</span>
                          <span className="text-[10px] text-[#7A6B5B]">Naturalna tarcza antybakteryjna</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5337] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/produkt/pylek-pszczeli" 
                        onClick={() => setTreasuresMenuOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[#F2E8DC] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-[#24211D] group-hover:text-[#8B5337] block">Pyłek Pszczeli Kwiatowy</span>
                          <span className="text-[10px] text-[#7A6B5B]">Bomba witaminowa i minerały</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5337] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/produkt/swieca-wosk-pszczeli" 
                        onClick={() => setTreasuresMenuOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[#F2E8DC] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-[#24211D] group-hover:text-[#8B5337] block">Świece ze 100% Wosku Pszczelego</span>
                          <span className="text-[10px] text-[#7A6B5B]">Czysty wosk bez parafiny</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5337] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/produkt/odklad-szkolenie-pszczele" 
                        onClick={() => setTreasuresMenuOpen(false)} 
                        className="p-2 rounded-xl hover:bg-[#F2E8DC] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <span className="font-bold text-[#24211D] group-hover:text-[#8B5337] block">Odkłady Pszczele & Szkolenia</span>
                          <span className="text-[10px] text-[#7A6B5B]">Zdrowe rodziny z matkami</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8B5337] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  </ul>

                  <div className="pt-2 border-t border-[#EADFCF]">
                    <Link
                      to="/oferta"
                      onClick={() => setTreasuresMenuOpen(false)}
                      className="w-full py-2 px-3 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Przejdź do pełnej oferty Skarbów Ula</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/blog"
              className={`text-sm font-semibold transition-colors py-1 ${
                isActive('/blog') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
              }`}
            >
              Blog
            </Link>

            <Link
              to="/kontakt"
              className={`text-sm font-semibold transition-colors py-1 ${
                isActive('/kontakt') ? 'text-[#8B5337] font-bold' : 'text-[#484138] hover:text-[#8B5337]'
              }`}
            >
              Kontakt
            </Link>
          </nav>

          {/* Actions: Quiz + Cart */}
          <div className="flex items-center gap-3">
            {isShopOrProduct && (
              <button
                onClick={onOpenQuiz}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-full bg-[#F3ECE0] text-[#7A4007] border border-[#E4D8C5] hover:bg-[#EBDDC8] transition-all cursor-pointer animate-in fade-in duration-200"
                id="header-quiz-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C47514]" />
                <span>Dobierz miód</span>
              </button>
            )}

            {/* Account / Moje Konto Link */}
            <Link
              to="/konto"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isActive('/konto')
                  ? 'border-[#8B5337] bg-[#F2E5D3] text-[#8B5337] font-bold'
                  : 'border-[#DFCBB5] bg-[#FAF5ED] hover:bg-[#F2E5D3] text-[#484138]'
              }`}
              id="header-account-btn"
              title="Moje Konto i Subskrypcje"
              aria-label="Konto użytkownika"
            >
              <User className="w-4 h-4 text-[#8B5337]" />
              <span className="hidden sm:inline text-xs font-semibold text-[#3D3428]">
                {isLoggedIn ? (user?.firstName || 'Konto') : 'Konto'}
              </span>
              {isLoggedIn && user?.subscriptions && user.subscriptions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#1B4332] ml-0.5" title="Aktywne subskrypcje" />
              )}
            </Link>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#2D2821] text-[#FAF5ED] hover:bg-[#3F382E] transition-all shadow-sm cursor-pointer"
              id="header-cart-btn"
              aria-label="Otwórz koszyk"
            >
              <ShoppingBag className="w-4 h-4 text-[#E5983A]" />
              <div className="text-left leading-none hidden xs:block">
                <span className="block text-[10px] text-[#A69989] uppercase tracking-wider font-medium">Koszyk</span>
                <span className="font-semibold text-xs text-[#FFF9F0]">{cartSubtotal > 0 ? `${cartSubtotal} zł` : '0 zł'}</span>
              </div>
              {cartItemCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-[#E5983A] text-[#24211D]">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#484138] hover:bg-[#EDE5D8] cursor-pointer"
              id="mobile-menu-toggle"
              aria-label="Menu mobilne"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#EBE4D8] space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              Strona Główna
            </Link>

            <Link
              to="/o-nas"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/o-nas') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              O nas (Historia Pasieki Usza)
            </Link>

            <Link
              to="/sklep"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/sklep') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              Sklep z Miodami
            </Link>

            <Link
              to="/oferta"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/oferta') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              Skarby Ula (Pierzga, Propolis, Wosk)
            </Link>

            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/blog') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              Blog & Wiedza
            </Link>

            <Link
              to="/kontakt"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/kontakt') ? 'bg-[#F4EDE0] text-[#8B5337] font-bold' : 'text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              Kontakt (Ciechów)
            </Link>

            <Link
              to="/konto"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left border ${
                isActive('/konto')
                  ? 'bg-[#F2E5D3] text-[#8B5337] font-bold border-[#8B5337]'
                  : 'border-[#E0D3C1] bg-[#FAF5ED] text-[#24211D] hover:bg-[#EDE5D8]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#8C4609]" />
                <span>{isLoggedIn ? `Moje Konto (${user?.firstName})` : 'Moje Konto Pasieczne'}</span>
              </div>
              {isLoggedIn && user?.subscriptions && user.subscriptions.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332] text-white">
                  {user.subscriptions.length} subskrypcje
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuiz();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl bg-[#1B4332] text-white hover:bg-[#143326] transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#E6C065]" />
              <span>Dobierz miód dla siebie (Quiz)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
