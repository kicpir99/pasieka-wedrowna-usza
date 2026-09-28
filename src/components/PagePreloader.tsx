import React, { useState, useEffect, useRef } from 'react';
import { 
  loadFramesFromSpriteSheet, 
  BUNDLED_VARIETY_SPRITES 
} from '../utils/framePreloader';
import { getAssetUrl } from '../utils/assets';

interface PagePreloaderProps {
  onComplete?: () => void;
}

export const PagePreloader: React.FC<PagePreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [statusText, setStatusText] = useState('Pszczoły wyruszają na dolnośląskie pożytki...');

  const progressRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const startTime = performance.now();
    const minDisplayTimeMs = 1200; // Minimalny czas dla zachowania płynnej estetyki powitania
    let finished = false;

    let spritePct = 0;
    let spriteDone = false;
    let ribbonsDone = false;
    let sec2Pct = 0;
    let sec2Done = false;
    let targetP = 5;

    const checkProgress = () => {
      if (!isMounted || finished) return;
      const computed = Math.min(
        100,
        Math.round((spritePct * 0.55) + (ribbonsDone ? 15 : 0) + (sec2Pct * 0.30))
      );
      targetP = Math.max(targetP, computed);
    };

    // 1. Prawdziwe ładowanie i rozcinanie sprajtów 360° dla 3 PIERWSZYCH widocznych w karuzeli odmian:
    // Lipowy (centrum), Gryczany (prawa strona), Spadziowy (lewa strona)
    // Pozostałe 3 odmiany (rzepakowy, akacja, wrzosowy) ładują się cicho w tle (idle queue)
    const priorityVarietyIds = ['lipowy', 'gryczany', 'spadziowy'];
    const backgroundVarietyIds = ['rzepakowy', 'akacja', 'wrzosowy'];

    let totalSpritesPct = 0;
    const spritesCount = priorityVarietyIds.filter(id => BUNDLED_VARIETY_SPRITES[id]).length;
    let spritesCompleted = 0;

    const priorityPromises = priorityVarietyIds.map(id => {
      const spriteInfo = BUNDLED_VARIETY_SPRITES[id];
      if (!spriteInfo) {
        spritesCompleted++;
        return Promise.resolve();
      }
      return loadFramesFromSpriteSheet({
        varietyId: id,
        spriteInfo,
        onProgress: (pct) => {
          totalSpritesPct = Math.round(((spritesCompleted * 100 + pct) / spritesCount));
          spritePct = Math.min(100, totalSpritesPct);
          checkProgress();
        }
      }).then(() => {
        spritesCompleted++;
        spritePct = Math.round((spritesCompleted / spritesCount) * 100);
        checkProgress();
      }).catch(() => {
        spritesCompleted++;
        spritePct = Math.round((spritesCompleted / spritesCount) * 100);
        checkProgress();
      });
    });

    Promise.all(priorityPromises).then(() => {
      spriteDone = true;
      spritePct = 100;
      checkProgress();

      // Po odsłonięciu strony cicho w tle dogrywamy pozostałe 3 odmiany (jedna po drugiej, bez obciążania wątku)
      const loadBackgroundQueue = async () => {
        // Ciche wczytanie wstęg miodowych w tle
        const bgRibbons = [
          getAssetUrl('assets/akacjowy-front.webp'),
          getAssetUrl('assets/akacjowy-back.webp'),
          getAssetUrl('assets/rzepakowy-front.webp'),
          getAssetUrl('assets/rzepakowy-back.webp'),
          getAssetUrl('assets/wrzosowy-front.webp'),
          getAssetUrl('assets/wrzosowy-back.webp'),
        ];
        for (const rUrl of bgRibbons) {
          const img = new Image();
          img.src = rUrl;
        }

        for (const bgId of backgroundVarietyIds) {
          const bgSprite = BUNDLED_VARIETY_SPRITES[bgId];
          if (bgSprite) {
            try {
              await new Promise(r => setTimeout(r, 600));
              await loadFramesFromSpriteSheet({
                varietyId: bgId,
                spriteInfo: bgSprite,
              });
            } catch (err) {
              console.warn(`Background preload for ${bgId} skipped:`, err);
            }
          }
        }
      };

      if (typeof window !== 'undefined') {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => {
            setTimeout(loadBackgroundQueue, 1000);
          }, { timeout: 3000 });
        } else {
          setTimeout(loadBackgroundQueue, 1200);
        }
      }
    });

    // 2. Prawdziwe ładowanie i dekodowanie wstęg miodowych dla startowych odmian
    const ribbonUrls = [
      getAssetUrl('assets/wstega-ogolna-front.webp'),
      getAssetUrl('assets/wstega-ogolna-back.webp'),
      getAssetUrl('assets/wstega-lipowy-front.webp'),
      getAssetUrl('assets/wstega-lipowy-back.webp'),
      getAssetUrl('assets/gryczany-front.webp'),
      getAssetUrl('assets/gryczany-back.webp'),
      getAssetUrl('assets/spadziowy-front.webp'),
      getAssetUrl('assets/spadziowy-back.webp'),
    ];
    Promise.all(ribbonUrls.map(url => new Promise(res => {
      const img = new Image();
      img.src = url;
      img.onload = async () => {
        try {
          if ('decode' in img) await img.decode();
        } catch {}
        res(true);
      };
      img.onerror = () => res(false);
    }))).then(() => {
      ribbonsDone = true;
      checkProgress();
    });

    // 3. Prawdziwe ładowanie pierwszych 25 klatek sekcji 2 (3D scrolling wideo)
    const initialSection2Indices = Array.from({ length: 25 }, (_, i) => i);
    let sec2Count = 0;
    Promise.all(initialSection2Indices.map(idx => new Promise(res => {
      const frameNum = (idx + 1).toString().padStart(3, '0');
      const img = new Image();
      img.src = getAssetUrl(`frames/wyrob/${frameNum}.webp`);
      img.onload = async () => {
        try {
          if ('decode' in img) await img.decode();
        } catch {}
        sec2Count++;
        sec2Pct = Math.round((sec2Count / 25) * 100);
        checkProgress();
        res(true);
      };
      img.onerror = () => res(false);
    }))).then(() => {
      sec2Done = true;
      sec2Pct = 100;
      checkProgress();
    });

    let currentVisualP = 0;

    const interval = setInterval(() => {
      if (!isMounted || finished) return;

      const elapsed = performance.now() - startTime;
      const isReadyToComplete = (spriteDone && ribbonsDone && sec2Done && elapsed >= minDisplayTimeMs) || elapsed > 6000;

      if (isReadyToComplete) {
        targetP = 100;
      }

      // Płynny lerp w stronę targetP
      const diff = targetP - currentVisualP;
      if (diff > 0) {
        currentVisualP += Math.max(1, Math.ceil(diff * 0.14));
      }
      currentVisualP = Math.min(100, currentVisualP);

      setProgress(currentVisualP);

      // Aktualizacja statusu: etapy miodobrania i przygotowania słoików 3D
      if (currentVisualP < 18) {
        setStatusText('Pszczoły wyruszają na dolnośląskie pożytki...');
      } else if (currentVisualP < 40) {
        setStatusText('Znoszenie nektaru i odwirowywanie plastrów...');
      } else if (currentVisualP < 65) {
        setStatusText('Kalibracja obrotowych słoików 360° w karuzeli...');
      } else if (currentVisualP < 85) {
        setStatusText('Nalewanie świeżego miodu pod sam rant słoika...');
      } else if (currentVisualP < 98) {
        setStatusText('Dokręcanie wieczek i pieczętowanie pasieki...');
      } else {
        setStatusText('Miód z Pasieki Usza gotowy do degustacji! 🍯');
      }

      if (currentVisualP >= 100 && isReadyToComplete && !finished) {
        finished = true;
        clearInterval(interval);
        setTimeout(() => {
          if (isMounted) {
            setIsDone(true);
            if (onComplete) onComplete();
            setTimeout(() => {
              if (isMounted) setIsRemoved(true);
            }, 750);
          }
        }, 180);
      }
    }, 20);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [onComplete]);

  if (isRemoved) return null;

  return (
    <div
      aria-label="Ekran wczytywania pasieki"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#140F0C] select-none transition-all duration-700 ease-out ${
        isDone 
          ? 'opacity-0 scale-[1.03] blur-md pointer-events-none' 
          : 'opacity-100 scale-100 blur-0 pointer-events-auto'
      }`}
    >
      {/* TŁO: Ciepła bursztynowa aura i subtelny raster plastra miodu */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(224, 169, 79, 0.28) 0%, rgba(45, 34, 25, 0.50) 45%, transparent 75%)'
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `radial-gradient(#E0A94F 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* CENTRALNY KONTENER EKRANU WCZYTYWANIA */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        
        {/* ARTYSTYCZNA ANIMACJA SŁOIKA Z MIODEM W SVG */}
        <div className="relative w-28 h-36 sm:w-32 sm:h-40 mb-6 flex items-center justify-center">
          {/* Pulsująca złota poświata z tyłu słoika */}
          <div className="absolute inset-0 rounded-full bg-[#E0A94F]/25 blur-2xl animate-pulse" />

          <svg
            viewBox="0 0 120 150"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Złoty gradient miodu */}
              <linearGradient id="honeyLiquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5B027" />
                <stop offset="45%" stopColor="#E0A94F" />
                <stop offset="100%" stopColor="#B36B15" />
              </linearGradient>

              {/* Szklany refleks */}
              <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
              </linearGradient>

              {/* Maska napełniania miodem wg wartości progress */}
              <clipPath id="jarInnerClip">
                <path d="M 28 36 C 28 36 26 136 28 138 C 30 140 38 142 60 142 C 82 142 90 140 92 138 C 94 136 92 36 92 36 Z" />
              </clipPath>
            </defs>

            {/* Pokrywka słoika */}
            <rect x="36" y="10" width="48" height="12" rx="4" fill="#C59A4E" stroke="#5E421B" strokeWidth="2" />
            <rect x="34" y="20" width="52" height="6" rx="2" fill="#8F6322" />
            <path d="M 40 26 L 80 26" stroke="#452C0D" strokeWidth="2" />

            {/* Puste szkło słoika */}
            <path
              d="M 32 30 C 32 30 25 36 25 50 L 25 128 C 25 140 38 144 60 144 C 82 144 95 140 95 128 L 95 50 C 95 36 88 30 88 30 Z"
              fill="rgba(255, 255, 255, 0.04)"
              stroke="rgba(224, 169, 79, 0.45)"
              strokeWidth="2.5"
            />

            {/* Wypełnienie miodem sterowane dynamicznie wysokością Y */}
            <g clipPath="url(#jarInnerClip)">
              {/* Poziom miodu (od Y=144 [0%] do Y=36 [100%]) */}
              <rect
                x="20"
                y={144 - ((progress / 100) * 108)}
                width="80"
                height="120"
                fill="url(#honeyLiquidGrad)"
                className="transition-all duration-300 ease-out"
              />
              {/* Falująca powierzchnia miodu */}
              <ellipse
                cx="60"
                cy={144 - ((progress / 100) * 108)}
                rx="30"
                ry="5"
                fill="#FFD276"
                opacity="0.8"
                className="transition-all duration-300 ease-out"
              />
            </g>

            {/* Szklane refleksy na słoiku */}
            <path
              d="M 32 38 L 32 134 C 32 136 34 138 37 138 C 34 134 34 42 37 38 Z"
              fill="url(#glassReflect)"
            />
            <path
              d="M 85 46 L 85 126 C 85 128 86 130 87 130 C 86 126 86 50 87 46 Z"
              fill="url(#glassReflect)"
            />
          </svg>

          {/* Drobna latająca pszczółka z mikro-animacją */}
          <div className="absolute -top-1 -right-3 text-amber-300 text-sm animate-bounce duration-1000">
            🐝
          </div>
        </div>

        {/* PASEK POSTĘPU Z EFEKTEM BLASKU */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] space-y-2.5">
          <div className="relative w-full h-2 rounded-full bg-[#241D17] overflow-hidden border border-[#44362A] shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#B7791F] via-[#E0A94F] to-[#FCE09B] transition-all duration-150 ease-out shadow-[0_0_12px_rgba(224,169,79,0.7)]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs px-0.5">
            <span className="text-[#C5BCAD] text-[12px] font-sans font-medium tracking-wide text-left pr-2">
              {statusText}
            </span>
            <span className="font-mono text-[#E0A94F] font-bold text-xs shrink-0">
              {progress}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
