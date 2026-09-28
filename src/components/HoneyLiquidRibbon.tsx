import React, { useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assets';
import { isMobileDeviceScreen } from '../utils/framePreloader';

interface HoneyRibbonProps {
  varietyId?: string;
  ambientColorHex: string;
  className?: string;
  isFrontLayer?: boolean;
}

interface VarietyRibbonTheme {
  filter: string;
  glowColor: string;
  glowOpacity: number;
}

const VARIETY_THEMES: Record<string, VarietyRibbonTheme> = {
  // 1. Miód Lipowy: klasyczny złocisty bursztyn z ciepłym, miodowym blaskiem
  lipowy: {
    filter: 'drop-shadow(0 14px 28px rgba(229,152,58,0.30)) brightness(1.0)',
    glowColor: '#E5983A',
    glowOpacity: 0.30,
  },
  'miod-lipowy': {
    filter: 'drop-shadow(0 14px 28px rgba(229,152,58,0.30)) brightness(1.0)',
    glowColor: '#E5983A',
    glowOpacity: 0.30,
  },
  'miod-wielokwiatowy': {
    filter: 'drop-shadow(0 14px 28px rgba(229,152,58,0.30)) brightness(1.0)',
    glowColor: '#E5983A',
    glowOpacity: 0.30,
  },

  // 2. Miód Gryczany: głęboka melasa, palony karmel i ciemny mahoń
  gryczany: {
    filter: 'drop-shadow(0 14px 28px rgba(75,35,15,0.40)) brightness(0.55) contrast(1.15) saturate(1.1) hue-rotate(-10deg)',
    glowColor: '#5C2C16',
    glowOpacity: 0.35,
  },
  'miod-gryczany': {
    filter: 'drop-shadow(0 14px 28px rgba(75,35,15,0.40)) brightness(0.55) contrast(1.15) saturate(1.1) hue-rotate(-10deg)',
    glowColor: '#5C2C16',
    glowOpacity: 0.35,
  },

  // 3. Miód ze Spadzi Iglastej: autentyczna leśna barwa ciemnej żywicy (ciemnobrunatno-oliwkowy)
  spadziowy: {
    filter: 'drop-shadow(0 14px 28px rgba(45,40,25,0.40)) brightness(0.45) contrast(1.2) saturate(0.7) hue-rotate(15deg) sepia(0.1)',
    glowColor: '#423D2D',
    glowOpacity: 0.35,
  },
  'spadz-iglastej': {
    filter: 'drop-shadow(0 14px 28px rgba(45,40,25,0.40)) brightness(0.45) contrast(1.2) saturate(0.7) hue-rotate(15deg) sepia(0.1)',
    glowColor: '#423D2D',
    glowOpacity: 0.35,
  },
  'miod-ze-spadzi-iglastej': {
    filter: 'drop-shadow(0 14px 28px rgba(45,40,25,0.40)) brightness(0.45) contrast(1.2) saturate(0.7) hue-rotate(15deg) sepia(0.1)',
    glowColor: '#423D2D',
    glowOpacity: 0.35,
  },
  'miod-wrzosowy': {
    filter: 'drop-shadow(0 14px 28px rgba(160,92,34,0.38)) brightness(0.60) contrast(1.15) saturate(1.1) hue-rotate(-5deg)',
    glowColor: '#A05C22',
    glowOpacity: 0.35,
  },

  // 4. Miód Akacjowy: krystalicznie jasny, słoneczny nektar, przejrzyste słomkowe złoto
  akacja: {
    filter: 'drop-shadow(0 14px 28px rgba(240,215,130,0.25)) brightness(1.2) contrast(0.95) saturate(0.7)',
    glowColor: '#F3E196',
    glowOpacity: 0.25,
  },
  'miod-akacjowy': {
    filter: 'drop-shadow(0 14px 28px rgba(240,215,130,0.25)) brightness(1.2) contrast(0.95) saturate(0.7)',
    glowColor: '#F3E196',
    glowOpacity: 0.25,
  },

  // 5. Miód Rzepakowy Kremowany: śnieżnobiały, puszysty perłowy krem miodowy
  rzepakowy: {
    filter: 'drop-shadow(0 14px 28px rgba(240,230,200,0.25)) brightness(1.45) contrast(0.8) saturate(0.2)',
    glowColor: '#F5EFE0',
    glowOpacity: 0.25,
  },
  'miod-rzepakowy': {
    filter: 'drop-shadow(0 14px 28px rgba(240,230,200,0.25)) brightness(1.45) contrast(0.8) saturate(0.2)',
    glowColor: '#F5EFE0',
    glowOpacity: 0.25,
  },
};

interface VarietyRibbonAsset {
  front: string;
  back: string;
  caustics?: string;
  reflection?: string;
  mobileFront?: string;
  mobileBack?: string;
  mobileCaustics?: string;
  mobileReflection?: string;
}

/**
 * Dedykowane fotorealistyczne wstęgi miodowe dla poszczególnych gatunków.
 * Skonfigurowane odmiany z dedykowanymi wstęgami, kaustyką i odbiciami w podłożu:
 * - Miód Lipowy
 * - Miód Gryczany
 * - Miód Akacjowy
 * - Miód Rzepakowy
 * - Miód Wrzosowy
 * - Miód Spadziowy
 */
const VARIETY_CUSTOM_RIBBONS: Record<string, VarietyRibbonAsset> = {
  // 1. Miód Lipowy
  lipowy: {
    front: 'assets/wstega-lipowy-front.webp',
    back: 'assets/wstega-lipowy-back.webp',
    caustics: 'assets/wstega-lipowy-caustics.webp',
    reflection: 'assets/wstega-lipowy-floor-reflect.webp',
  },
  'miod-lipowy': {
    front: 'assets/wstega-lipowy-front.webp',
    back: 'assets/wstega-lipowy-back.webp',
    caustics: 'assets/wstega-lipowy-caustics.webp',
    reflection: 'assets/wstega-lipowy-floor-reflect.webp',
  },

  // 2. Miód Gryczany
  gryczany: {
    front: 'assets/gryczany-front.webp',
    back: 'assets/gryczany-back.webp',
    caustics: 'assets/gryczany-caustics.webp',
    reflection: 'assets/gryczany-floor-reflect.webp',
  },
  'miod-gryczany': {
    front: 'assets/gryczany-front.webp',
    back: 'assets/gryczany-back.webp',
    caustics: 'assets/gryczany-caustics.webp',
    reflection: 'assets/gryczany-floor-reflect.webp',
  },
  'gryczany-mazurski': {
    front: 'assets/gryczany-front.webp',
    back: 'assets/gryczany-back.webp',
    caustics: 'assets/gryczany-caustics.webp',
    reflection: 'assets/gryczany-floor-reflect.webp',
  },

  // 3. Miód Akacjowy
  akacja: {
    front: 'assets/akacjowy-front.webp',
    back: 'assets/akacjowy-back.webp',
    caustics: 'assets/akacjowy-caustics.webp',
    reflection: 'assets/akacjowy-floor-reflect.webp',
  },
  akacjowy: {
    front: 'assets/akacjowy-front.webp',
    back: 'assets/akacjowy-back.webp',
    caustics: 'assets/akacjowy-caustics.webp',
    reflection: 'assets/akacjowy-floor-reflect.webp',
  },
  'miod-akacjowy': {
    front: 'assets/akacjowy-front.webp',
    back: 'assets/akacjowy-back.webp',
    caustics: 'assets/akacjowy-caustics.webp',
    reflection: 'assets/akacjowy-floor-reflect.webp',
  },

  // 4. Miód Rzepakowy
  rzepakowy: {
    front: 'assets/rzepakowy-front.webp',
    back: 'assets/rzepakowy-back.webp',
    caustics: 'assets/rzepakowy-caustics.webp',
    reflection: 'assets/rzepakowy-floor-reflect.webp',
  },
  'miod-rzepakowy': {
    front: 'assets/rzepakowy-front.webp',
    back: 'assets/rzepakowy-back.webp',
    caustics: 'assets/rzepakowy-caustics.webp',
    reflection: 'assets/rzepakowy-floor-reflect.webp',
  },

  // 5. Miód Wrzosowy
  wrzosowy: {
    front: 'assets/wrzosowy-front.webp',
    back: 'assets/wrzosowy-back.webp',
    caustics: 'assets/wrzosowy-caustics.webp',
    reflection: 'assets/wrzosowy-floor-reflect.webp',
  },
  'miod-wrzosowy': {
    front: 'assets/wrzosowy-front.webp',
    back: 'assets/wrzosowy-back.webp',
    caustics: 'assets/wrzosowy-caustics.webp',
    reflection: 'assets/wrzosowy-floor-reflect.webp',
  },

  // 6. Miód Spadziowy (ze Spadzi Iglastej)
  spadziowy: {
    front: 'assets/spadziowy-front.webp',
    back: 'assets/spadziowy-back.webp',
    caustics: 'assets/spadziowy-caustics.webp',
    reflection: 'assets/spadziowy-floor-reflect.webp',
  },
  'spadz-iglastej': {
    front: 'assets/spadziowy-front.webp',
    back: 'assets/spadziowy-back.webp',
    caustics: 'assets/spadziowy-caustics.webp',
    reflection: 'assets/spadziowy-floor-reflect.webp',
  },
  'miod-ze-spadzi-iglastej': {
    front: 'assets/spadziowy-front.webp',
    back: 'assets/spadziowy-back.webp',
    caustics: 'assets/spadziowy-caustics.webp',
    reflection: 'assets/spadziowy-floor-reflect.webp',
  },
  'miod-spadziowy': {
    front: 'assets/spadziowy-front.webp',
    back: 'assets/spadziowy-back.webp',
    caustics: 'assets/spadziowy-caustics.webp',
    reflection: 'assets/spadziowy-floor-reflect.webp',
  },
};

/**
 * Jednolity wygląd wstęgi miodowej (wstęga ogólna) do testów dla wszystkich miodów na karuzeli.
 * Zoptymalizowane warstwy 1385px (idealna ostrość dla kontenera 1070px bez obciążania GPU i bez migotania moiré).
 */
export const UNIVERSAL_RIBBON_ASSET: VarietyRibbonAsset = {
  front: 'assets/wstega-ogolna-front-mobile.webp',
  back: 'assets/wstega-ogolna-back-mobile.webp',
  caustics: 'assets/wstega-ogolna-caustics-mobile.webp',
  reflection: 'assets/wstega-ogolna-floor-reflect-mobile.webp',
  mobileFront: 'assets/wstega-ogolna-front-mobile.webp',
  mobileBack: 'assets/wstega-ogolna-back-mobile.webp',
  mobileCaustics: 'assets/wstega-ogolna-caustics-mobile.webp',
  mobileReflection: 'assets/wstega-ogolna-floor-reflect-mobile.webp',
};

// Flaga testowa: po włączeniu (true) każdy miód w karuzeli używa jednej ogólnej wstęgi miodowej
const USE_UNIVERSAL_RIBBON = true;

/**
 * HoneyLiquidRibbon
 * Luksusowa płynna wstęga miodowa renderowana w fizycznych warstwach 3D:
 * - isFrontLayer = false: ładuje warstwę tylną (z-index: 5, za głównym słoikiem) oraz organiczną kaustykę na podłożu i lustrzane odbicie
 * - isFrontLayer = true: ładuje warstwę przednią (z-index: 30, przed dolną krawędzią słoika)
 * - 100% zsynchronizowana fizyka unoszenia (RAF Harmonic Motion z globalnym czasem performance.now())
 */
export const HoneyLiquidRibbon: React.FC<HoneyRibbonProps> = React.memo(({
  varietyId,
  ambientColorHex,
  className = '',
  isFrontLayer = false,
}) => {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const reflectionRef = useRef<HTMLDivElement>(null);
  const causticsRef = useRef<HTMLDivElement>(null);

  // Zsynchronizowany silnik fizyczny unoszenia i opadania w 60/120 FPS
  useEffect(() => {
    let rafId: number | null = null;

    const tick = () => {
      // Globalny monotoniczny zegar przeglądarki - gwarantuje identyczną fazę dla warstwy przedniej, tylnej i odbicia
      const time = performance.now() / 1000;
      const angle = (time * 2 * Math.PI) / 4.6; // Naturalny, zbalansowany cykl oddechu (4.6s) eliminujący przestoje w skrajnych punktach
      const sinVal = Math.sin(angle); // Ciągła harmoniczna fala sinusoidalna [-1, +1]

      // Zróżnicowana, responsywna amplituda:
      // Na telefonie ekran jest mały, więc 1.8px (skok 3.6px) daje idealnie subtelny oddech.
      // Na komputerze amplituda 2.1px (skok 4.2px) jest zredukowana o 50% i w 100% płynna.
      const isMobile = window.innerWidth < 768;
      const baseAmplitude = isMobile ? 1.8 : 2.1;
      const ribbonY = sinVal * -baseAmplitude;

      // Odbicie w lustrze podłoża: ŚCIŚLE ZSYNCHRONIZOWANA ODWROĆNA FAZA LUSTRZANA!
      const reflectionY = -ribbonY * 0.73;

      // Kluczowe wymuszenie trybu subpikselowego w Chromium (D3D11 / Skia):
      // Zwykłe translate3d(0, Y, 0) na monitorze 1x jest zaokrąglane przez silnik Skia do pełnych pikseli (stąd 5 skoków!).
      // Dodanie mikroskopijnej rotacji 0.001deg oraz z=0.01px wyłącza CanSnapToIntegerGrid w silniku kompozytora,
      // zmuszając kartę graficzną do ciągłego, analogowego renderowania subpikselowego (MSAA/float) na każdej klatce!
      const ribbonTransform = `translate3d(0, ${ribbonY.toFixed(3)}px, 0.01px) rotate(0.001deg)`;
      const reflectionTransform = `translate3d(0, ${reflectionY.toFixed(3)}px, 0.01px) rotate(0.001deg)`;

      if (ribbonRef.current) {
        ribbonRef.current.style.transform = ribbonTransform;
      }

      if (reflectionRef.current) {
        reflectionRef.current.style.transform = reflectionTransform;
      }

      if (causticsRef.current) {
        // Blask kaustyki na podłożu delikatnie moduluje w rytm zbliżania się wstęgi
        const causticsOpacity = 0.88 - sinVal * 0.03;
        causticsRef.current.style.opacity = causticsOpacity.toFixed(3);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Jeśli włączona flaga USE_UNIVERSAL_RIBBON - stosujemy wstęgę ogólną do wszystkich miodów
  const ribbonConfig = USE_UNIVERSAL_RIBBON
    ? UNIVERSAL_RIBBON_ASSET
    : (varietyId ? VARIETY_CUSTOM_RIBBONS[varietyId] : null);

  if (!ribbonConfig) {
    return null;
  }

  const isMobile = isMobileDeviceScreen();
  const frontAsset = (isMobile && ribbonConfig.mobileFront) ? ribbonConfig.mobileFront : ribbonConfig.front;
  const backAsset = (isMobile && ribbonConfig.mobileBack) ? ribbonConfig.mobileBack : ribbonConfig.back;
  const causticsAsset = (isMobile && ribbonConfig.mobileCaustics) ? ribbonConfig.mobileCaustics : ribbonConfig.caustics;
  const reflectionAsset = (isMobile && ribbonConfig.mobileReflection) ? ribbonConfig.mobileReflection : ribbonConfig.reflection;

  const imageSrc = getAssetUrl(isFrontLayer ? frontAsset : backAsset);

  return (
    <div
      className={`pointer-events-none absolute left-[calc(50%-18px)] sm:left-[calc(50%-28px)] md:left-[calc(50%-42px)] top-[calc(50%+24px)] sm:top-[calc(50%+32px)] md:top-[calc(50%+38px)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none overflow-visible ${className}`}
      style={{
        zIndex: isFrontLayer ? 30 : 5,
      }}
    >
      <div className="relative flex items-center justify-center overflow-visible">
        {/* 1. FOTOREALISTYCZNA ORGANICZNA KAUSTYKA MIODU NA PODŁOŻU (Mikro-pulsacja blasku zsynchronizowana z ruchem wstęgi) */}
        {!isFrontLayer && causticsAsset && (
          <div 
            ref={causticsRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-[opacity]"
            style={{ opacity: 0.88 }}
          >
            <img
              src={getAssetUrl(causticsAsset)}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="w-[410px] sm:w-[630px] md:w-[930px] lg:w-[1030px] xl:w-[1070px] max-w-none h-auto object-contain pointer-events-none select-none"
              style={{
                mixBlendMode: 'screen',
                filter: 'contrast(1.1) brightness(1.05)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
        )}

        {/* 2. LUSTRZANE ODBICIE PRZEDNIEJ WSTĘGI W CIEMNEJ TAFLI PODŁOŻA (Ściśle zsynchronizowana przeciwfaza lustrzana 60/120fps) */}
        {!isFrontLayer && reflectionAsset && (
          <div 
            ref={reflectionRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ 
              transform: 'translate3d(0, 0, 0.01px) rotate(0.001deg)',
              willChange: 'transform',
              outline: '1px solid transparent',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <img
              src={getAssetUrl(reflectionAsset)}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="w-[410px] sm:w-[630px] md:w-[930px] lg:w-[1030px] xl:w-[1070px] max-w-none h-auto object-contain pointer-events-none select-none"
              style={{
                opacity: 0.70,
                filter: 'blur(0.5px)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
        )}

        {/* 3. CIEPŁA AMBIENTOWA ŁUNA PODŁOGOWA W KOLORZE DANEGO MIODU (Tylko pod głównym słoikiem) */}
        {!isFrontLayer && (
          <div 
            className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[70%] sm:w-[85%] h-20 sm:h-32 rounded-full blur-3xl pointer-events-none transition-all duration-700"
            style={{
              opacity: 0.45,
              background: `radial-gradient(ellipse at 50% 50%, ${ambientColorHex} 0%, ${ambientColorHex}55 40%, transparent 75%)`,
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* 4. WARSTWA GŁÓWNA WSTĘGI MIODOWEJ (FRONT LUB BACK) - Wymuszona płynność subpikselowa GPU bez zaokrągleń do siatki */}
        <div 
          ref={ribbonRef}
          className="relative flex items-center justify-center pointer-events-none"
          style={{ 
            transform: 'translate3d(0, 0, 0.01px) rotate(0.001deg)',
            willChange: 'transform',
            outline: '1px solid transparent',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <img
            src={imageSrc}
            alt={isFrontLayer ? "Miodowa wstęga - przód" : "Miodowa wstęga - tło"}
            loading="eager"
            decoding="async"
            className="w-[410px] sm:w-[630px] md:w-[930px] lg:w-[1030px] xl:w-[1070px] max-w-none h-auto object-contain pointer-events-none select-none"
            style={{
              backfaceVisibility: 'hidden',
            }}
          />
        </div>
      </div>
    </div>
  );
});
