import React, { useState } from 'react';
import { 
  X, 
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
  Truck
} from 'lucide-react';
import { useAuth, UserAddress, SavedCard } from '../context/AuthContext';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'subskrypcje' | 'adresy' | 'platnosci' | 'zamowienia';
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'subskrypcje',
}) => {
  const { 
    isLoggedIn, 
    user, 
    login, 
    logout, 
    loginAsDemoUser,
    updateSubscriptionInterval,
    togglePauseSubscription,
    cancelSubscription,
    updateAddress,
    updateCard
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'subskrypcje' | 'adresy' | 'platnosci' | 'zamowienia'>(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
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

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [newCardForm, setNewCardForm] = useState<SavedCard>({
    brand: 'Visa',
    last4: '4242',
    expiry: '12/28',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    login(loginEmail.trim());
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddress(addressForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCard(newCardForm);
    setIsEditingCard(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-[#DFCBB5] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E7DDCE] bg-[#FAF8F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EFE3CF] text-[#7E4207] flex items-center justify-center shadow-2xs">
              <User className="w-5 h-5 text-[#8C4609]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#23201C] leading-tight">
                {isLoggedIn ? `Witaj, ${user?.firstName}!` : 'Konto Klienta Pasieki'}
              </h3>
              <p className="text-[11px] text-[#7A6C5B]">
                {isLoggedIn ? user?.email : 'Zarządzaj autouzupełnianiem spiżarni, adresami i zamówieniami'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8C4609] hover:bg-[#F3E7D5] transition-colors cursor-pointer"
                title="Wyloguj się"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Wyloguj</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#6E6150] hover:bg-[#EFE5D6] transition-colors cursor-pointer"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOT LOGGED IN VIEW */}
        {!isLoggedIn ? (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="text-center max-w-md mx-auto space-y-2">
              <span className="text-3xl">🍯</span>
              <h4 className="font-serif text-xl font-bold text-[#23201C]">
                Zaloguj się do swojej spiżarni
              </h4>
              <p className="text-xs text-[#695D4E] leading-relaxed">
                Śledź swoje zamówienia, zarządzaj częstotliwością autouzupełniania miodu i oszczędzaj czas przy kolejnych zakupach.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#594D42] mb-1 uppercase tracking-wider">
                  Adres e-mail:
                </label>
                <input
                  type="email"
                  required
                  placeholder="twoj-email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFCBB5] bg-white text-xs text-[#23201C] focus:outline-none focus:ring-2 focus:ring-[#8C4609]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#594D42] mb-1 uppercase tracking-wider">
                  Hasło:
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#DFCBB5] bg-white text-xs text-[#23201C] focus:outline-none focus:ring-2 focus:ring-[#8C4609]/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Zaloguj się</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Test Login */}
            <div className="pt-4 border-t border-[#E8DED1] max-w-md mx-auto text-center space-y-2">
              <span className="text-[11px] text-[#7A6C5B] block">
                Chcesz przetestować panel subskrypcji i konta?
              </span>
              <button
                type="button"
                onClick={loginAsDemoUser}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF0E1] hover:bg-[#F2E2CD] text-[#8C4609] border border-[#E0CFBA] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D9821E]" />
                <span>Zaloguj jako przykładowy klient (Anna Kowalska)</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGGED IN VIEW */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Bar */}
            <div className="flex items-center border-b border-[#E7DDCE] bg-[#F4EFE6] px-4 overflow-x-auto scrollbar-none shrink-0">
              {[
                { id: 'subskrypcje' as const, label: 'Autouzupełnianie', icon: RefreshCw, badge: user?.subscriptions.length },
                { id: 'adresy' as const, label: 'Adres & Paczkomat', icon: MapPin },
                { id: 'platnosci' as const, label: 'Karty & Płatności', icon: CreditCard },
                { id: 'zamowienia' as const, label: 'Historia zamówień', icon: Package, badge: user?.orders.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'border-[#8C4609] text-[#8C4609] bg-[#FAF8F5]'
                        : 'border-transparent text-[#6D604E] hover:text-[#23201C]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {Boolean(tab.badge) && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-[#8C4609] text-white' : 'bg-[#E3D4C1] text-[#594D42]'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: SUBSKRYPCJE (AUTOUZUPEŁNIANIE) */}
              {activeTab === 'subskrypcje' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF0E1] p-3.5 rounded-2xl border border-[#E3D1BA] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#594D42] leading-relaxed">
                      <strong className="text-[#1B4332] font-bold block mb-0.5">Zasady autouzupełniania spiżarni:</strong>
                      Stały rabat -10% na każdy słoik, świeża partia prosto z rozlewu, zero zobowiązań. W dowolnej chwili możesz zmienić cykl, zawiesić dostawy na urlop lub zrezygnować w 1 kliknięcie.
                    </div>
                  </div>

                  {user?.subscriptions && user.subscriptions.length > 0 ? (
                    <div className="space-y-3">
                      {user.subscriptions.map((sub) => {
                        const isPaused = sub.status === 'paused';
                        return (
                          <div 
                            key={sub.id} 
                            className={`p-4 rounded-2xl border transition-all ${
                              isPaused 
                                ? 'bg-[#F2ECE1] border-[#DFCDB7] opacity-80' 
                                : 'bg-white border-[#E0D3C1] shadow-2xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFE7DA]">
                              <div className="flex items-center gap-3">
                                <img
                                  src={sub.imageUrl}
                                  alt={sub.productName}
                                  className="w-12 h-12 rounded-xl object-cover border border-[#DECDB8] bg-[#FAF8F5]"
                                />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-serif font-bold text-sm text-[#23201C]">
                                      {sub.productName}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isPaused
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}>
                                      {isPaused ? 'Pauza (Wstrzymana)' : 'Aktywna (-10%)'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#7A6C5B] mt-0.5">
                                    Gramatura: <strong>{sub.weightLabel}</strong> • Cena w subskrypcji: <strong className="text-[#1B4332]">{sub.pricePln} zł</strong>
                                  </p>
                                </div>
                              </div>

                              <div className="text-left sm:text-right text-xs">
                                <span className="text-[#7A6C5B] block text-[11px]">Najbliższa wysyłka:</span>
                                <span className="font-bold text-[#1B4332] flex items-center gap-1 sm:justify-end">
                                  <Calendar className="w-3.5 h-3.5 text-[#D9821E]" />
                                  {isPaused ? 'Wstrzymana do wznowienia' : sub.nextShipmentDate}
                                </span>
                              </div>
                            </div>

                            {/* Sub Controls: Interval, Pause, Cancel */}
                            <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5">
                              {/* Change Interval */}
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-[#6D604E] font-medium text-[11px]">Częstotliwość:</span>
                                <div className="inline-flex rounded-lg border border-[#DFCBB5] bg-[#FAF5ED] p-0.5">
                                  {[30, 60, 90].map((days) => (
                                    <button
                                      key={days}
                                      onClick={() => updateSubscriptionInterval(sub.id, days as 30 | 60 | 90)}
                                      disabled={isPaused}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                        sub.intervalDays === days
                                          ? 'bg-[#1B4332] text-white shadow-2xs'
                                          : 'text-[#6D604E] hover:text-[#23201C] disabled:opacity-40'
                                      }`}
                                    >
                                      Co {days} dni
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => togglePauseSubscription(sub.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#DFCBB5] bg-white hover:bg-[#F3EAD9] text-xs font-semibold text-[#594D42] transition-colors cursor-pointer"
                                >
                                  {isPaused ? (
                                    <>
                                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Wznów dostawy</span>
                                    </>
                                  ) : (
                                    <>
                                      <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Wstrzymaj na 1 cykl</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => {
                                    if (window.confirm(`Czy na pewno chcesz anulować autouzupełnianie dla produktu ${sub.productName}? Zawsze możesz włączyć je ponownie przy kolejnym zakupie.`)) {
                                      cancelSubscription(sub.id);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors cursor-pointer"
                                  title="Anuluj subskrypcję"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  <span>Zrezygnuj</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DACB] space-y-2">
                      <p className="text-xs text-[#6D604E]">
                        Nie masz obecnie aktywnych autouzupełnień spiżarni.
                      </p>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Możesz włączyć dostawę cykliczną ze stałym 10% rabatem na karcie dowolnego miodu w sklepie.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADRES & PACZKOMAT */}
              {activeTab === 'adresy' && (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E0D3C1] space-y-3 shadow-2xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#7A6C5B] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C4609]" />
                      Dane do wysyłki (Automatyczne wypełnianie w kasie)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Imię:</label>
                        <input
                          type="text"
                          required
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Nazwisko:</label>
                        <input
                          type="text"
                          required
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Ulica i numer domu/lokalu:</label>
                        <input
                          type="text"
                          required
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Kod pocztowy:</label>
                        <input
                          type="text"
                          required
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Miejscowość:</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#594D42] mb-1">Telefon do kuriera / InPost:</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                        />
                      </div>
                    </div>

                    {/* Ulubiony Paczkomat */}
                    <div className="pt-2 border-t border-[#EFE7DA]">
                      <label className="block text-[11px] font-bold text-[#1B4332] mb-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                        Domyślny Paczkomat InPost (opcjonalnie):
                      </label>
                      <input
                        type="text"
                        placeholder="np. WRO05M • ul. Sienkiewicza 32, Wrocław"
                        value={addressForm.parcelLocker}
                        onChange={(e) => setAddressForm({ ...addressForm, parcelLocker: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] text-xs bg-[#FAF8F5]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-bold">
                      {saveSuccess && '✓ Pomyślnie zaktualizowano dane adresowe!'}
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      Zapisz dane adresowe
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: PŁATNOŚCI I KARTY */}
              {activeTab === 'platnosci' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0D3C1] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#7A6C5B] flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#8C4609]" />
                        Bezpiecznie podpięta karta płatnicza
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Szyfrowanie PCI-DSS
                      </span>
                    </div>

                    {user?.savedCard && !isEditingCard ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#24201C] to-[#3B342C] text-white flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#E5983A] tracking-wider block">
                            {user.savedCard.brand}
                          </span>
                          <span className="font-mono text-base tracking-widest block">
                            •••• •••• •••• {user.savedCard.last4}
                          </span>
                          <span className="text-[10px] text-white/70 block">
                            Ważność do: {user.savedCard.expiry}
                          </span>
                        </div>

                        <button
                          onClick={() => setIsEditingCard(true)}
                          className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          Zmień kartę
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleCardSubmit} className="p-4 bg-[#FAF5ED] rounded-xl border border-[#DFCBB5] space-y-3">
                        <span className="text-xs font-bold text-[#23201C] block">
                          Wprowadź dane nowej karty:
                        </span>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-[#594D42] mb-1">Typ karty:</label>
                            <select
                              value={newCardForm.brand}
                              onChange={(e) => setNewCardForm({ ...newCardForm, brand: e.target.value as 'Visa' | 'Mastercard' })}
                              className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white"
                            >
                              <option value="Visa">Visa</option>
                              <option value="Mastercard">Mastercard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#594D42] mb-1">Ostatnie 4 cyfry:</label>
                            <input
                              type="text"
                              maxLength={4}
                              value={newCardForm.last4}
                              onChange={(e) => setNewCardForm({ ...newCardForm, last4: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          {user?.savedCard && (
                            <button
                              type="button"
                              onClick={() => setIsEditingCard(false)}
                              className="px-3 py-1.5 text-xs text-[#6D604E] hover:underline"
                            >
                              Anuluj
                            </button>
                          )}
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-bold shadow-xs hover:bg-[#143326]"
                          >
                            Zapisz nową kartę
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7DDCE] text-[11px] text-[#594D42] space-y-1">
                      <strong className="text-[#1B4332] font-bold block flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                        Maksymalne bezpieczeństwo bankowe:
                      </strong>
                      <p className="leading-relaxed">
                        Twój pełny numer karty nie jest przechowywany na naszych serwerach. Płatności cykliczne są tokenizowane przez licencjonowane bramki płatności (Stripe / Przelewy24 / PayU) spełniające rygorystyczne normy bezpieczeństwa PCI-DSS Level 1.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: HISTORIA ZAMÓWIEŃ */}
              {activeTab === 'zamowienia' && (
                <div className="space-y-3">
                  {user?.orders && user.orders.length > 0 ? (
                    user.orders.map((ord) => (
                      <div key={ord.id} className="p-4 bg-white rounded-2xl border border-[#E0D3C1] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[#8C4609]">{ord.id}</span>
                            <span className="text-[#7A6C5B] ml-2">• {ord.date}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            ✓ {ord.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#23201C] font-semibold leading-relaxed">
                          {ord.itemsSummary}
                        </p>

                        <div className="pt-2 border-t border-[#EFE7DA] flex items-center justify-between text-xs">
                          <span className="text-[#7A6C5B]">
                            Wartość paczki: <strong className="text-[#1B4332] font-bold">{ord.totalPln} zł</strong>
                          </span>
                          {ord.trackingNumber && (
                            <span className="text-[11px] font-mono text-[#6D604E]">
                              InPost: {ord.trackingNumber.slice(0, 10)}...
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DACB]">
                      <p className="text-xs text-[#6D604E]">Brak historii zamówień na tym koncie.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
