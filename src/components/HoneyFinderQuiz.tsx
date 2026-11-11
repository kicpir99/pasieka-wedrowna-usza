import React, { useState } from 'react';
import { HoneyProduct } from '../types';
import { HONEY_PRODUCTS } from '../data/honeyProducts';
import { X, Sparkles, Check, ArrowRight, RotateCcw } from 'lucide-react';

interface HoneyFinderQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: HoneyProduct) => void;
}

export const HoneyFinderQuiz: React.FC<HoneyFinderQuizProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('');
  const [taste, setTaste] = useState<string>('');
  const [texture, setTexture] = useState<string>('');

  const handleReset = () => {
    setStep(1);
    setPurpose('');
    setTaste('');
    setTexture('');
  };

  // Simple matching algorithm
  const getRecommendation = (): HoneyProduct => {
    if (purpose === 'odpornosc') {
      return HONEY_PRODUCTS.find((p) => p.id === 'miod-lipowy') || HONEY_PRODUCTS[0];
    }
    if (purpose === 'dzieci') {
      return HONEY_PRODUCTS.find((p) => p.id === 'miod-wielokwiatowy') || HONEY_PRODUCTS[4];
    }
    if (purpose === 'kuchnia' || taste === 'mocny') {
      return HONEY_PRODUCTS.find((p) => p.id === 'miod-gryczany') || HONEY_PRODUCTS[5];
    }
    if (texture === 'kremowany') {
      return HONEY_PRODUCTS.find((p) => p.id === 'miod-rzepakowy') || HONEY_PRODUCTS[6];
    }
    if (taste === 'swiezy') {
      return HONEY_PRODUCTS.find((p) => p.id === 'miod-faceliowy') || HONEY_PRODUCTS[11];
    }
    return HONEY_PRODUCTS.find((p) => p.id === 'miod-ze-spadzi-iglastej') || HONEY_PRODUCTS[2];
  };

  const recommendedProduct = getRecommendation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl border border-[#D9CDBD] shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E7DDCE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EFE3CF] text-[#945209] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#23201C] leading-none">
                Doradca Pasieczny Usza
              </h3>
              <span className="text-[11px] text-[#786D5E]">Dobierz idealny miód w 3 szybkich krokach</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#716555] hover:bg-[#EDE1D1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Steps */}
        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#8C4609] uppercase tracking-wider block">
                Krok 1 z 3: Cel zakupu
              </span>
              <h4 className="font-serif text-xl font-bold text-[#23201C]">
                Do czego najczęściej będziesz używać miodu?
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'odpornosc', title: 'Odporność i przeziębienie', desc: 'Miód o wysokiej aktywności enzymatycznej i aromacie lipy lub spadzi' },
                  { id: 'herbata', title: 'Do herbaty i napojów', desc: 'Aksamitny, który doskonale słodzi nie zagłuszając smaku' },
                  { id: 'dzieci', title: 'Dla dzieci & na śniadania', desc: 'Łagodny, maślany lub z wiosennego nektaru kwiatowego' },
                  { id: 'kuchnia', title: 'Do serów, mięs i pierników', desc: 'Mocny, wytrawny, korzenny akcent kulinarny' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPurpose(item.id);
                      setStep(2);
                    }}
                    className="text-left p-3.5 rounded-xl border border-[#D9CDBD] bg-[#F5EDE1] hover:bg-[#EBDDC8] hover:border-[#945209] transition-all group"
                  >
                    <span className="font-bold text-xs text-[#2D2821] block group-hover:text-[#945209]">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#695F50] leading-snug mt-1 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#8C4609] uppercase tracking-wider block">
                Krok 2 z 3: Profil sensoryczny
              </span>
              <h4 className="font-serif text-xl font-bold text-[#23201C]">
                Jaki charakter smaku najbardziej Ci odpowiada?
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: 'lagodny', title: 'Łagodny, kwiatowy, aksamitny', desc: 'Delikatna słodycz nektaru akacjowego lub rzepakowego' },
                  { id: 'swiezy', title: 'Ziołowy z nutą cytrusową i leśną', desc: 'Orzeźwiający kwiat lipy lub facelii błękitnej' },
                  { id: 'mocny', title: 'Głęboki, wytrawny, ciemny z melasą', desc: 'Karmelowy, żywiczny miód gryczany lub spadziowy' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTaste(item.id);
                      setStep(3);
                    }}
                    className="text-left p-3.5 rounded-xl border border-[#D9CDBD] bg-[#F5EDE1] hover:bg-[#EBDDC8] hover:border-[#945209] transition-all group"
                  >
                    <span className="font-bold text-xs text-[#2D2821] block group-hover:text-[#945209]">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#695F50] leading-snug mt-0.5 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#8C4609] uppercase tracking-wider block">
                Krok 3 z 3: Konsystencja
              </span>
              <h4 className="font-serif text-xl font-bold text-[#23201C]">
                W jakiej postaci wolisz swój miód?
              </h4>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { id: 'kremowany', title: 'Kremowany (jak aksamitne masełko)', desc: 'Nigdy nie twardnieje, idealny do smarowania pieczywa' },
                  { id: 'patoka', title: 'Płynna patoka (do polewania)', desc: 'Lejący się miód do owsianek i sosów' },
                  { id: 'krupiec', title: 'Naturalnie skrystalizowany krupiec', desc: 'Z wyczuwalnymi chrupiącymi kryształkami cukrów' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTexture(item.id);
                      setStep(4);
                    }}
                    className="text-left p-3.5 rounded-xl border border-[#D9CDBD] bg-[#F5EDE1] hover:bg-[#EBDDC8] hover:border-[#945209] transition-all group"
                  >
                    <span className="font-bold text-xs text-[#2D2821] block group-hover:text-[#945209]">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#695F50] leading-snug mt-0.5 block">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5DAC8] text-[#713F0C] text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                Rekomendacja Pasiecznika
              </div>

              <div className="bg-[#F4ECE1] p-5 rounded-2xl border border-[#DFD1BD] max-w-md mx-auto text-left flex gap-4 items-center">
                <img
                  src={recommendedProduct.imageUrl}
                  alt={recommendedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const currentSrc = target.src;
                    if (currentSrc.includes('sklep.pasiekausza.pl') && !currentSrc.includes('www.sklep.pasiekausza.pl')) {
                      target.src = currentSrc.replace('sklep.pasiekausza.pl', 'www.sklep.pasiekausza.pl');
                    } else if (!target.dataset.fallbackApplied) {
                      target.dataset.fallbackApplied = 'true';
                      target.src = 'https://pasiekausza.pl/wp-content/uploads/2022/02/miod-wielokwaitowy-650x650.jpg';
                    }
                  }}
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#945209] block">
                    Partia #{recommendedProduct.batchNumber}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-[#23201C] leading-snug">
                    {recommendedProduct.name}
                  </h4>
                  <p className="text-xs text-[#635747] mt-1 line-clamp-2">
                    {recommendedProduct.subtitle}
                  </p>
                  <span className="text-xs font-bold text-[#23201C] mt-1.5 block">
                    Od {recommendedProduct.sizes[0].pricePln} zł za {recommendedProduct.sizes[0].label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-[#D9CEBD] text-xs font-semibold text-[#665B4C] hover:bg-[#EDE2D3] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Wypełnij ponownie
                </button>

                <button
                  onClick={() => {
                    onSelectProduct(recommendedProduct);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#945209] hover:bg-[#784004] text-[#FAF5ED] text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
                >
                  <span>Otwórz paszport i zamów</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
