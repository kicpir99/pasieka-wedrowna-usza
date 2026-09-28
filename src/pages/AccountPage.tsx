import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  RefreshCw, 
  CreditCard, 
  MapPin, 
  Check, 
  AlertCircle, 
  Calendar, 
  PauseCircle, 
  PlayCircle, 
  Trash2, 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  Sparkles,
  Truck,
  Lock,
  Mail,
  Phone,
  Gift,
  Award,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth, UserAddress, SavedCard } from '../context/AuthContext';

interface AccountPageProps {
  displayResolution?: { width: number; height: number; deviceType: string; containerClass: string };
}

export const AccountPage: React.FC<AccountPageProps> = ({ displayResolution }) => {
  const containerClass = displayResolution?.containerClass || 'max-w-7xl mx-auto';
  const navigate = useNavigate();
  const { 
    isLoggedIn, 
    user, 
    login, 
    register,
    logout, 
    loginAsDemoUser,
    updateSubscriptionInterval,
    togglePauseSubscription,
    cancelSubscription,
    updateAddress,
    updateCard
  } = useAuth();

  // Tab states for logged-in view
  const [activeTab, setActiveTab] = useState<'pulpit' | 'subskrypcje' | 'zamowienia' | 'adresy' | 'platnosci' | 'ustawienia'>('pulpit');

  // Auth form states (when not logged in)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordRepeat, setRegPasswordRepeat] = useState('');
  const [regParcelLocker, setRegParcelLocker] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [regNewsletterAccepted, setRegNewsletterAccepted] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Address edit state (when logged in)
  const [addressForm, setAddressForm] = useState<UserAddress>(() => {
    return user?.address || {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      postalCode: '',
      phone: '',
      parcelLocker: '',
    };
  });
  const [saveAddressSuccess, setSaveAddressSuccess] = useState(false);

  // Card edit state (when logged in)
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardForm, setCardForm] = useState<SavedCard>({
    brand: 'Visa',
    last4: '4242',
    expiry: '12/28',
  });
  const [saveCardSuccess, setSaveCardSuccess] = useState(false);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!loginEmail.trim()) {
      setFormError('Proszę podać adres e-mail.');
      return;
    }
    login(loginEmail.trim(), loginPassword);
  };

  // Handle Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!regFirstName.trim() || !regLastName.trim()) {
      setFormError('Proszę podać imię i nazwisko.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setFormError('Proszę podać poprawny adres e-mail.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setFormError('Hasło musi mieć co najmniej 6 znaków.');
      return;
    }
    if (regPassword !== regPasswordRepeat) {
      setFormError('Podane hasła nie są identyczne.');
      return;
    }
    if (!regTermsAccepted) {
      setFormError('Wymagana jest akceptacja regulaminu i polityki prywatności.');
      return;
    }

    register({
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim(),
      parcelLocker: regParcelLocker.trim(),
    });
  };

  // Handle Address Save
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddress(addressForm);
    setSaveAddressSuccess(true);
    setTimeout(() => setSaveAddressSuccess(false), 3000);
  };

  // Handle Card Save
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCard(cardForm);
    setIsEditingCard(false);
    setSaveCardSuccess(true);
    setTimeout(() => setSaveCardSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24 text-[#24211D]">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#E7DAC8] bg-[#F4EDE2]/70 py-3">
        <div className={`adaptive-container ${containerClass} px-4 sm:px-6 lg:px-8 text-xs text-[#7B6E5C] flex items-center gap-2`}>
          <Link to="/" className="hover:text-[#8B5337] transition-colors">Strona Główna</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#B8A894]" />
          <span className="font-semibold text-[#2D2821]">Moje Konto Pasieczne</span>
          {isLoggedIn && user && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#B8A894]" />
              <span className="text-[#8B5337]">{user.firstName} {user.lastName}</span>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${containerClass} px-4 sm:px-6 lg:px-8 relative z-10`}>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold mb-4">
              <User className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? 'Klub Przyjaciół Pasieki Usza' : 'Strefa Klienta i Klub Pasieczny'}</span>
            </div>
            
            {isLoggedIn && user ? (
              <div>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
                  Witaj, {user.firstName}!
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[#C7BDB0] leading-relaxed">
                  Zarządzaj swoimi zamówieniami miodów, autouzupełnianiem spiżarni, zapisanym Paczkomatem InPost oraz danymi wysyłkowymi.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
                  Moje Konto w Pasiece Usza
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[#C7BDB0] leading-relaxed">
                  Zaloguj się lub załóż konto, aby zyskać stały dostęp do historii zamówień, szybkiej wysyłki bez ponownego wpisywania adresu oraz autouzupełniania spiżarni ze stałym rabatem -10%.
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar for Logged-In User */}
          {isLoggedIn && user && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#463D31]">
              <div className="bg-[#383126] p-3.5 sm:p-4 rounded-2xl border border-[#524637]">
                <div className="text-[11px] font-medium text-[#C7BDB0] flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#E5983A]" />
                  <span>Subskrypcje</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-serif text-[#FAF5ED] mt-1">
                  {user.subscriptions.length} aktywne
                </div>
              </div>

              <div className="bg-[#383126] p-3.5 sm:p-4 rounded-2xl border border-[#524637]">
                <div className="text-[11px] font-medium text-[#C7BDB0] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#E5983A]" />
                  <span>Zamówienia</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-serif text-[#FAF5ED] mt-1">
                  {user.orders.length} zrealizowane
                </div>
              </div>

              <div className="bg-[#383126] p-3.5 sm:p-4 rounded-2xl border border-[#524637]">
                <div className="text-[11px] font-medium text-[#C7BDB0] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#E5983A]" />
                  <span>Domyślny Paczkomat</span>
                </div>
                <div className="text-xs font-semibold text-[#FAF5ED] mt-1 truncate" title={user.address.parcelLocker || 'Brak'}>
                  {user.address.parcelLocker ? user.address.parcelLocker.split('•')[0] : 'Nie wybrano'}
                </div>
              </div>

              <div className="bg-[#383126] p-3.5 sm:p-4 rounded-2xl border border-[#524637] flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-[#C7BDB0] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#E5983A]" />
                    <span>Status Klubu</span>
                  </div>
                  <div className="text-xs font-bold text-[#E5983A] mt-1">
                    Przyjaciel Pasieki
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl bg-[#2D2821] hover:bg-[#483F31] text-[#D8CCC0] hover:text-[#FAF5ED] transition-colors cursor-pointer"
                  title="Wyloguj się"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className={`adaptive-container ${containerClass} px-4 sm:px-6 lg:px-8 -mt-6 relative z-20`}>
        {!isLoggedIn ? (
          /* ========================================================
             NOT LOGGED IN: TWO-COLUMN LAYOUT (FORM + BENEFITS)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Login / Register Card */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DCCE] shadow-lg">
              {/* Tab Selector: Logowanie vs Załóż konto */}
              <div className="grid grid-cols-2 p-1.5 bg-[#F5EFE6] rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setFormError(null); }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-[#23201C] shadow-sm'
                      : 'text-[#6D604F] hover:text-[#23201C]'
                  }`}
                >
                  Zaloguj się
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setFormError(null); }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-[#23201C] shadow-sm'
                      : 'text-[#6D604F] hover:text-[#23201C]'
                  }`}
                >
                  Załóż nowe konto
                </button>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#4A4033] mb-1.5">
                      Adres e-mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A69784] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="twoj.email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D9821E]/30 text-xs sm:text-sm text-[#23201C]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#4A4033]">
                        Hasło
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('W celu resetu hasła wyślemy link na Twój adres e-mail (w integracji produkcyjnej z WooCommerce).')}
                        className="text-[11px] font-semibold text-[#8B5337] hover:underline"
                      >
                        Nie pamiętasz hasła?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#A69784] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D9821E]/30 text-xs sm:text-sm text-[#23201C]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#635747]">
                      <input
                        type="checkbox"
                        checked={loginRemember}
                        onChange={(e) => setLoginRemember(e.target.checked)}
                        className="rounded border-[#D9CDBD] text-[#D9821E] focus:ring-[#D9821E]"
                      />
                      <span>Zapamiętaj mnie na tym urządzeniu</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Zaloguj się do konta</span>
                    <ArrowRight className="w-4 h-4 text-[#E5983A]" />
                  </button>

                  {/* Demo test login */}
                  <div className="pt-4 border-t border-[#EFE5D8]">
                    <div className="p-3.5 rounded-2xl bg-[#F6EFE5] border border-[#DFCBB5] text-center space-y-2">
                      <span className="text-[11px] text-[#716556] block">
                        Chcesz przetestować panel subskrypcji i historię zamówień?
                      </span>
                      <button
                        type="button"
                        onClick={loginAsDemoUser}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#C5B39C] text-[#8B5337] font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                        <span>Wypróbuj konto demonstracyjne (Demo)</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* REGISTER FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A4033] mb-1">
                        Imię *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="np. Anna"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A4033] mb-1">
                        Nazwisko *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="np. Kowalska"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4033] mb-1">
                      Adres e-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#A69784] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="twoj.email@example.com"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4033] mb-1">
                      Numer telefonu (dla SMS od InPost)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#A69784] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+48 600 000 000"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A4033] mb-1">
                      Preferowany Paczkomat InPost (opcjonalnie)
                    </label>
                    <div className="relative">
                      <Truck className="w-3.5 h-3.5 text-[#A69784] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regParcelLocker}
                        onChange={(e) => setRegParcelLocker(e.target.value)}
                        placeholder="np. WRO05M • ul. Sienkiewicza 32, Wrocław"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                    <span className="text-[10px] text-[#8C7D6B] mt-0.5 block">
                      Zapisany Paczkomat podstawi się automatycznie przy każdym zamówieniu!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#4A4033] mb-1">
                        Hasło *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="min. 6 znaków"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A4033] mb-1">
                        Powtórz hasło *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPasswordRepeat}
                        onChange={(e) => setRegPasswordRepeat(e.target.value)}
                        placeholder="powtórz hasło"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>
                  </div>

                  {/* Consents */}
                  <div className="space-y-2 pt-2 border-t border-[#EFE5D8]">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[#635747]">
                      <input
                        type="checkbox"
                        required
                        checked={regTermsAccepted}
                        onChange={(e) => setRegTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CDBD] text-[#D9821E] focus:ring-[#D9821E]"
                      />
                      <span>
                        Akceptuję <a href="#/regulamin" className="text-[#8B5337] underline">Regulamin Pasieki</a> oraz <a href="#/prywatnosc" className="text-[#8B5337] underline">Politykę Prywatności</a>. *
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[#635747]">
                      <input
                        type="checkbox"
                        checked={regNewsletterAccepted}
                        onChange={(e) => setRegNewsletterAccepted(e.target.checked)}
                        className="mt-0.5 rounded border-[#D9CDBD] text-[#D9821E] focus:ring-[#D9821E]"
                      />
                      <span>
                        Chcę dołączyć do Klubu Przyjaciół Pasieki i otrzymać powitalny kod rabatowy <strong>-10%</strong> na pierwsze miodobranie.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Załóż konto i odbierz korzyści</span>
                    <Gift className="w-4 h-4 text-[#E6C065]" />
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Why Register? (Benefits Showcase) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E7DCCE] shadow-md">
                <div className="flex items-center gap-2.5 text-[#8B5337] font-bold text-xs uppercase tracking-wider mb-2">
                  <Award className="w-4 h-4" />
                  <span>Dlaczego warto założyć konto?</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#23201C] mb-4">
                  Klub Przyjaciół Pasieki Usza
                </h2>
                <p className="text-xs sm:text-sm text-[#6B5E4F] leading-relaxed mb-6">
                  Rejestracja trwa zaledwie 30 sekund i daje Ci pełen komfort opieki pasiecznej, gwarancję świeżości oraz wygodę bez konieczności każdorazowego wpisywania danych.
                </p>

                {/* 5 Distinct Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFE3CF] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#1B4332] text-[#E6C065] flex items-center justify-center shrink-0 shadow-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#23201C]">
                        1. Śledzenie zamówień i historia w czasie rzeczywistym
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#716556] mt-0.5 leading-relaxed">
                        Pełna historia Twoich słoików miodu, podgląd statusu pakowania w pasiece oraz natychmiastowy link do śledzenia przesyłki InPost Paczkomat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFE3CF] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#945209] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#23201C]">
                        2. Błyskawiczne zakupy bez ponownego wpisywania danych
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#716556] mt-0.5 leading-relaxed">
                        Twój adres domowy i ulubiony Paczkomat zapisują się raz w profilu i podstawiają automatycznie w koszyku. Koniec z mozolnym wypełnianiem formularzy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFE3CF] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#D9821E] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#23201C]">
                        3. Autouzupełnianie Spiżarni ze stałym rabatem -10%
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#716556] mt-0.5 leading-relaxed">
                        Świeży miód z pasieki prosto na Twój stół co 30, 60 lub 90 dni. Możesz wstrzymać dostawę na czas wakacji lub zrezygnować 1 kliknięciem bez żadnych umów.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFE3CF] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#8B5337] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#23201C]">
                        4. Klubowe kody rabatowe i promocje
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#716556] mt-0.5 leading-relaxed">
                        Dostęp do unikalnych kodów zniżkowych, prezentów do zamówień oraz okazjonalnych miodobrań dostępnych tylko dla członków klubu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFE3CF] shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-[#2D2821] text-[#E6C065] flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#23201C]">
                        5. Pierwszeństwo przy limitowanych zbiorach
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#716556] mt-0.5 leading-relaxed">
                        Rzadkie zbiory miodu wrzosowego z poligonu czy miodu ze spadzi iglastej znikają w kilka dni. Klubowicze zamawiają je jako pierwsi w przedsprzedaży.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             LOGGED IN: FULL ACCOUNT DASHBOARD WITH RICH TABS
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 bg-white rounded-3xl p-4 sm:p-5 border border-[#E7DCCE] shadow-md space-y-1.5 sticky top-28">
              <div className="px-3 py-2 mb-2 border-b border-[#F0E6D8]">
                <div className="text-xs font-bold text-[#23201C] truncate">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[11px] text-[#786B5A] truncate">
                  {user.email}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('pulpit')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'pulpit'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#584D3E] hover:bg-[#F6EFE5] hover:text-[#23201C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>Pulpit Klienta</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subskrypcje')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'subskrypcje'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#584D3E] hover:bg-[#F6EFE5] hover:text-[#23201C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4" />
                  <span>Autouzupełnianie</span>
                </div>
                {user.subscriptions.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'subskrypcje' ? 'bg-[#E6C065] text-[#1B4332]' : 'bg-[#EFE3CF] text-[#7E4207]'
                  }`}>
                    {user.subscriptions.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('zamowienia')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'zamowienia'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#584D3E] hover:bg-[#F6EFE5] hover:text-[#23201C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Zamówienia</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'zamowienia' ? 'bg-[#E6C065] text-[#1B4332]' : 'bg-[#EFE3CF] text-[#7E4207]'
                }`}>
                  {user.orders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('adresy')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'adresy'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#584D3E] hover:bg-[#F6EFE5] hover:text-[#23201C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>Adres & Paczkomat</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('platnosci')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'platnosci'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-[#584D3E] hover:bg-[#F6EFE5] hover:text-[#23201C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Karty & PCI-DSS</span>
                </div>
              </button>

              <div className="pt-3 border-t border-[#F0E6D8]">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C2E2E] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Wyloguj się</span>
                </button>
              </div>
            </aside>

            {/* Main Tab Content */}
            <div className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DCCE] shadow-lg min-h-[500px]">
              
              {/* TAB 1: PULPIT / OVERVIEW */}
              {activeTab === 'pulpit' && (
                <div className="space-y-6">
                  <div className="border-b border-[#EFE3CF] pb-4">
                    <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                      Pulpit Twojego Konta
                    </h2>
                    <p className="text-xs text-[#6B5E4F] mt-1">
                      Podsumowanie Twojej aktywności i szybkie skróty w Pasiece Usza.
                    </p>
                  </div>

                  {/* Banner: Club Status */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF3E8] to-[#F5ECE0] border border-[#DFCBB5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#D9821E] text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm shrink-0">
                        🐝
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#8B5337] uppercase tracking-wider">
                          Klub Pasieki Usza • Poziom Aktywny
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#23201C]">
                          Stały rabat -10% na autouzupełnianie miodów
                        </h3>
                        <p className="text-xs text-[#716556] mt-0.5">
                          Twoje dane adresowe i Paczkomat są aktywne i gotowe do 1-kliknięciowych zakupów.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/sklep"
                      className="shrink-0 px-4 py-2.5 rounded-xl bg-[#2D2821] text-white text-xs font-bold hover:bg-[#433B31] transition-all flex items-center gap-2"
                    >
                      <span>Przejdź do sklepu</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E5983A]" />
                    </Link>
                  </div>

                  {/* Subscriptions Spotlight */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-[#23201C] flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#D9821E]" />
                        <span>Twoje Miodowe Autouzupełnianie</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('subskrypcje')}
                        className="text-xs font-bold text-[#8B5337] hover:underline"
                      >
                        Zarządzaj ({user.subscriptions.length}) →
                      </button>
                    </div>

                    {user.subscriptions.length === 0 ? (
                      <div className="text-center p-6 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DFCBB5] text-xs text-[#786B5A]">
                        Nie masz jeszcze aktywnych subskrypcji miodu. Zamów słoik z opcją „Autouzupełnianie (-10%)”, aby nie martwić się o pustą spiżarnię!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.subscriptions.map((sub) => (
                          <div key={sub.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7DDCE] flex items-center gap-3">
                            <img src={sub.imageUrl} alt={sub.productName} className="w-14 h-14 rounded-xl object-cover bg-amber-50 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-[#23201C] truncate">{sub.productName}</h4>
                              <p className="text-[11px] text-[#716556]">{sub.weightLabel} • {sub.pricePln} zł</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332]/10 text-[#1B4332]">
                                  Co {sub.intervalDays} dni
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {sub.status === 'active' ? 'Aktywna' : 'Wstrzymana'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Delivery Address & Paczkomat Spotlight */}
                  <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7DDCE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-[#8B5337] flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Zapisany domyślny Paczkomat InPost</span>
                      </div>
                      <div className="text-sm font-bold text-[#23201C]">
                        {user.address.parcelLocker || 'Brak zapisanego Paczkomatu'}
                      </div>
                      <div className="text-xs text-[#716556]">
                        {user.address.street ? `${user.address.street}, ${user.address.postalCode} ${user.address.city}` : 'Adres domowy nie został jeszcze uzupełniony.'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('adresy')}
                      className="px-4 py-2 rounded-xl bg-white border border-[#DFCBB5] text-xs font-bold text-[#4A4033] hover:bg-[#F2E5D3] transition-colors"
                    >
                      Edytuj dane dostawy
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AUTOUZUPEŁNIANIE SPIŻARNI (SUBSKRYPCJE) */}
              {activeTab === 'subskrypcje' && (
                <div className="space-y-6">
                  <div className="border-b border-[#EFE3CF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                        Autouzupełnianie Spiżarni (Subskrypcje)
                      </h2>
                      <p className="text-xs text-[#6B5E4F] mt-1">
                        Twoje regularne dostawy miodu ze stałym rabatem -10%. Pełna kontrola w 1 kliknięcie.
                      </p>
                    </div>
                    <Link
                      to="/sklep"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold hover:bg-[#143326] transition-colors w-fit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Dodaj miód do subskrypcji</span>
                    </Link>
                  </div>

                  {user.subscriptions.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-3xl bg-[#FAF8F5] border border-dashed border-[#DFCBB5] space-y-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFE3CF] text-[#945209] flex items-center justify-center text-2xl">
                        🍯
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="font-serif text-lg font-bold text-[#23201C]">
                          Brak aktywnych dostaw w subskrypcji
                        </h3>
                        <p className="text-xs text-[#786B5A] mt-1 leading-relaxed">
                          Wybierz dowolny miód w naszym sklepie i zaznacz opcję <strong>„Autouzupełnianie Spiżarni”</strong>, aby zyskać 10% rabatu na zawsze i regularne dostawy bez pamiętania o zakupach.
                        </p>
                      </div>
                      <Link
                        to="/sklep"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D2821] text-white text-xs font-bold hover:bg-[#433B31]"
                      >
                        Przeglądaj miody w sklepie
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.subscriptions.map((sub) => {
                        const isPaused = sub.status === 'paused';
                        return (
                          <div
                            key={sub.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isPaused 
                                ? 'bg-[#F5F2EB] border-[#DCD5C9] opacity-85' 
                                : 'bg-[#FAF8F5] border-[#E2D5C3] shadow-xs hover:border-[#D9821E]/50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={sub.imageUrl}
                                  alt={sub.productName}
                                  referrerPolicy="no-referrer"
                                  className="w-16 h-16 rounded-xl object-cover bg-amber-50 border border-[#E7DAC8] shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-serif text-base font-bold text-[#23201C]">
                                      {sub.productName}
                                    </h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isPaused 
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                        : 'bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20'
                                    }`}>
                                      {isPaused ? 'Wstrzymana (Urlop)' : 'Aktywna (-10%)'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#716556] mt-0.5">
                                    Wielkość: <strong>{sub.weightLabel}</strong> • Cena: <strong>{sub.pricePln} zł</strong> / dostawa
                                  </p>
                                  <div className="flex items-center gap-1.5 text-xs text-[#8C4609] mt-1 font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                      {isPaused ? 'Dostawa zawieszona do momentu wznowienia' : `Najbliższa wysyłka: ${sub.nextShipmentDate}`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Subscription action buttons */}
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E9DFD2]">
                                <button
                                  type="button"
                                  onClick={() => togglePauseSubscription(sub.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    isPaused
                                      ? 'bg-[#1B4332] text-white hover:bg-[#143326]'
                                      : 'bg-white border border-[#D9CDBD] text-[#554939] hover:bg-[#EFE5D6]'
                                  }`}
                                  title={isPaused ? 'Wznów regularne dostawy' : 'Wstrzymaj na czas wyjazdu / wakacji'}
                                >
                                  {isPaused ? (
                                    <>
                                      <PlayCircle className="w-3.5 h-3.5" />
                                      <span>Wznów</span>
                                    </>
                                  ) : (
                                    <>
                                      <PauseCircle className="w-3.5 h-3.5" />
                                      <span>Wstrzymaj</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Czy na pewno chcesz anulować autouzupełnianie dla: ${sub.productName}? Możesz też po prostu wstrzymać subskrypcję bez utraty rabatu.`)) {
                                      cancelSubscription(sub.id);
                                    }
                                  }}
                                  className="p-2 text-[#A69784] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                  title="Anuluj autouzupełnianie jednym kliknięciem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Frequency Switcher: 30 / 60 / 90 days */}
                            <div className="mt-4 pt-3 border-t border-[#EDE1D1] flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#554A3B]">
                                Częstotliwość wysyłki:
                              </span>
                              <div className="flex items-center gap-1.5">
                                {([30, 60, 90] as const).map((days) => {
                                  const isActive = sub.intervalDays === days;
                                  return (
                                    <button
                                      key={days}
                                      type="button"
                                      onClick={() => updateSubscriptionInterval(sub.id, days)}
                                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isActive
                                          ? 'bg-[#D9821E] text-white shadow-2xs'
                                          : 'bg-white border border-[#DFCBB5] text-[#635747] hover:bg-[#F3E7D5]'
                                      }`}
                                    >
                                      Co {days} dni
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Subscription Policy & Guarantees */}
                  <div className="p-4 rounded-2xl bg-[#F6EFE5] border border-[#DFCBB5] text-xs text-[#6B5E4F] space-y-2">
                    <div className="flex items-center gap-2 font-bold text-[#23201C]">
                      <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                      <span>Zasady Autouzupełniania Pasieki Usza</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                      <li>Brak jakichkolwiek umów i minimalnych okresów – możesz anulować w każdej chwili 1 kliknięciem.</li>
                      <li>Przed każdym kolejnym pobraniem płatności i wysyłką otrzymasz od nas e-mail z powiadomieniem (3 dni wcześniej).</li>
                      <li>Możesz bezpłatnie wstrzymać subskrypcję w dowolnym momencie (np. na czas wakacji lub urlopu).</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: ZAMÓWIENIA */}
              {activeTab === 'zamowienia' && (
                <div className="space-y-6">
                  <div className="border-b border-[#EFE3CF] pb-4">
                    <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                      Historia Zamówień
                    </h2>
                    <p className="text-xs text-[#6B5E4F] mt-1">
                      Wszystkie zamówienia złożone w Pasiece Usza z podglądem numeru przesyłki InPost.
                    </p>
                  </div>

                  {user.orders.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#786B5A]">
                      Nie masz jeszcze złożonych zamówień na tym koncie.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {user.orders.map((ord) => (
                        <div key={ord.id} className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7DDCE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs sm:text-sm text-[#23201C]">{ord.id}</span>
                              <span className="text-[11px] text-[#8C7D6B]">• {ord.date}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#524637] font-medium">{ord.itemsSummary}</p>
                            {ord.trackingNumber && (
                              <p className="text-[11px] text-[#8B5337] flex items-center gap-1 font-semibold">
                                <Truck className="w-3.5 h-3.5" />
                                <span>InPost Paczkomat: <code>{ord.trackingNumber}</code></span>
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-serif text-lg font-bold text-[#23201C]">{ord.totalPln} zł</div>
                            <span className="text-[10px] text-green-700 font-bold">Opłacono online</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ADRESY & PACZKOMAT INPOST */}
              {activeTab === 'adresy' && (
                <div className="space-y-6">
                  <div className="border-b border-[#EFE3CF] pb-4">
                    <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                      Adres Dostawy & Paczkomat InPost
                    </h2>
                    <p className="text-xs text-[#6B5E4F] mt-1">
                      Dane zapisane w tym miejscu będą <strong>automatycznie podstawiane w koszyku</strong>, dzięki czemu złożysz kolejne zamówienie bez ponownego wpisywania!
                    </p>
                  </div>

                  {saveAddressSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Dane adresowe i preferowany Paczkomat zostały pomyślnie zaktualizowane!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Imię</label>
                        <input
                          type="text"
                          required
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Nazwisko</label>
                        <input
                          type="text"
                          required
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A4033] mb-1">Ulica i numer domu / lokalu</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="np. ul. Parkowa 14/8"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Kod pocztowy</label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          placeholder="np. 50-120"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Miejscowość</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="np. Wrocław"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Telefon kontaktowy</label>
                        <input
                          type="tel"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+48 600 000 000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#4A4033] mb-1">Domyślny Paczkomat InPost</label>
                        <input
                          type="text"
                          value={addressForm.parcelLocker}
                          onChange={(e) => setAddressForm({ ...addressForm, parcelLocker: e.target.value })}
                          placeholder="np. WRO05M • ul. Sienkiewicza 32, Wrocław"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] focus:bg-white text-xs text-[#23201C]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-3 px-6 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[#E5983A]" />
                      <span>Zapisz dane w profilu</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: KARTY & PCI-DSS */}
              {activeTab === 'platnosci' && (
                <div className="space-y-6">
                  <div className="border-b border-[#EFE3CF] pb-4">
                    <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                      Karty Płatnicze & Bezpieczeństwo (PCI-DSS)
                    </h2>
                    <p className="text-xs text-[#6B5E4F] mt-1">
                      Zarządzaj bezpieczną metodą płatności dla autouzupełniania spiżarni.
                    </p>
                  </div>

                  {saveCardSuccess && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Karta płatnicza została pomyślnie zaktualizowana!</span>
                    </div>
                  )}

                  {/* Card Display */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2D2821] to-[#1C1814] text-white max-w-sm shadow-xl space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#C7BDB0]">
                      <span className="font-bold tracking-wider uppercase text-[#E5983A]">Pasieka Usza • Karta Klubu</span>
                      <CreditCard className="w-5 h-5 text-[#E5983A]" />
                    </div>
                    <div className="font-mono text-lg tracking-widest py-2">
                      •••• •••• •••• {user.savedCard?.last4 || '4242'}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#A69784]">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider">Posiadacz</span>
                        <span className="font-bold text-[#FAF5ED]">{user.firstName} {user.lastName}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider">Ważność</span>
                        <span className="font-bold text-[#FAF5ED]">{user.savedCard?.expiry || '12/28'}</span>
                      </div>
                    </div>
                  </div>

                  {!isEditingCard ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingCard(true)}
                      className="px-4 py-2.5 rounded-xl border border-[#D9CDBD] bg-[#FAF8F5] hover:bg-white text-xs font-bold text-[#23201C] transition-colors"
                    >
                      Zmień zapisaną kartę płatniczą
                    </button>
                  ) : (
                    <form onSubmit={handleCardSubmit} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E7DDCE] max-w-md space-y-3">
                      <h4 className="font-bold text-xs text-[#23201C]">Wprowadź dane nowej karty:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A4033] mb-1">Ostatnie 4 cyfry</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={cardForm.last4}
                            onChange={(e) => setCardForm({ ...cardForm, last4: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#D9CDBD] text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A4033] mb-1">Data ważności (MM/RR)</label>
                          <input
                            type="text"
                            placeholder="MM/RR"
                            value={cardForm.expiry}
                            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-[#D9CDBD] text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#2D2821] text-white text-xs font-bold hover:bg-[#433B31]"
                        >
                          Zapisz kartę
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingCard(false)}
                          className="px-3 py-2 rounded-xl text-xs text-[#716556] hover:bg-[#EFE5D8]"
                        >
                          Anuluj
                        </button>
                      </div>
                    </form>
                  )}

                  {/* PCI-DSS Guarantee Box */}
                  <div className="p-4 rounded-2xl bg-[#F4F9F2] border border-[#D1E8CC] text-xs text-[#2D5A27] space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
                      <span>Certyfikowane Bezpieczeństwo Bankowe (PCI-DSS Poziom 1)</span>
                    </div>
                    <p className="text-[11px] text-[#3E6B38] leading-relaxed">
                      Pełne numery kart ani kody CVV/CVC nigdy nie trafiają na nasze serwery ani do kodu sklepu. Płatności cykliczne są obsługiwane za pośrednictwem bezpiecznego tokena kryptograficznego przez akredytowanego operatora (PayU / Przelewy24 / Stripe).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
