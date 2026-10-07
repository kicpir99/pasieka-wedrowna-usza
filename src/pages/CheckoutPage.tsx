import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import {
  ShoppingBag,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Search,
  Sparkles,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { createWooCommerceOrder } from '../services/wooCommerceService';

import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  items: CartItem[];
  onClearCart: () => void;
  displayResolution?: { width: number; height: number; deviceType: string; containerClass: string };
}

// Przykładowa lista popularnych paczkomatów na start dla ułatwienia wyboru
const POPULAR_LOCKERS = [
  { code: 'WRO01A', address: 'ul. Legnicka 58, 54-204 Wrocław', city: 'Wrocław' },
  { code: 'TRZ01M', address: 'ul. Wrocławska 14, 55-100 Trzebnica', city: 'Trzebnica' },
  { code: 'MIL02A', address: 'ul. Krotoszyńska 2, 56-300 Milicz', city: 'Milicz' },
  { code: 'WAW22B', address: 'ul. Marszałkowska 104, 00-017 Warszawa', city: 'Warszawa' },
  { code: 'KRA14M', address: 'ul. Floriańska 25, 31-019 Kraków', city: 'Kraków' },
  { code: 'POZ08A', address: 'ul. Półwiejska 32, 61-888 Poznań', city: 'Poznań' },
  { code: 'GDA04A', address: 'ul. Grunwaldzka 82, 80-244 Gdańsk', city: 'Gdańsk' },
  { code: 'KAT03B', address: 'ul. Chorzowska 107, 40-101 Katowice', city: 'Katowice' },
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, onClearCart }) => {
  const navigate = useNavigate();
  const { user, register, addOrder } = useAuth();
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  // Stan formularza z automatycznym uzupełnieniem z profilu użytkownika
  const [firstName, setFirstName] = useState(() => user?.address?.firstName || user?.name || '');
  const [lastName, setLastName] = useState(() => user?.address?.lastName || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [phone, setPhone] = useState(() => user?.address?.phone || '');

  // Faktura na firmę
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');

  // Metoda dostawy
  const [deliveryMethod, setDeliveryMethod] = useState<'paczkomat' | 'kurier' | 'odbior'>('paczkomat');
  const [street, setStreet] = useState(() => user?.address?.street || '');
  const [postcode, setPostcode] = useState(() => user?.address?.postalCode || '');
  const [city, setCity] = useState(() => user?.address?.city || '');

  // Paczkomat
  const [lockerSearch, setLockerSearch] = useState('');
  const [selectedLocker, setSelectedLocker] = useState<{ code: string; address: string; city: string } | null>(() => {
    if (user?.address?.parcelLocker) {
      return {
        code: user.address.parcelLocker,
        address: 'Zapisany Paczkomat z profilu',
        city: user.address.city || 'Polska',
      };
    }
    return POPULAR_LOCKERS[0];
  });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Metoda płatności
  const [paymentMethod, setPaymentMethod] = useState<'blik' | 'p24' | 'cod' | 'bacs'>('blik');

  // Uwagi
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status składania zamówienia
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ id: number; total: number } | null>(null);

  // Kalkulacja kosztów
  const FREE_SHIPPING_THRESHOLD = 180;
  const subtotal = items.reduce((sum, item) => sum + item.pricePln * item.quantity, 0);

  const deliveryCost = useMemo(() => {
    if (deliveryMethod === 'odbior') return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return deliveryMethod === 'paczkomat' ? 15 : 18;
  }, [deliveryMethod, subtotal]);

  const total = subtotal + deliveryCost;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Filtrowane paczkomaty
  const filteredLockers = useMemo(() => {
    if (!lockerSearch.trim()) return POPULAR_LOCKERS;
    const q = lockerSearch.toLowerCase().trim();
    return POPULAR_LOCKERS.filter(
      l => l.code.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)
    );
  }, [lockerSearch]);

  // Obsługa wysłania zamówienia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!agreeTerms) {
      setSubmitError('Prosimy o zaakceptowanie regulaminu sklepu.');
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setSubmitError('Prosimy o uzupełnienie podstawowych danych kontaktowych.');
      return;
    }

    if (deliveryMethod === 'kurier' && (!street.trim() || !postcode.trim() || !city.trim())) {
      setSubmitError('Prosimy o podanie pełnego adresu dla dostawy kurierem.');
      return;
    }

    if (deliveryMethod === 'paczkomat' && !selectedLocker) {
      setSubmitError('Prosimy o wybranie paczkomatu docelowego.');
      return;
    }

    if (!user && createAccount && (!accountPassword || accountPassword.trim().length < 6)) {
      setSubmitError('Aby założyć konto w pasiece, podaj hasło o długości minimum 6 znaków.');
      return;
    }

    setIsSubmitting(true);

    const deliveryTitle =
      deliveryMethod === 'paczkomat'
        ? `InPost Paczkomat 24/7 (${selectedLocker?.code})`
        : deliveryMethod === 'kurier'
        ? 'Kurier InPost'
        : 'Odbiór osobisty w pasiece';

    const paymentTitle =
      paymentMethod === 'blik'
        ? 'BLIK (Szybka płatność)'
        : paymentMethod === 'p24'
        ? 'Szybki przelew online / Karta (Przelewy24)'
        : paymentMethod === 'cod'
        ? 'Płatność przy odbiorze (Za pobraniem)'
        : 'Tradycyjny przelew bankowy';

    const res = await createWooCommerceOrder({
      items,
      customer: {
        firstName,
        lastName,
        email,
        phone,
        street,
        city,
        postcode,
        isCompany,
        companyName,
        nip,
        notes,
      },
      delivery: {
        method: deliveryMethod,
        methodTitle: deliveryTitle,
        cost: deliveryCost,
        parcelLockerCode: selectedLocker?.code,
        parcelLockerAddress: selectedLocker ? `${selectedLocker.address}, ${selectedLocker.city}` : undefined,
      },
      paymentMethod,
      paymentTitle,
    });

    setIsSubmitting(false);

    if (!res.success || !res.orderId) {
      setSubmitError(res.error || 'Nie udało się złożyć zamówienia. Spróbuj ponownie lub skontaktuj się z nami.');
      return;
    }

    const newPastOrder = {
      id: String(res.orderId),
      date: new Date().toLocaleDateString('pl-PL'),
      itemsSummary: items.map(i => `${i.product.name} (${i.weightGrams || i.selectedWeightGrams || 400}g x${i.quantity})`).join(', '),
      totalPln: total,
      status: 'Przygotowywana' as const,
    };

    if (user) {
      addOrder(newPastOrder);
    } else if (createAccount) {
      register({
        firstName,
        lastName,
        email,
        password: accountPassword || undefined,
        phone,
        street: deliveryMethod === 'kurier' ? street : '',
        city: deliveryMethod === 'kurier' ? city : '',
        postalCode: deliveryMethod === 'kurier' ? postcode : '',
        parcelLocker: deliveryMethod === 'paczkomat' ? selectedLocker?.code : '',
      });
      setTimeout(() => {
        addOrder(newPastOrder);
      }, 50);
    }

    // 1. Najpierw ustawiamy stan sukcesu w React, aby ekran z podziękowaniem pojawił się natychmiast
    setCompletedOrder({ id: res.orderId, total, paymentUrl: res.paymentUrl });

    // 2. Czyścimy koszyk po ustawieniu ekranu sukcesu, bez mignięcia pustym koszykiem
    onClearCart();
  };

  // EKRAN SUKCESU ZAMÓWIENIA (Zawsze sprawdzany w pierwszej kolejności!)
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E7DDCE] shadow-xl p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#E5F2E1] text-[#2D6A23] flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#945209] font-bold">Zamówienie przyjęte</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#23201C]">
              Dziękujemy za zamówienie!
            </h1>
            <p className="text-sm text-[#6C5E4E]">
              Numer Twojego zamówienia w pasiece: <strong className="text-[#23201C] font-mono font-bold text-base">#{completedOrder.id}</strong>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF6EF] border border-[#EAE0D1] text-left space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5DACB]">
              <span className="text-[#736553]">Kwota łączna:</span>
              <strong className="font-serif text-lg text-[#8C4609]">{completedOrder.total} zł</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E5DACB]">
              <span className="text-[#736553]">Dostawa:</span>
              <span className="font-medium text-[#23201C]">
                {deliveryMethod === 'paczkomat'
                  ? `Paczkomat ${selectedLocker?.code}`
                  : deliveryMethod === 'kurier'
                  ? 'Kurier InPost'
                  : 'Odbiór w pasiece'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#736553]">Status:</span>
              <span className="inline-flex items-center gap-1 text-[#2D6A23] font-bold text-xs bg-[#E5F2E1] px-2.5 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" /> Przyjęte do pakowania
              </span>
            </div>
          </div>

          {paymentMethod === 'blik' && (
            <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[#DFCAB0] text-xs text-[#5C4D3B] text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8C4609]">
                <Smartphone className="w-4 h-4 text-[#8C4609]" />
                <span>Płatność BLIK</span>
              </div>
              <p>Twoje zamówienie zostało pomyślnie zarejestrowane. Miody są pakowane w pracowni, a status przesyłki możesz śledzić w panelu Moje Konto.</p>
            </div>
          )}

          {paymentMethod === 'p24' && (
            <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[#DFCAB0] text-xs text-[#5C4D3B] text-left space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8C4609]">
                <CreditCard className="w-4 h-4 text-[#8C4609]" />
                <span>Szybki przelew Przelewy24</span>
              </div>
              <p>Zamówienie zostało zarejestrowane w systemie pasieki. Szczegóły wysłaliśmy na Twój e-mail.</p>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="p-4 rounded-xl bg-[#F4F9F2] border border-[#CDE1CA] text-xs text-[#2A5222] text-left space-y-1">
              <p className="font-bold text-[#1F4218]">Płatność przy odbiorze (Za pobraniem):</p>
              <p>Należność ({completedOrder.total} zł) uregulujesz wygodnie u kuriera lub przy odbiorze w automacie Paczkomat.</p>
            </div>
          )}

          {paymentMethod === 'bacs' && (
            <div className="p-4 rounded-xl bg-[#FFF9F2] border border-[#DFCBB5] text-xs text-[#5C4D3B] text-left space-y-1">
              <p className="font-bold text-[#2D2821]">Dane do tradycyjnego przelewu bankowego:</p>
              <p>Odbiorca: <strong>Pasieka Wędrowna Usza</strong></p>
              <p>Nr konta: <strong className="font-mono">12 1090 2398 0000 0001 4820 9123</strong></p>
              <p>Tytuł przelewu: <strong>Zamówienie #{completedOrder.id}</strong></p>
            </div>
          )}

          <p className="text-xs text-[#7A6C5B] leading-relaxed">
            Potwierdzenie wraz ze szczegółami wysłaliśmy na adres: <strong>{email}</strong>.<br />
            Miody pakujemy w bezpieczne ekotuby i nadajemy w ciągu 24–48h.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            {(user || createAccount) && (
              <button
                onClick={() => navigate('/moje-konto')}
                className="px-6 py-3 rounded-xl bg-[#945209] hover:bg-[#784107] text-[#FAF5ED] font-semibold text-xs transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Śledź status w panelu Moje Konto</span>
              </button>
            )}
            <button
              onClick={() => navigate('/sklep')}
              className="px-6 py-3 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              Wróć do sklepu
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-[#D5C6B1] bg-white text-[#524534] font-semibold text-xs hover:bg-[#FAF6F0] transition-all cursor-pointer"
            >
              Strona główna pasieki
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PUSTY KOSZYK
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl border border-[#E7DDCE] p-10 space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F6EDE0] text-[#945209] flex items-center justify-center mx-auto text-3xl">
            🍯
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#23201C]">Twój koszyk jest pusty</h2>
          <p className="text-xs text-[#706250] leading-relaxed">
            Nie masz jeszcze wybranych miodów do zamówienia. Przejdź do naszego katalogu zbiorów i wybierz swój ulubiony nektar.
          </p>
          <button
            onClick={() => navigate('/sklep')}
            className="px-6 py-3 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] font-semibold text-xs transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>Przejdź do sklepu</span>
            <Sparkles className="w-4 h-4 text-[#E5983A]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-24 sm:pt-28 pb-24 text-[#2D2821]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Górny pasek nawigacji i zaufania */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E7DDCE]">
          <div className="flex items-center gap-3">
            <Link
              to="/sklep"
              className="p-2 rounded-xl bg-white border border-[#E0D3C1] text-[#695D4E] hover:text-[#945209] hover:border-[#945209] transition-all"
              title="Wróć do sklepu"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[11px] font-bold text-[#945209] uppercase tracking-wider block">
                Kasa Pasieczna • Krok 2 z 2
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#23201C]">
                Finalizacja Zamówienia
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#DFCEB7] shadow-2xs text-xs font-semibold text-[#2D6A23]">
            <Lock className="w-3.5 h-3.5 text-[#2D6A23]" />
            <span>Bezpieczne szyfrowanie SSL 256-bit</span>
          </div>
        </div>

        {/* Błąd walidacji */}
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FDF2F2] border border-[#F5C2C2] text-[#9E2A2B] text-xs flex items-center gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#C92A2A]" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEWA KOLUMNA: DANE, DOSTAWA, PŁATNOŚĆ (7 kolumn) */}
          <div className="lg:col-span-7 space-y-6">

            {/* SEKCJA 1: DANE OSOBOWE */}
            <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFE5D6]">
                <div className="w-7 h-7 rounded-full bg-[#F4E9D8] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-serif text-lg font-bold text-[#23201C]">
                  Dane zamawiającego
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B4F3F] mb-1.5">
                    Imię *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="np. Anna"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] focus:bg-white focus:border-[#945209] focus:ring-2 focus:ring-[#945209]/10 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4F3F] mb-1.5">
                    Nazwisko *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="np. Kowalska"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] focus:bg-white focus:border-[#945209] focus:ring-2 focus:ring-[#945209]/10 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B4F3F] mb-1.5">
                    Adres e-mail * (potwierdzenie zamówienia)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] focus:bg-white focus:border-[#945209] focus:ring-2 focus:ring-[#945209]/10 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4F3F] mb-1.5">
                    Numer telefonu * (kod SMS do paczki)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="np. 500 123 456"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] focus:bg-white focus:border-[#945209] focus:ring-2 focus:ring-[#945209]/10 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Checkbox Faktura VAT */}
              <div className="pt-2 border-t border-[#F2E8DA]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#665846]">
                  <input
                    type="checkbox"
                    checked={isCompany}
                    onChange={e => setIsCompany(e.target.checked)}
                    className="w-4 h-4 rounded text-[#945209] border-[#DCCEB9] focus:ring-[#945209]"
                  />
                  <span>Chcę fakturę VAT na firmę</span>
                </label>

                {isCompany && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dashed border-[#E5DACB]">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5B4F3F] mb-1">
                        Nazwa firmy *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="Firma Sp. z o.o."
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DCCEB9] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5B4F3F] mb-1">
                        NIP *
                      </label>
                      <input
                        type="text"
                        value={nip}
                        onChange={e => setNip(e.target.value)}
                        placeholder="np. 1234567890"
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#DCCEB9] text-xs outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Checkbox Załóż konto (dla niezalogowanych) */}
              {!user && (
                <div className="pt-3 border-t border-[#F2E8DA]">
                  <div className="p-3.5 rounded-2xl bg-[#FAF5EB] border border-[#EAE0D1] space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={e => setCreateAccount(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#945209] border-[#DCCEB9] focus:ring-[#945209]"
                      />
                      <div className="text-xs">
                        <strong className="text-[#2D2821] block">
                          Chcę założyć konto w Pasiece Usza
                        </strong>
                        <span className="text-[11px] text-[#7A6C5B] block mt-0.5">
                          Umożliwi Ci to śledzenie statusu przesyłki, podgląd historii zamówień i zapisanie adresu na przyszłe zakupy.
                        </span>
                      </div>
                    </label>

                    {createAccount && (
                      <div className="pt-2 border-t border-[#E8DCB8] pl-6.5 space-y-1.5 animate-in fade-in duration-200">
                        <label className="block text-[11px] font-semibold text-[#5B4F3F]">
                          Utwórz hasło do Twojego konta * (min. 6 znaków)
                        </label>
                        <input
                          type="password"
                          required={createAccount}
                          value={accountPassword}
                          onChange={e => setAccountPassword(e.target.value)}
                          placeholder="Wpisz bezpieczne hasło..."
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209] focus:ring-1 focus:ring-[#945209]/20"
                        />
                        <span className="text-[10px] text-[#8A7C6B] block">
                          Hasło pozwoli Ci zalogować się w każdej chwili, aby sprawdzić status zamówienia w panelu Moje Konto.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SEKCJA 2: METODA DOSTAWY */}
            <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFE5D6]">
                <div className="w-7 h-7 rounded-full bg-[#F4E9D8] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-serif text-lg font-bold text-[#23201C]">
                  Sposób dostawy
                </h2>
              </div>

              {/* 3 kafelki wyboru */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('paczkomat')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    deliveryMethod === 'paczkomat'
                      ? 'border-[#945209] bg-[#FAF3E8] shadow-xs ring-1 ring-[#945209]/20'
                      : 'border-[#E0D3C1] bg-[#FAF8F5] hover:border-[#CDBDA7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-[#945209]" />
                    <span className="font-serif font-bold text-xs text-[#8C4609]">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : '15 zł'}
                    </span>
                  </div>
                  <strong className="block text-xs font-bold text-[#23201C]">Paczkomat InPost</strong>
                  <span className="text-[10px] text-[#786A58] block mt-0.5">Odbiór 24/7 z automatu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('kurier')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    deliveryMethod === 'kurier'
                      ? 'border-[#945209] bg-[#FAF3E8] shadow-xs ring-1 ring-[#945209]/20'
                      : 'border-[#E0D3C1] bg-[#FAF8F5] hover:border-[#CDBDA7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-5 h-5 text-[#2A6546]" />
                    <span className="font-serif font-bold text-xs text-[#2A6546]">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis' : '18 zł'}
                    </span>
                  </div>
                  <strong className="block text-xs font-bold text-[#23201C]">Kurier InPost</strong>
                  <span className="text-[10px] text-[#786A58] block mt-0.5">Bezpośrednio pod drzwi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('odbior')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    deliveryMethod === 'odbior'
                      ? 'border-[#945209] bg-[#FAF3E8] shadow-xs ring-1 ring-[#945209]/20'
                      : 'border-[#E0D3C1] bg-[#FAF8F5] hover:border-[#CDBDA7]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="w-5 h-5 text-[#635340]" />
                    <span className="font-serif font-bold text-xs text-[#635340]">0 zł</span>
                  </div>
                  <strong className="block text-xs font-bold text-[#23201C]">Odbiór w pasiece</strong>
                  <span className="text-[10px] text-[#786A58] block mt-0.5">Dolny Śląsk (po kontakcie)</span>
                </button>
              </div>

              {/* Szczegóły dla PACZKOMATU */}
              {deliveryMethod === 'paczkomat' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6EE] border border-[#E3D4C0] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#3B3226]">Wybierz Twój Paczkomat InPost:</span>
                    <div className="flex items-center gap-2">
                      {selectedLocker && (
                        <span className="text-[11px] font-bold text-[#945209] bg-[#FAF0DC] px-2.5 py-0.5 rounded-lg border border-[#DFC9AE]">
                          Wybrany: {lockerSearch.trim() && !filteredLockers.find(l => l.code === selectedLocker.code) ? selectedLocker.code : selectedLocker.code}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsMapModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] text-[11px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#E5983A]" />
                        <span>Wybierz na mapie</span>
                      </button>
                    </div>
                  </div>

                  {/* Wyszukiwarka paczkomatu */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8C7B68] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lockerSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setLockerSearch(val);
                        // Jeśli wpisano kod paczkomatu (np. 6 znaków z dużej litery), automatycznie go przypisz
                        if (val.trim().length >= 5 && /^[A-Z0-9]+$/i.test(val.trim())) {
                          const codeUpper = val.trim().toUpperCase();
                          setSelectedLocker({
                            code: codeUpper,
                            address: 'Wpisany paczkomat',
                            city: 'Polska'
                          });
                        }
                      }}
                      placeholder="Wpisz kod paczkomatu (np. WRO01A) lub miasto/ulicę..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209] focus:ring-1 focus:ring-[#945209]/20"
                    />
                  </div>

                  {/* Lista paczkomatów z luksusowym suwakiem i bezpiecznym marginesem pr-3.5 */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-3.5 pasieka-scrollbar">
                    {filteredLockers.map(locker => (
                      <div
                        key={locker.code}
                        onClick={() => setSelectedLocker(locker)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          selectedLocker?.code === locker.code
                            ? 'bg-white border-[#945209] font-semibold text-[#2D2821] shadow-2xs ring-1 ring-[#945209]/15'
                            : 'bg-white/80 border-[#E5DACB] text-[#695D4E] hover:bg-white hover:border-[#D0C0AB]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#8C4609] text-xs">{locker.code}</span>
                            <span className="text-[11px] text-[#736553] font-medium">• {locker.city}</span>
                          </div>
                          <span className="text-[11px] text-[#857461] block truncate">{locker.address}</span>
                        </div>
                        {selectedLocker?.code === locker.code ? (
                          <div className="w-5 h-5 rounded-full bg-[#945209] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#9E8E7C] font-semibold shrink-0 hover:text-[#945209]">
                            Wybierz
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Szczegóły dla KURIERA */}
              {deliveryMethod === 'kurier' && (
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E3D4C0] space-y-3">
                  <span className="text-xs font-bold text-[#3B3226] block">Adres doręczenia kurierem:</span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#5B4F3F] mb-1">
                        Ulica i numer domu / lokalu *
                      </label>
                      <input
                        type="text"
                        required={deliveryMethod === 'kurier'}
                        value={street}
                        onChange={e => setStreet(e.target.value)}
                        placeholder="np. Słoneczna 15/4"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B4F3F] mb-1">
                          Kod pocztowy *
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod === 'kurier'}
                          value={postcode}
                          onChange={e => setPostcode(e.target.value)}
                          placeholder="np. 50-001"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5B4F3F] mb-1">
                          Miejscowość *
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod === 'kurier'}
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          placeholder="np. Wrocław"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCCEB9] text-xs outline-none focus:border-[#945209]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Szczegóły dla ODBIORU OSOBISTEGO */}
              {deliveryMethod === 'odbior' && (
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E3D4C0] text-xs text-[#5C4D3B] space-y-1">
                  <p className="font-bold text-[#2D2821]">Odbiór osobisty w pracowni pasieki:</p>
                  <p>Pasieka Wędrowna Usza • Dolny Śląsk (rejon Wzgórz Trzebnickich / Doliny Baryczy)</p>
                  <p className="text-[11px] text-[#7E6F5D]">
                    Po złożeniu zamówienia skontaktujemy się telefonicznie, aby potwierdzić dogodny termin i godzinę odbioru.
                  </p>
                </div>
              )}
            </div>

            {/* SEKCJA 3: FORMA PŁATNOŚCI */}
            <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#EFE5D6]">
                <div className="w-7 h-7 rounded-full bg-[#F4E9D8] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="font-serif text-lg font-bold text-[#23201C]">
                  Metoda płatności
                </h2>
              </div>

              <div className="space-y-2.5">
                {/* BLIK */}
                <div
                  onClick={() => setPaymentMethod('blik')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'blik'
                      ? 'bg-[#FAF3E8] border-[#945209] ring-1 ring-[#945209]/20 shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E0D3C1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2D2821] text-[#E5983A] flex items-center justify-center font-bold text-xs">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-[#23201C]">BLIK</strong>
                        <span className="text-[10px] font-bold text-[#8C4609] bg-[#F7E7CE] px-2 py-0.5 rounded-full">
                          Polecane • Szybka płatność
                        </span>
                      </div>
                      <span className="text-[11px] text-[#736553] block">Wpisz kod BLIK w telefonie i zatwierdź</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'blik' ? 'border-[#945209] bg-[#945209]' : 'border-[#CBB9A2]'}`}>
                    {paymentMethod === 'blik' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* PRZELEWY24 ONLINE */}
                <div
                  onClick={() => setPaymentMethod('p24')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'p24'
                      ? 'bg-[#FAF3E8] border-[#945209] ring-1 ring-[#945209]/20 shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E0D3C1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFE3CF] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs text-[#23201C] block">Szybki przelew online / Karta (Przelewy24)</strong>
                      <span className="text-[11px] text-[#736553] block">mBank, PKO, Santander, ING, Apple Pay, Google Pay</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'p24' ? 'border-[#945209] bg-[#945209]' : 'border-[#CBB9A2]'}`}>
                    {paymentMethod === 'p24' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* ZA POBRANIEM */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-[#FAF3E8] border-[#945209] ring-1 ring-[#945209]/20 shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E0D3C1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFE3CF] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs text-[#23201C] block">Płatność przy odbiorze (Za pobraniem)</strong>
                      <span className="text-[11px] text-[#736553] block">Zapłać kurierowi lub w paczkomacie przy odbiorze</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#945209] bg-[#945209]' : 'border-[#CBB9A2]'}`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* PRZELEW TRADYCYJNY */}
                <div
                  onClick={() => setPaymentMethod('bacs')}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'bacs'
                      ? 'bg-[#FAF3E8] border-[#945209] ring-1 ring-[#945209]/20 shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E0D3C1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EFE3CF] text-[#8C4609] flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs text-[#23201C] block">Tradycyjny przelew bankowy</strong>
                      <span className="text-[11px] text-[#736553] block">Wpłata na konto pasieki po złożeniu zamówienia</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'bacs' ? 'border-[#945209] bg-[#945209]' : 'border-[#CBB9A2]'}`}>
                    {paymentMethod === 'bacs' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>

            {/* SEKCJA 4: UWAGI DO ZAMÓWIENIA */}
            <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 shadow-sm space-y-3">
              <label className="block text-xs font-semibold text-[#5B4F3F]">
                Uwagi do zamówienia (opcjonalnie)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Np. zapakować na prezent, instrukcje dla kuriera..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] text-xs outline-none focus:bg-white focus:border-[#945209] transition-all"
              />
            </div>
          </div>

          {/* PRAWA KOLUMNA: PODSUMOWANIE KOSZYKA (5 kolumn, sticky) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl border border-[#E7DDCE] p-6 sm:p-7 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE5D6]">
                <h3 className="font-serif text-lg font-bold text-[#23201C]">
                  Twoje zamówienie ({items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <Link to="/sklep" className="text-xs font-semibold text-[#945209] hover:underline">
                  Zmień koszyk
                </Link>
              </div>

              {/* Lista produktów */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.weightGrams || item.selectedWeightGrams}`} className="flex items-center gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#FAF4EA] border border-[#EADBCA] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#23201C] truncate">{item.product.name}</p>
                      <span className="text-[11px] text-[#7A6C5B]">
                        {item.weightGrams || item.selectedWeightGrams || 400}g • {item.quantity} szt.
                      </span>
                    </div>
                    <span className="font-serif font-bold text-xs text-[#8C4609] shrink-0">
                      {item.pricePln * item.quantity} zł
                    </span>
                  </div>
                ))}
              </div>

              {/* Darmowa dostawa pasek */}
              {remainingForFreeShipping > 0 && (
                <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[#EAE0D1] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#685947] text-[11px]">
                    <span>Darmowa dostawa od 180 zł:</span>
                    <strong className="text-[#8C4609]">Brakuje {remainingForFreeShipping} zł</strong>
                  </div>
                  <div className="w-full bg-[#E5D8C3] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#945209] h-full rounded-full" style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Zestawienie kosztów */}
              <div className="space-y-2 pt-3 border-t border-[#EFE5D6] text-xs">
                <div className="flex justify-between text-[#685A48]">
                  <span>Wartość miodów:</span>
                  <span className="font-semibold">{subtotal} zł</span>
                </div>
                <div className="flex justify-between text-[#685A48]">
                  <span>Dostawa:</span>
                  <span className="font-semibold">
                    {deliveryCost === 0 ? <strong className="text-[#2D6A23]">Bezpłatnie</strong> : `${deliveryCost} zł`}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#EAE0D1]">
                  <span className="font-bold text-sm text-[#23201C]">Łącznie do zapłaty:</span>
                  <span className="font-serif text-2xl font-bold text-[#8C4609]">{total} zł</span>
                </div>
              </div>

              {/* Zgoda na regulamin */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#695D4E]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#945209] border-[#DCCEB9] focus:ring-[#945209]"
                  />
                  <span>
                    Akceptuję regulamin sklepu oraz politykę prywatności Pasieki Usza.
                  </span>
                </label>
              </div>

              {/* Przycisk Zamów */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FAF5ED] border-t-transparent rounded-full animate-spin" />
                    <span>Przetwarzanie zamówienia...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#E5983A]" />
                    <span>Zamawiam i płacę ({total} zł)</span>
                  </>
                )}
              </button>

              {/* Pasek gwarancji pasieki */}
              <div className="pt-3 border-t border-[#EFE5D6] space-y-2 text-[11px] text-[#635544]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A23] shrink-0" />
                  <span>100% Gwarancja szkła – w razie stłuczki wysyłamy nowy słoik w 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#945209] shrink-0" />
                  <span>Wysyłka w 24–48h bezpośrednio z naszej dolnośląskiej pracowni</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal interaktywnej mapy Paczkomatów */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#E7DDCE] shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-[#E7DDCE] flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF0DC] text-[#8C4609] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#8C4609]" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#23201C]">
                    Wybierz Paczkomat InPost 24/7
                  </h3>
                  <span className="text-[11px] text-[#7A6C5B] block">Kliknij automat na liście poniżej, aby wybrać</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="p-1.5 rounded-full text-[#6E6150] hover:bg-[#EFE5D6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto pasieka-scrollbar">
              {/* Wyszukiwarka wewnątrz modalu */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C7B68] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lockerSearch}
                  onChange={e => setLockerSearch(e.target.value)}
                  placeholder="Filtruj automaty: wpisz miasto, ulicę lub kod (np. WRO, Trzebnica, Legnicka)..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DCCEB9] text-xs outline-none focus:bg-white focus:border-[#945209] focus:ring-1 focus:ring-[#945209]/20"
                />
              </div>

              {/* Szybkie filtry miast */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-[#8C7B68] uppercase tracking-wider mr-1">Miasta:</span>
                {['Wrocław', 'Trzebnica', 'Milicz', 'Warszawa', 'Kraków', 'Poznań', 'Gdańsk', 'Katowice'].map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLockerSearch(city)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      lockerSearch.toLowerCase() === city.toLowerCase()
                        ? 'bg-[#945209] text-white border-[#945209]'
                        : 'bg-[#FAF6EF] text-[#635342] border-[#E8DEC8] hover:bg-[#F2E5D4]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
                {lockerSearch && (
                  <button
                    type="button"
                    onClick={() => setLockerSearch('')}
                    className="text-[10px] text-[#A63A26] hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Wyczyść filtr
                  </button>
                )}
              </div>

              {/* Wyniki paczkomatów */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredLockers.map(l => (
                    <div
                      key={l.code}
                      onClick={() => {
                        setSelectedLocker(l);
                        setLockerSearch(l.code);
                        setIsMapModalOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 shadow-2xs group ${
                        selectedLocker?.code === l.code
                          ? 'border-[#945209] bg-[#FAF3E8] ring-1 ring-[#945209]/20'
                          : 'border-[#E5DACB] hover:border-[#945209] hover:bg-[#FAF6EF] bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-xs text-[#8C4609] group-hover:text-[#703A07]">{l.code}</span>
                        <span className="text-[10px] bg-[#EFE3CF] text-[#733F07] px-2 py-0.5 rounded-md font-bold">
                          {l.city}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#554737] block font-medium leading-tight">{l.address}</span>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-[#8C7B68]">
                        <span>Dostępny 24/7</span>
                        <span className="text-[#945209] font-bold group-hover:underline">Wybierz ten automat →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#E7DDCE] flex justify-between items-center">
              <span className="text-xs text-[#706250]">
                Wybrany: <strong className="font-mono text-[#8C4609]">{selectedLocker?.code}</strong> ({selectedLocker?.city})
              </span>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-[#2D2821] hover:bg-[#433B31] text-[#FAF5ED] text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Zatwierdź wybór
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
