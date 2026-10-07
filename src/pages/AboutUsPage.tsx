import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HoneyCraftingJourney } from '../components/HoneyCraftingJourney';
import { ShieldCheck, Heart, Sparkles, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchWordPressPage, PageContent } from '../services/pageService';

interface AboutUsPageProps {
  displayResolution: { width: number; height: number; deviceType: string; containerClass: string };
  scrollToProducts?: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ displayResolution }) => {
  const [wpPage, setWpPage] = useState<PageContent | null>(null);

  useEffect(() => {
    fetchWordPressPage('o-nas').then((data) => {
      if (data.isLiveWP) {
        setWpPage(data);
      }
    });
  }, []);
  return (
    <main className="min-h-screen bg-[#FAF7F2] pb-24">
      {/* Hero Header */}
      <section className="bg-[#2D2821] text-[#FAF5ED] pt-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D9821E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center max-w-4xl mx-auto`}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3F372C] text-[#E5983A] text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-[#E5983A]" />
            <span>Ludzie, Pszczoły i Pasja • Ciechów</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#FAF5ED] tracking-tight leading-tight">
            Pasieka wędrowna „Usza”<br />
            <span className="text-[#E5983A] font-normal italic text-2xl sm:text-4xl block mt-2">
              Poznaj naszą historię i filozofię
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#C7BDB0] max-w-2xl mx-auto leading-relaxed">
            Jesteśmy małżeństwem, które postanowiło żyć w harmonii z przyrodą. Pracujemy z pszczołami z pokorą, wiedząc, że w pszczelarstwie nie ma dróg na skróty.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-[#3A3329] px-4 py-2 rounded-xl text-xs text-[#E6C065] border border-[#544837]">
              <MapPin className="w-4 h-4 text-[#D9821E]" />
              <span>Ciechów, Dolny Śląsk</span>
            </div>
            <div className="flex items-center gap-2 bg-[#3A3329] px-4 py-2 rounded-xl text-xs text-[#E6C065] border border-[#544837]">
              <ShieldCheck className="w-4 h-4 text-[#52B788]" />
              <span>Nadzór Powiatowego Lekarza Weterynarii</span>
            </div>
          </div>

          {/* Szybki skok do wizualizacji 3D */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                document.getElementById('wizualna-droga-miodu')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D9821E] to-[#E5983A] hover:from-[#C77316] hover:to-[#D9821E] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] ring-2 ring-[#E5983A]/30"
              id="btn-skok-droga-3d"
              title="Przejdź bezpośrednio do interaktywnej drogi miodu 3D"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Zobacz Wizualną Drogę Miodu 3D</span>
              <span className="text-white/80">↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Story Content */}
      <section id="historia-pasieki" className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 scroll-mt-24`}>
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#E7DCCE] shadow-xl space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5 text-sm sm:text-base text-[#524638] leading-relaxed">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#23201C] tracking-tight">
                {wpPage?.quote || '„Pierwsze, co musisz zrobić, by odnieść sukces w pracy z pszczołami – zakochać się w ciężkiej pracy.”'}
              </h2>
              
              {wpPage?.bodyParagraphs && wpPage.bodyParagraphs.length > 0 ? (
                wpPage.bodyParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))
              ) : (
                <>
                  <p>
                    Nasza pasieka powstała z zamiłowania do przyrody i niesamowitej chęci obcowania z nią na co dzień. Praca z pszczołami nie należy do łatwych – uczy cierpliwości, pokory i samodyscypliny. Początki naszej pracy i przygody z pszczołami nie były proste. Były sukcesy, ale i porażki.
                  </p>
                  
                  <p>
                    Po ponad 10 latach pracy i wielu zebranych doświadczeniach, możemy z dumą powiedzieć, że rozumiemy fascynujące życie rodziny pszczelej. Od naszych pszczół nauczyliśmy się rzetelności, solidności oraz tego, że pracując z naturą, niczego nie można odłożyć na później.
                  </p>
                </>
              )}

              <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#D9821E]/20 space-y-2">
                <h3 className="font-serif text-base font-bold text-[#23201C] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D9821E]" />
                  Dlaczego w naszej pasiece nie standaryzujemy miodu?
                </h3>
                <p className="text-xs sm:text-sm text-[#615444] leading-relaxed">
                  <strong>Nie mieszamy całego miodu ze sobą.</strong> Każde miodobranie i każda partia to unikat! Pszczoła ma zasięg lotu do 2 kilometrów i sama decyduje, z których kwiatów przyniesie najcenniejszy nektar. Dlatego każdy nasz słoiczek ma swój niepowtarzalny aromat, odcień i bukiet smakowy.
                </p>
              </div>

              <p className="font-serif text-lg text-[#23201C] font-semibold pt-2">
                Zapraszamy do naszego świata,<br />
                <span className="text-[#945209]">Magdalena i Piotr Szymkowicz</span>
              </p>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-[#E7DCCE] shadow-md relative group">
                <img 
                  src="https://pasiekausza.pl/wp-content/uploads/2022/02/DSC02154-683x1024.jpg" 
                  alt="Praca w Pasiece Usza" 
                  className="w-full h-[420px] object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white text-xs">
                  <p className="font-semibold">Bezpośrednio przy ulach • Ciechów</p>
                  <p className="text-[#E0D3C1] text-[11px]">Cierpliwa opieka nad każdym rojem</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden border border-[#E7DCCE] shadow-xs">
                  <img 
                    src="https://pasiekausza.pl/wp-content/uploads/2022/02/DSC01985-683x1024.jpg" 
                    alt="Plaster miodu" 
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[#E7DCCE] shadow-xs">
                  <img 
                    src="https://pasiekausza.pl/wp-content/uploads/2022/02/DSC01826-683x1024.jpg" 
                    alt="Przegląd ramek pszczelich" 
                    className="w-full h-32 object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Golden Quote */}
          <div className="bg-[#2D2821] text-[#FAF5ED] rounded-2xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden">
            <div className="text-3xl text-[#E5983A]">❝</div>
            <p className="font-serif text-base sm:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed text-[#F0E6D8]">
              „Kiedy pszczoła zniknie z powierzchni Ziemi, człowiekowi pozostaną już tylko cztery lata życia. Skoro nie będzie pszczół, nie będzie też zapylania. Zabraknie roślin, potem zwierząt, wreszcie przyjdzie kolej na człowieka…”
            </p>
            <p className="text-xs uppercase tracking-widest text-[#B5A593] font-semibold">
              Motto Przewodnie Pasieki Wędrownej Usza
            </p>
          </div>

        </div>
      </section>

      {/* 3D Scrollytelling Section: HoneyCraftingJourney */}
      <section id="wizualna-droga-miodu" className="mt-16 scroll-mt-24">
        <div className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 mb-6 text-center space-y-2`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE4D2] text-[#713F0C] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#A05C12]" />
            <span>Wizualna Droga Miodu</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#23201C] tracking-tight">
            Od wędrówki pasieki do Twojego słoika
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E4F] max-w-xl mx-auto">
            Przewijaj stronę, aby zobaczyć, jak z surowego nektaru dolnośląskich łąk powstaje czysty, niefiltrowany miód.
          </p>
        </div>

        <HoneyCraftingJourney containerClass={displayResolution.containerClass} />
      </section>

      {/* Video & Wintering Section */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 mt-20 space-y-8`}>
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7DCCE] shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E1] text-[#945209] text-xs font-bold">
              <span>Wideo z Pasieki</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#23201C]">
              Nasza Pasieka Zimą – Przygotowanie pszczół do zimowania
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5042] leading-relaxed">
              Zimowanie to jedna z najważniejszych i najtrudniejszych czynności w pasiece. Odpowiednio przeprowadzone prace gwarantują, że wiosną rodziny pszczele wyjdą z uli silne i gotowe do pierwszych oblotów mniszka i rzepaku.
            </p>
            <div className="pt-2">
              <Link 
                to="/sklep" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>Przejdź do sklepu z miodami</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-lg border border-[#E0D4C3] aspect-video bg-black">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/af2qEqCfBTY" 
              title="Pasieka Usza zimą" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Direct Contact & Visit Invitation */}
      <section className={`adaptive-container ${displayResolution.containerClass} px-4 sm:px-6 lg:px-8 mt-16 text-center`}>
        <div className="p-8 rounded-3xl bg-[#FAF6EE] border border-[#E0D0BB] space-y-4 max-w-3xl mx-auto">
          <h3 className="font-serif text-2xl font-bold text-[#23201C]">
            Chcesz porozmawiać o pszczołach lub odebrać miód osobiście?
          </h3>
          <p className="text-xs sm:text-sm text-[#665848]">
            Zawsze chętnie dzielimy się wiedzą. Odwiedź nas w Ciechowie po wcześniejszym kontakcie telefonicznym.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a 
              href="tel:697512103" 
              className="px-6 py-3 rounded-xl bg-[#8B5337] hover:bg-[#6D3F28] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span>Zadzwoń: +48 697 512 103</span>
            </a>
            <Link 
              to="/kontakt" 
              className="px-6 py-3 rounded-xl bg-white border border-[#D5C2AB] hover:bg-[#F3E9DA] text-[#332B22] text-xs font-bold transition-all shadow-2xs"
            >
              <span>Formularz i dane dojazdu →</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
