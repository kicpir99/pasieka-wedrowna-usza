import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitContactMessage } from '../services/contactService';

interface ContactPageProps {
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
}

export const ContactPage: React.FC<ContactPageProps> = ({ displayResolution }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Zamówienie miodu / Pytanie ogólne',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    const result = await submitContactMessage(formData);
    setFeedbackMessage(result.message);
    setIsSending(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Header Banner */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 max-w-3xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Skontaktuj się z Pszczelarzami</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight">
            Kontakt z Pasieką Usza
          </h1>
          <p className="text-sm sm:text-base text-[#C7BDB0] leading-relaxed">
            Masz pytania o dostępność miodów, pierzgi, odkładów pszczelich lub chcesz odebrać zamówienie osobiście? Chętnie odpowiemy i doradzimy.
          </p>
        </div>
      </section>

      {/* Main Grid: Details + Contact Form */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 -mt-8 relative z-20`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left info cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DCCE] shadow-md space-y-6">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#945209] font-bold block mb-1">
                  Pasieka Wędrowna „Usza”
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#23201C]">
                  Magdalena i Piotr Szymkowicz
                </h2>
                <p className="text-xs text-[#6B5E4F] mt-1">
                  Gospodarstwo pasieczne z Dolnego Śląska
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#4A3F33] pt-2 border-t border-[#EFE5D8]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] text-[#8B5337] flex items-center justify-center shrink-0 border border-[#E8DECFA0]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-[#23201C]">Adres pasieki:</span>
                    <span>ul. Łąkowa 3</span><br />
                    <span>55-300 Ciechów (woj. dolnośląskie)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] text-[#8B5337] flex items-center justify-center shrink-0 border border-[#E8DECFA0]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-[#23201C]">Telefon:</span>
                    <a href="tel:697512103" className="text-[#8B5337] hover:underline font-bold">
                      +48 697 512 103
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] text-[#8B5337] flex items-center justify-center shrink-0 border border-[#E8DECFA0]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-[#23201C]">Adres e-mail:</span>
                    <a href="mailto:kontakt@pasiekausza.pl" className="hover:underline">
                      kontakt@pasiekausza.pl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF4EA] text-[#8B5337] flex items-center justify-center shrink-0 border border-[#E8DECFA0]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-[#23201C]">Odbiór osobisty:</span>
                    <span className="text-xs text-[#6B5E4F] block">
                      Możliwy odbiór miodu bezpośrednio w pasiece po wcześniejszym kontakcie telefonicznym.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EFE5D8] flex items-center gap-2 text-xs text-[#52B788] font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Nadzór Powiatowego Lekarza Weterynarii</span>
              </div>
            </div>

            {/* Quick info box */}
            <div className="bg-[#FAF6EE] rounded-2xl p-6 border border-[#DFCBB5] space-y-2 text-xs text-[#5C5042]">
              <h4 className="font-serif text-sm font-bold text-[#23201C]">
                🐝 Dlaczego warto zadzwonić przed przyjazdem?
              </h4>
              <p>
                Nasza pasieka ma charakter wędrowny – często w ciągu dnia pracujemy bezpośrednio przy ulach na odległych pożytkach leśnych i łąkowych. Krótki telefon upewni Cię, że będziemy na miejscu w Ciechowie!
              </p>
            </div>
          </div>

          {/* Right form card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E7DCCE] shadow-md">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#23201C]">
                  Wiadomość została wysłana!
                </h3>
                <p className="text-xs sm:text-sm text-[#615444] max-w-md mx-auto">
                  {feedbackMessage || 'Otrzymaliśmy Twoje zapytanie. Odpowiemy najszybciej jak to możliwe po zakończeniu prac w pasiece.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#2D2821] text-[#FAF5ED] text-xs font-bold hover:bg-[#433B31] transition-colors cursor-pointer"
                >
                  Wyślij kolejną wiadomość
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#23201C] tracking-tight">
                    Napisz do nas
                  </h3>
                  <p className="text-xs text-[#6E6153] mt-1">
                    Wypełnij krótki formularz, a skontaktujemy się z Tobą.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#443A2F]">
                      Imię i nazwisko *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="np. Jan Kowalski"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5] text-xs focus:ring-2 focus:ring-[#8B5337] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#443A2F]">
                      Numer telefonu *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="np. +48 600 000 000"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5] text-xs focus:ring-2 focus:ring-[#8B5337] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#443A2F]">
                    Adres e-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="twoj@email.pl"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5] text-xs focus:ring-2 focus:ring-[#8B5337] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#443A2F]">
                    Temat wiadomości
                  </label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5] text-xs focus:ring-2 focus:ring-[#8B5337] focus:outline-none"
                  >
                    <option value="Zamówienie miodu">Zamówienie miodu / Pytanie o gramatury</option>
                    <option value="Pierzga lub propolis">Pierzga, propolis lub pyłek pszczeli</option>
                    <option value="Odkłady pszczele">Rezerwacja odkładów pszczelich</option>
                    <option value="Szkolenia pszczelarskie">Pakiety szkoleniowe</option>
                    <option value="Inne">Inne zapytanie</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#443A2F]">
                    Wiadomość *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Napisz, w czym możemy Ci pomóc..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DFCBB5] text-xs focus:ring-2 focus:ring-[#8B5337] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Wysyłanie wiadomości...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Wyślij zapytanie do pasieki</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
