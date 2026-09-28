import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { VarietyItem } from './Hero';
import { FramelessJar360Viewer } from './FramelessJar360Viewer';

import { HoneyLiquidRibbon } from './HoneyLiquidRibbon';

interface HoneyJar3DCarouselProps {
  varieties: VarietyItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onAddToCart?: () => void;
  onOpenDetails?: () => void;
  onAngleChange?: (degrees: number) => void;
  targetAnglePreset?: number | null;
}

/**
 * Standard Linear Interpolation (lerp)
 */
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Calculates shortest angular distance on a modular circle of length `total`
 */
const getShortestAngularDiff = (current: number, target: number, total: number): number => {
  const currentMod = ((current % total) + total) % total;
  let diff = target - currentMod;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
};

// Flaga wyświetlania wstęgi miodowej (wstęga renderuje się tylko dla miodów z zdefiniowanymi assetami, aktualnie 'lipowy')
const SHOW_HONEY_RIBBON = true;

export const HoneyJar3DCarousel: React.FC<HoneyJar3DCarouselProps> = ({
  varieties,
  selectedIndex,
  onSelectIndex,
  onAddToCart,
  onOpenDetails,
  onAngleChange,
  targetAnglePreset,
}) => {
  const total = varieties.length;

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const jarItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const jarGlowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const popupsPortalTargetRef = useRef<HTMLDivElement>(null);
  const backRibbonRef = useRef<HTMLDivElement>(null);
  const frontRibbonRef = useRef<HTMLDivElement>(null);

  // 3D Carousel Physics & Lerp State Refs (Decoupled from React render cycle)
  const currentProgressRef = useRef<number>(selectedIndex);
  const targetProgressRef = useRef<number>(selectedIndex);
  const rafIdRef = useRef<number | null>(null);

  // Hover states for background orbiting jars
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  hoveredIndexRef.current = hoveredIndex;

  // Active center index state for conditional interactive viewer mounting
  const [renderedActiveIndex, setRenderedActiveIndex] = useState<number>(selectedIndex);

  // Update target progress when selectedIndex changes externally (e.g. from bottom bar or quiz)
  useEffect(() => {
    const diff = getShortestAngularDiff(currentProgressRef.current, selectedIndex, total);
    targetProgressRef.current = currentProgressRef.current + diff;
    setRenderedActiveIndex(selectedIndex);
  }, [selectedIndex, total]);

  // Handle direct navigation to target index
  const navigateToIndex = useCallback((index: number) => {
    const nextIdx = ((index % total) + total) % total;
    const diff = getShortestAngularDiff(currentProgressRef.current, nextIdx, total);
    targetProgressRef.current = currentProgressRef.current + diff;
    onSelectIndex(nextIdx);
  }, [total, onSelectIndex]);

  const handlePrev = useCallback(() => {
    navigateToIndex(selectedIndex - 1);
  }, [navigateToIndex, selectedIndex]);

  const handleNext = useCallback(() => {
    navigateToIndex(selectedIndex + 1);
  }, [navigateToIndex, selectedIndex]);

  // Touch Swipe Navigation on Carousel Stage
  // IMPORTANT: Must NOT fire when the user is dragging the active center jar to rotate it 360°.
  // The 360° viewer uses pointer events (separate from touch events), so we detect the touch target.
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartedOnActiveJarRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Check if this touch started on the active jar's 360° drag stage
    const target = e.target as HTMLElement;
    const isOnActiveStage = target.closest?.('[data-frameless-360-stage]') !== null;
    touchStartedOnActiveJarRef.current = isOnActiveStage;

    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartXRef.current;
    const dy = e.changedTouches[0].clientY - touchStartYRef.current;
    const wasOnActiveJar = touchStartedOnActiveJarRef.current;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchStartedOnActiveJarRef.current = false;

    // If the touch originated on the active jar's 360° rotation area, do NOT treat it as a carousel swipe
    if (wasOnActiveJar) return;

    if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Main 60 FPS requestAnimationFrame loop with Linear/Exponential Lerp
  useEffect(() => {
    let lastTime = performance.now();
    let isVisible = !document.hidden;
    let hasSettled = false;
    let lastHovered: number | null = null;

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && stageRef.current) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting && !document.hidden;
          if (isVisible) {
            lastTime = performance.now();
          }
        }
      }, { threshold: 0.05 });
      observer.observe(stageRef.current);
    }

    const tick = (now: number) => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (!isVisible) {
        lastTime = now;
        return;
      }

      // Safe delta time clamped between 1ms and 50ms
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Precise Frame-Rate Independent Exponential Lerp towards target
      const diff = targetProgressRef.current - currentProgressRef.current;
      const currentHovered = hoveredIndexRef.current;
      const isMoving = Math.abs(diff) > 0.0001;
      const hoverChanged = currentHovered !== lastHovered;

      if (!isMoving && !hoverChanged && hasSettled) {
        return;
      }

      if (isMoving) {
        const lerpSpeed = 11.0; // Responsive, smooth spring transition
        const lerpFactor = 1 - Math.exp(-lerpSpeed * dt);
        currentProgressRef.current = lerp(currentProgressRef.current, targetProgressRef.current, lerpFactor);
        hasSettled = false;
      } else {
        currentProgressRef.current = targetProgressRef.current;
        if (!hoverChanged) {
          hasSettled = true;
        }
      }
      lastHovered = currentHovered;

      const progress = currentProgressRef.current;
      const stageWidth = stageRef.current ? stageRef.current.clientWidth : 800;
      
      // Responsive 3D orbital parameters based on viewport width
      const isMobile = stageWidth < 640;
      const isTablet = stageWidth < 1024;
      const orbitRadiusX = isMobile ? stageWidth * 0.30 : isTablet ? 298 : 338;
      const maxRotateY = isMobile ? 10 : 18;

      // 2. Compute 3D Cylindrical / Orbital Spatial Transformations for every jar slot via Lerp
      varieties.forEach((item, index) => {
        const el = jarItemRefs.current[index];
        if (!el) return;

        // Normalized relative offset delta: delta = 0 for active center, -1 for left orbit, +1 for right orbit
        let delta = index - progress;
        // Wrap delta to shortest circular distance [-total/2, total/2]
        delta = ((delta % total) + total) % total;
        if (delta > total / 2) delta -= total;

        const absDelta = Math.abs(delta);

        // Discard or hide items beyond immediate orbital field (|delta| > 1.45)
        if (absDelta > 1.45) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.style.transform = 'translate3d(-50%, -50%, 0) scale(0.001)';
          const glowEl = jarGlowRefs.current[index];
          if (glowEl) {
            glowEl.style.visibility = 'hidden';
            glowEl.style.opacity = '0';
            glowEl.style.transform = el.style.transform;
          }
          return;
        }

        el.style.visibility = 'visible';

        // 3D Orbital Trajectory Math
        // X Position: smooth sinusoidal orbital spread
        const posX = Math.sin(delta * (Math.PI / 2.2)) * orbitRadiusX;
        
        // 3D Orbital Y-Axis Rotation: rotates subtly towards the center focal point
        const rotateY = -delta * maxRotateY;

        // Scale: Center active jar is ~0.78 on mobile / 1.04 on desktop; background jars scale down smoothly
        let scale = absDelta < 0.25 
          ? (isMobile ? 0.78 : 1.04) - absDelta * (isMobile ? 0.20 : 0.35)
          : (isMobile ? 0.50 : 0.70);

        // Opacity & Layering:
        // Wszystkie słoiki stoją PRZED tylną wstęgą (z-index: 5).
        // Słoiki boczne mają zIndex 15 w spoczynku i 20 na hoverze.
        // Słoiki ZAWSZE pozostają pod przednią wstęgą (z-index: 30), dzięki czemu przednia wstęga fizycznie oplata słoiki od frontu.
        const isHovered = hoveredIndexRef.current === index;
        let posY = 0;
        let opacity = 1.0;
        let blurAmount = 0;
        let zIndex = absDelta < 0.3 ? 25 : 15;

        // Subtelne uniesienie głównego słoika dla pełnej ekspozycji etykiety oraz levitation dla hoverowanych słoików
        if (absDelta < 0.25) {
          posY = isMobile ? -2 : -8;
        } else if (isHovered) {
          posY = isMobile ? -8 : -16; // Płynne, naturalne uniesienie
          scale = isMobile ? 0.55 : 0.76; // Subtelne powiększenie na hoverze
          zIndex = 20; // ZAWSZE poniżej przedniej wstęgi (20 < 30)
        }

        // Hardware-Accelerated 3D Transform write directly to DOM node (keeping posZ = 0 for rock-solid click & hover hit testing)
        el.style.transform = `translate3d(calc(-50% + ${posX.toFixed(2)}px), calc(-50% + ${posY.toFixed(2)}px), 0px) rotateY(${rotateY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = blurAmount > 0.1 ? `blur(${blurAmount.toFixed(1)}px)` : 'none';
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = absDelta < 0.25 ? 'none' : 'auto';

        // Synchronize dedicated hover glow layer (rendered at z-index: 4, strictly behind the liquid ribbons)
        const glowEl = jarGlowRefs.current[index];
        if (glowEl) {
          glowEl.style.visibility = 'visible';
          glowEl.style.transform = el.style.transform;
          glowEl.style.opacity = opacity.toFixed(3);
        }
      });

      // 2b. Synchronize Popups Portal Overlay and Liquid Ribbons with Active Center Jar
      if (popupsPortalTargetRef.current) {
        let activeDelta = selectedIndex - progress;
        activeDelta = ((activeDelta % total) + total) % total;
        if (activeDelta > total / 2) activeDelta -= total;
        popupsPortalTargetRef.current.style.opacity = Math.abs(activeDelta) > 0.35 ? '0' : '1';
        
        // Płynne zanikanie (fade-out) wstęg miodowych podczas obrotu karuzeli,
        // co rozwiązuje problem przenikania bocznych słoików (clipping) przez warstwy front/back.
        if (backRibbonRef.current && frontRibbonRef.current) {
          const ribbonOpacity = Math.max(0, 1 - Math.abs(activeDelta) * 4).toFixed(2);
          backRibbonRef.current.style.opacity = ribbonOpacity;
          frontRibbonRef.current.style.opacity = ribbonOpacity;
        }
      }

      // 3. Update Ambient Backdrop Glow color and intensity
      if (glowRef.current) {
        const currentActiveItem = varieties[selectedIndex];
        if (currentActiveItem) {
          glowRef.current.style.background = `radial-gradient(circle at 50% 50%, ${currentActiveItem.ambientToneHex}55 0%, transparent 68%)`;
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) observer.disconnect();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [varieties, selectedIndex, total, onSelectIndex]);

  const currentItem = varieties[selectedIndex];
  const prevIndex = (selectedIndex - 1 + total) % total;
  const nextIndex = (selectedIndex + 1) % total;

  return (
    <div 
      className="relative w-full flex items-center justify-center py-1 sm:py-2 px-1 select-none overflow-hidden sm:overflow-visible"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D ORBITAL STAGE CONTAINER WITH HARDWARE-ACCELERATED PERSPECTIVE */}
      <div 
        ref={stageRef}
        className="relative z-50 w-full max-w-[940px] h-[300px] sm:h-[500px] md:h-[540px] lg:h-[560px] xl:h-[600px] flex items-center justify-center overflow-visible"
        style={{ 
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* ATMOSPHERIC RADIAL AMBIENT GLOW BEHIND 3D CAROUSEL */}
        <div 
          ref={glowRef}
          className="absolute inset-0 pointer-events-none transition-all duration-700 blur-3xl opacity-45 -z-10"
        />

        {/* DEDICATED SIDE JARS HOVER GLOW LAYER (Z-INDEX: 4, strictly behind the liquid ribbon!) */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          {varieties.map((variety, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <div
                key={`side-glow-${variety.id}`}
                ref={(el) => (jarGlowRefs.current[idx] = el)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  willChange: 'transform, opacity',
                }}
                className="origin-center overflow-visible max-w-[220px] sm:max-w-[460px]"
              >
                {!isActive && (
                  <>
                    {/* Natural soft contact shadow on the floor - strictly behind both ribbons at zIndex: 4 */}
                    <div className="absolute bottom-4 sm:bottom-6 w-[55%] h-7 rounded-full bg-black/40 blur-md pointer-events-none" />

                    <div
                      className={`relative w-[240px] sm:w-[380px] h-[300px] sm:h-[450px] flex items-center justify-center transition-all duration-500 ease-out pointer-events-none ${
                        hoveredIndex === idx ? 'opacity-100 scale-105' : 'opacity-0 scale-90'
                      }`}
                    >
                      {/* Atmospheric soft radial aura behind the side jar */}
                      <div 
                        className="w-[120%] h-[120%] blur-[48px] rounded-full pointer-events-none"
                        style={{ 
                          background: `radial-gradient(circle at 50% 50%, ${variety.ambientToneHex} 0%, ${variety.ambientToneHex}bb 42%, transparent 72%)`,
                          opacity: 0.90
                        }}
                      />
                      {/* Concentrated warm core backlight illuminating the jar glass from behind */}
                      <div 
                        className="absolute w-[62%] h-[72%] blur-[24px] rounded-[44px] pointer-events-none"
                        style={{ 
                          background: `radial-gradient(ellipse at 50% 50%, #FFF5D0 0%, ${variety.ambientToneHex} 50%, transparent 78%)`,
                          opacity: 0.85
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* LIQUID HONEY RIBBON - TYLNA GŁÓWNA STRUGI MIODU ŁĄCZĄCA SŁOIKI W KARUZELI */}
        {SHOW_HONEY_RIBBON && (
          <div ref={backRibbonRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            <HoneyLiquidRibbon
              varietyId={currentItem.id}
              ambientColorHex={currentItem.ambientToneHex}
              isFrontLayer={false}
            />
          </div>
        )}

        {/* 3D ORBITAL JARS (Rendered in continuous 3D Space via RAF Lerp Engine) */}
        {varieties.map((variety, idx) => {
          const isActive = idx === selectedIndex;
          const isLeft = idx === prevIndex;
          const isRight = idx === nextIndex;
          const isCarouselVisible = isActive || isLeft || isRight;

          return (
            <div
              key={variety.id}
              ref={(el) => (jarItemRefs.current[idx] = el)}
              onMouseEnter={() => {
                if (!isActive) setHoveredIndex(idx);
              }}
              onMouseLeave={() => {
                if (!isActive) setHoveredIndex(null);
              }}
              onClick={(e) => {
                if (!isActive) {
                  e.stopPropagation();
                  navigateToIndex(idx);
                }
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                willChange: 'transform, opacity, filter',
                cursor: isActive ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: isActive ? 'none' : 'auto',
                touchAction: 'none',
              }}
              className="origin-center overflow-visible max-w-[220px] sm:max-w-[460px]"
            >
              <div 
                className={`relative w-full flex items-center justify-center no-drag overflow-visible ${isActive ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'}`}
                data-frameless-360-stage="true"
                onClick={isActive ? undefined : (e) => {
                  e.stopPropagation();
                  navigateToIndex(idx);
                }}
              >
                <div className="relative z-10 w-full pointer-events-none">
                  <FramelessJar360Viewer
                    varietyId={variety.id}
                    varietyName={variety.product.name}
                    ambientToneHex={variety.ambientToneHex}
                    defaultVideoUrl={variety.defaultVideoUrl}
                    editorialTiltEnabled={isActive}
                    targetAnglePreset={isActive ? targetAnglePreset : null}
                    onAngleChange={isActive ? onAngleChange : undefined}
                    onAddToCart={isActive ? onAddToCart : undefined}
                    onOpenDetails={isActive ? onOpenDetails : undefined}
                    isActive={isActive}
                    isCarouselVisible={isCarouselVisible}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* LIQUID HONEY RIBBON - PRZEDNIA DOLNA WARSTWA OPLATAJĄCA SŁOIK OD FRONTU */}
        {SHOW_HONEY_RIBBON && (
          <div ref={frontRibbonRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
            <HoneyLiquidRibbon
              varietyId={currentItem.id}
              ambientColorHex={currentItem.ambientToneHex}
              isFrontLayer={true}
            />
          </div>
        )}

        {/* DEDICATED POPUP OVERLAY STAGE (Z-INDEX: 80) */}
        {/* Wyrenderowane bezpośrednio na najwyższej warstwie - gwarantuje, że wyskakujące pop-upy (karty) są w 100% na pierwszym planie, także ponad podpowiedzią przeciągania */}
        <div
          ref={popupsPortalTargetRef}
          id="jar-popups-portal-target"
          className="pointer-events-none absolute inset-0 w-full h-full"
          style={{ zIndex: 80 }}
        />

        {/* FLOATING NAVIGATION CHEVRONS - Poszerzone z zachowaniem bezpiecznego marginesu na laptopie */}
        <button
          onClick={handlePrev}
          aria-label="Poprzedni miód w karuzeli 3D (obrót w lewo)"
          title={`Przejdź do: ${varieties[prevIndex].product.name}`}
          className="absolute left-1 sm:-left-2 md:-left-4 lg:-left-6 xl:-left-7 2xl:-left-9 z-50 w-9 h-9 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-full bg-[#160F0A]/90 hover:bg-[#2A1E14] text-[#D8C7B5] hover:text-[#FAF5ED] border-2 border-[#523F2D]/90 hover:border-[#E5983A] backdrop-blur-md shadow-[0_16px_36px_rgba(0,0,0,0.85)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110 group cursor-pointer no-drag pointer-events-auto"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform text-[#FAF5ED]" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Następny miód w karuzeli 3D (obrót w prawo)"
          title={`Przejdź do: ${varieties[nextIndex].product.name}`}
          className="absolute right-1 sm:-right-2 md:-right-4 lg:-right-6 xl:-right-7 2xl:-right-9 z-50 w-9 h-9 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-full bg-[#160F0A]/90 hover:bg-[#2A1E14] text-[#D8C7B5] hover:text-[#FAF5ED] border-2 border-[#523F2D]/90 hover:border-[#E5983A] backdrop-blur-md shadow-[0_16px_36px_rgba(0,0,0,0.85)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-110 group cursor-pointer no-drag pointer-events-auto"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform text-[#FAF5ED]" />
        </button>
      </div>

      {/* PRZYCISK / PODPOWIEDŹ OBROTU 360° - Lekko opuszczony z zachowaniem czystego marginesu nad dolnym menu */}
      <div 
        className="absolute bottom-0 sm:-bottom-1 md:-bottom-2 lg:-bottom-2.5 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#18120D]/95 backdrop-blur-md border border-[#524131]/90 text-[10px] sm:text-xs text-[#FAF5ED] pointer-events-none shadow-[0_8px_24px_rgba(0,0,0,0.8),0_0_16px_rgba(229,152,58,0.25)] whitespace-nowrap select-none transition-all duration-300"
      >
        <Repeat className="w-3.5 h-3.5 text-[#E5983A]" />
        <span className="tracking-wide">Przeciągnij słoik, aby obrócić go 360°</span>
      </div>
    </div>
  );
};
