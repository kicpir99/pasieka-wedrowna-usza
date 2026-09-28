import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  Droplets, 
  Coffee, 
  Heart, 
  Flame, 
  Trees, 
  Feather, 
  Zap, 
  Sun 
} from 'lucide-react';
import { generateTransparent360JarFrames } from '../utils/generateJar360Frames';
import {
  extractVideoFramesFast,
  loadFramesFromSpriteSheet,
  BUNDLED_VARIETY_VIDEOS,
  BUNDLED_VARIETY_SPRITES,
  getCachedFrames,
  setCachedFrames,
  applyFastChromaKey,
  ChromaKeyMode,
  FramingMode,
  BundledSpriteInfo,
} from '../utils/framePreloader';
import { getVarietyHotspots, VarietyHotspot } from '../data/varietyHotspots';

export type { ChromaKeyMode, FramingMode };
export { BUNDLED_VARIETY_VIDEOS };

interface FramelessJar360ViewerProps {
  varietyId: string;
  varietyName: string;
  ambientToneHex: string;
  defaultVideoUrl?: string;
  onAddToCart?: () => void;
  onOpenDetails?: () => void;
  onAngleChange?: (degrees: number) => void;
  targetAnglePreset?: number | null;
  editorialTiltEnabled?: boolean;
  isActive?: boolean;
  isCarouselVisible?: boolean;
}

// Hotspot popup animation variants (smooth ease-out with opacity and translateY / translateX in enter and exit states)
const hotspotPopupVariants = {
  enter: (side: 'left' | 'right') => ({
    opacity: 0,
    y: 8,
    x: side === 'left' ? -10 : 10,
    scale: 0.96,
    filter: 'blur(2px)',
  }),
  center: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (side: 'left' | 'right') => ({
    opacity: 0,
    y: -6,
    x: side === 'left' ? -8 : 8,
    scale: 0.96,
    filter: 'blur(2px)',
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const FramelessJar360Viewer: React.FC<FramelessJar360ViewerProps> = ({
  varietyId,
  varietyName,
  ambientToneHex,
  defaultVideoUrl,
  onAddToCart,
  onOpenDetails,
  onAngleChange,
  targetAnglePreset,
  editorialTiltEnabled = true,
  isActive = true,
  isCarouselVisible = true,
}) => {
  // Video & Frame state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [isUserVideoLoaded, setIsUserVideoLoaded] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Aspect ratio & Framing state (prevents vertical stretching)
  const [framingMode, setFramingMode] = useState<FramingMode>('crop-center');
  const [cropWidthRatio, setCropWidthRatio] = useState<number>(1.0); // 1.0 = 1:1 square centered on jar
  const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number }>({ width: 440, height: 440 });
  const [detectedAspect, setDetectedAspect] = useState<string>('1:1');

  // Chroma key / transparency options
  const [chromaMode, setChromaMode] = useState<ChromaKeyMode>('black');
  const [chromaTolerance, setChromaTolerance] = useState<number>(25);

  // Smoothness & Frame Interpolation state (100% razor-sharp anti-ghosting: zero blur, zero smearing on labels)
  const [enableInterpolation, setEnableInterpolation] = useState<boolean>(true);
  const [targetFrameCount, setTargetFrameCount] = useState<number>(180);

  // Editorial Studio Tilt (delicate artistic angle that brings life to the product photography)
  const [isEditorialTiltActive, setIsEditorialTiltActive] = useState<boolean>(editorialTiltEnabled);

  useEffect(() => {
    setIsEditorialTiltActive(editorialTiltEnabled);
  }, [editorialTiltEnabled]);

  // Interaction controls & infinite loop options
  const [autoRotate, setAutoRotate] = useState(false);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(1.0); // 1x, 1.5x, 2x
  const [invertDirection, setInvertDirection] = useState(false);
  const [isInfiniteLoopEnabled, setIsInfiniteLoopEnabled] = useState(true);
  // Active hotspot zone state — updated ONLY when transitioning between zones (0 re-renders during 99% of spinning frames)
  const [activeHotspotKey, setActiveHotspotKey] = useState<'h0' | 'h120' | 'h240' | null>('h0');
  // Target DOM element for rendering popups directly onto the foreground overlay (above front ribbon)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.getElementById('jar-popups-portal-target');
    if (el) {
      setPortalElement(el);
    } else {
      const timer = setTimeout(() => {
        const delayedEl = document.getElementById('jar-popups-portal-target');
        if (delayedEl) setPortalElement(delayedEl);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // DOM References
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const groundShadowRef = useRef<HTMLDivElement>(null);

  // Raw video cache ref for instant re-extraction when adjusting framing or chroma
  const activeVideoBlobRef = useRef<Blob | null>(null);
  const activeVideoUrlRef = useRef<string | null>(null);

  // Intelligent Idle Auto-Spin (Smooth turntable rotation by default; pauses immediately on touch/drag; resumes after 2.5s)
  const isAutoSpinActiveRef = useRef<boolean>(true);
  const autoSpinRampRef = useRef<number>(1);
  const idleResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track carousel visibility via ref for immediate, zero-lag access inside 60FPS RAF tick
  const isCarouselVisibleRef = useRef<boolean>(isCarouselVisible);
  isCarouselVisibleRef.current = isCarouselVisible;

  const pauseAutoSpin = useCallback(() => {
    if (idleResumeTimerRef.current) {
      clearTimeout(idleResumeTimerRef.current);
      idleResumeTimerRef.current = null;
    }
    isAutoSpinActiveRef.current = false;
    autoSpinRampRef.current = 0;
  }, []);

  const scheduleAutoSpinResume = useCallback((delayMs: number = 2500) => {
    if (idleResumeTimerRef.current) {
      clearTimeout(idleResumeTimerRef.current);
    }
    idleResumeTimerRef.current = setTimeout(() => {
      autoSpinRampRef.current = 0;
      isAutoSpinActiveRef.current = true;
    }, delayMs);
  }, []);

  useEffect(() => {
    return () => {
      if (idleResumeTimerRef.current) {
        clearTimeout(idleResumeTimerRef.current);
      }
    };
  }, []);

  // Physics & Animation refs (unbounded for continuous infinite rotation)
  const targetAngleProgressRef = useRef<number>(0);
  const currentAngleProgressRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastPointerXRef = useRef<number | null>(null);
  const lastPointerTimeRef = useRef<number | null>(null);
  const pendingPointerDeltaXRef = useRef<number>(0);
  const hasPendingPointerDeltaRef = useRef<boolean>(false);
  const velocityRef = useRef<number>(0);
  const velocitySamplesRef = useRef<{ time: number; velocity: number }[]>([]);
  const currentTiltYRef = useRef<number>(0);
  const currentTiltZRef = useRef<number>(0);
  const isNavigatingPresetRef = useRef<boolean>(false);
  const activeHotspotKeyRef = useRef<'h0' | 'h120' | 'h240' | null>('h0');
  const currentRenderedFrameIdx = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);
  const prevIsActiveRef = useRef<boolean>(isActive);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const reflectionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const refCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const reflectionContainerRef = useRef<HTMLDivElement | null>(null);
  const lastReflectedFrameIdx = useRef<number>(-999);

  // Stored ImageBitmap frames (for user custom uploaded video) and Direct Hardware Sprite Image (for bundled varieties)
  const framesRef = useRef<ImageBitmap[]>([]);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const spriteInfoRef = useRef<BundledSpriteInfo | null>(null);

  // Synchronize live mirrored reflection canvas on dark studio floor
  const syncReflectionCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const refCanvas = reflectionCanvasRef.current;
    if (!canvas || !refCanvas) return;
    if (!refCtxRef.current) {
      refCtxRef.current = refCanvas.getContext('2d', { alpha: true });
    }
    const refCtx = refCtxRef.current;
    if (refCtx && canvas.width > 0 && canvas.height > 0) {
      const w = canvas.width;
      const h = canvas.height;
      const refW = w;
      // Extended canvas height (70% of jar height) to accommodate full reflection fade
      const refH = Math.round(h * 0.70);

      if (refCanvas.width !== refW || refCanvas.height !== refH) {
        refCanvas.width = refW;
        refCanvas.height = refH;
      }

      // Base of the jar in 440x440 tile is at y = 406px (92.3% of height)
      const pivotY = h * 0.923;

      refCtx.clearRect(0, 0, refW, refH);
      refCtx.save();

      // 1. Draw vertically flipped jar starting at y = 0 of reflection canvas
      // With realistic vertical perspective compression (-0.75)
      refCtx.scale(1, -0.75);
      refCtx.drawImage(canvas, 0, -pivotY);
      refCtx.restore();

      // 2. Apply silky-smooth organic gradient fade into the floor table depths
      refCtx.save();
      refCtx.globalCompositeOperation = 'destination-in';
      const grad = refCtx.createLinearGradient(0, 0, 0, refH);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.90)');    // crisp contact point
      grad.addColorStop(0.18, 'rgba(0, 0, 0, 0.65)'); // rich honey & glass body
      grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.30)'); // gradual elegant falloff
      grad.addColorStop(0.72, 'rgba(0, 0, 0, 0.08)'); // delicate ambient dissipation
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');     // 100% seamless transition to zero
      refCtx.fillStyle = grad;
      refCtx.fillRect(0, 0, refW, refH);
      refCtx.restore();

      lastReflectedFrameIdx.current = currentRenderedFrameIdx.current;
    }
  }, []);

  // Main Draw Frame to Canvas: perfectly normalizes unbounded angle progress to [0, 1) loop with 100% Razor-Sharp clarity (zero smearing, zero ghosting)
  const drawActiveFrame = useCallback((angleProgress: number, forceRedraw: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: true, desynchronized: true }) || canvas.getContext('2d', { alpha: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Guaranteed mathematical modulo for seamless infinite looping
    const normalized = ((angleProgress % 1) + 1) % 1;

    // 1. FAST DIRECT HARDWARE SPRITE RENDERING (0ms slicing, 0 GPU memory overhead, 60fps on mobile & desktop)
    if (spriteImageRef.current && spriteInfoRef.current) {
      const img = spriteImageRef.current;
      const info = spriteInfoRef.current;
      const exactIndex = normalized * info.totalFrames;
      const sharpIdx = Math.min(info.totalFrames - 1, Math.max(0, Math.floor(exactIndex) % info.totalFrames));

      if (sharpIdx !== currentRenderedFrameIdx.current || forceRedraw) {
        currentRenderedFrameIdx.current = sharpIdx;
        const col = sharpIdx % info.cols;
        const row = Math.floor(sharpIdx / info.cols);
        const srcX = col * info.tileWidth;
        const srcY = row * info.tileHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, srcX, srcY, info.tileWidth, info.tileHeight, 0, 0, canvas.width, canvas.height);
        syncReflectionCanvas();
      }
      return;
    }

    const frames = framesRef.current;
    if (frames && frames.length > 0) {
      const exactIndex = normalized * frames.length;

      // 100% RAZOR-SHARP ZERO-GHOSTING RENDERING:
      // Single discrete frame at 100% opacity. Guarantees 0% smearing, no double-text or ghost trails behind letters on the label!
      // With 180 discrete frames (2.0° per step), motion remains perfectly smooth and crystal clear.
      const sharpIdx = Math.min(frames.length - 1, Math.max(0, Math.floor(exactIndex) % frames.length));

      if (sharpIdx !== currentRenderedFrameIdx.current || forceRedraw) {
        const bitmap = frames[sharpIdx];
        if (bitmap && bitmap.width > 0) {
          currentRenderedFrameIdx.current = sharpIdx;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0;
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          syncReflectionCanvas();
        }
      }
    } else if (videoElementRef.current && videoUrl) {
      const v = videoElementRef.current;
      if (v && v.readyState >= 2 && v.duration) {
        const seekTime = Math.max(0.01, Math.min(v.duration - 0.04, normalized * v.duration));
        if (!v.seeking && Math.abs(v.currentTime - seekTime) > 0.04) {
          v.currentTime = seekTime;
        }
        // ONLY clear canvas if the video is ready to draw and not seeking!
        if (!v.seeking && v.readyState >= 2) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          syncReflectionCanvas();
        }
      }
    }
  }, [videoUrl, syncReflectionCanvas]);

  // Immediate redraw whenever canvas dimensions or layout changes
  useEffect(() => {
    currentRenderedFrameIdx.current = -1;
    drawActiveFrame(currentAngleProgressRef.current, true);
  }, [frameDimensions, drawActiveFrame]);

  // Frame extraction from video with strict aspect ratio preservation, fast 32-bit pixel pipeline and global memory caching
  const extractFramesFromVideo = useCallback(async (
    url: string, 
    fileName: string, 
    mode: ChromaKeyMode, 
    tolerance: number,
    fMode: FramingMode = framingMode,
    cropRatio: number = cropWidthRatio,
    framesCount: number = targetFrameCount
  ) => {
    // 1. First check if already in instant cache
    const cached = getCachedFrames(varietyId);
    if (cached && cached.bitmaps.length > 0 && cached.url === url) {
      framesRef.current = cached.bitmaps;
      setFrameDimensions(cached.dimensions);
      setDetectedAspect(cached.detectedAspect);
      setIsUserVideoLoaded(true);
      setVideoFileName(fileName);
      setVideoUrl(url);
      activeVideoUrlRef.current = url;
      currentRenderedFrameIdx.current = -1;
      setIsExtracting(false);
      drawActiveFrame(currentAngleProgressRef.current, true);
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);

    const result = await extractVideoFramesFast({
      varietyId,
      url,
      fileName,
      chromaMode: mode,
      chromaTolerance: tolerance,
      framingMode: fMode,
      cropWidthRatio: cropRatio,
      targetFrameCount: framesCount,
      onProgress: (pct) => {
        setExtractionProgress(pct);
      },
      onFirstFrame: (frame, dims) => {
        if (framesRef.current.length === 0) {
          framesRef.current = [frame];
          setFrameDimensions(dims);
          drawActiveFrame(currentAngleProgressRef.current, true);
        }
      },
    });

    if (result && result.bitmaps.length > 0) {
      framesRef.current = result.bitmaps;
      setFrameDimensions(result.dimensions);
      setDetectedAspect(result.detectedAspect);
      setIsUserVideoLoaded(true);
      setVideoFileName(fileName);
      setVideoUrl(url);
      activeVideoUrlRef.current = url;
      currentRenderedFrameIdx.current = -1;
      drawActiveFrame(currentAngleProgressRef.current, true);
    }

    setIsExtracting(false);
  }, [varietyId, framingMode, cropWidthRatio, targetFrameCount, drawActiveFrame]);

  // Load saved video from IndexedDB on initial mount, or fallback to bundled video from code (/videos/*.mp4), or procedural 3D frames
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 0. Instant sync cache hit check (0.00s instant switch)
      const cached = getCachedFrames(varietyId);
      if (cached && isMounted) {
        if (cached.spriteImage && cached.spriteInfo) {
          spriteImageRef.current = cached.spriteImage;
          spriteInfoRef.current = cached.spriteInfo;
          setFrameDimensions(cached.dimensions);
          setDetectedAspect(cached.detectedAspect);
          setIsUserVideoLoaded(true);
          setVideoFileName(cached.fileName);
          setVideoUrl(null);
          activeVideoUrlRef.current = null;
          currentRenderedFrameIdx.current = -1;
          setIsExtracting(false);
          drawActiveFrame(currentAngleProgressRef.current, true);
          return;
        } else if (cached.bitmaps.length > 0) {
          framesRef.current = cached.bitmaps;
          setFrameDimensions(cached.dimensions);
          setDetectedAspect(cached.detectedAspect);
          setIsUserVideoLoaded(true);
          setVideoFileName(cached.fileName);
          setVideoUrl(null);
          activeVideoUrlRef.current = null;
          currentRenderedFrameIdx.current = -1;
          setIsExtracting(false);
          drawActiveFrame(currentAngleProgressRef.current, true);
          return;
        }
      }

      // 1. Load high-precision 180-frame sprite sheet for bundled honey varieties (0ms freeze-proof 360° turn)
      const bundledSprite = BUNDLED_VARIETY_SPRITES[varietyId] || BUNDLED_VARIETY_SPRITES[varietyId.toLowerCase()];
      if (bundledSprite && isMounted) {
        try {
          setIsExtracting(true);
          const spriteResult = await loadFramesFromSpriteSheet({
            varietyId,
            spriteInfo: bundledSprite,
            chromaMode: 'none',
            chromaTolerance: 0,
            onProgress: (pct) => {
              if (isMounted) setExtractionProgress(pct);
            },
          });

          if (spriteResult && isMounted) {
            if (spriteResult.spriteImage && spriteResult.spriteInfo) {
              spriteImageRef.current = spriteResult.spriteImage;
              spriteInfoRef.current = spriteResult.spriteInfo;
              setFrameDimensions(spriteResult.dimensions);
              setDetectedAspect('1:1');
              setIsUserVideoLoaded(true);
              setVideoFileName(bundledSprite.fileName);
              setVideoUrl(null);
              activeVideoUrlRef.current = null;
              currentRenderedFrameIdx.current = -1;
              setIsExtracting(false);
              drawActiveFrame(currentAngleProgressRef.current, true);
              return;
            } else if (spriteResult.bitmaps.length > 0) {
              framesRef.current = spriteResult.bitmaps;
              setFrameDimensions(spriteResult.dimensions);
              setDetectedAspect(spriteResult.detectedAspect);
              setIsUserVideoLoaded(true);
              setVideoFileName(bundledSprite.fileName);
              setVideoUrl(null);
              activeVideoUrlRef.current = null;
              currentRenderedFrameIdx.current = -1;
              setIsExtracting(false);
              drawActiveFrame(currentAngleProgressRef.current, true);
              return;
            }
          }
        } catch (err) {
          console.warn('Could not load bundled sprite sheet:', err);
        }
      }

      // 2. Fallback to extracting frames from bundled video (/public/videos/*.mp4) if sprite sheet unavailable
      const bundled = defaultVideoUrl
        ? { url: defaultVideoUrl, fileName: defaultVideoUrl.split('/').pop() || `${varietyId}.mp4` }
        : BUNDLED_VARIETY_VIDEOS[varietyId];

      if (bundled && isMounted) {
        try {
          const effectiveChroma = bundled.fileName.toLowerCase().endsWith('.webm') ? 'none' : chromaMode;
          await extractFramesFromVideo(bundled.url, bundled.fileName, effectiveChroma, chromaTolerance, framingMode, cropWidthRatio, targetFrameCount);
          return;
        } catch (err) {
          console.warn('Could not load bundled video:', err);
        }
      }

      // 4. Procedural fallback with natural 1:1 aspect ratio (96 discrete frames for ultra-smooth rotation without ghosting)
      if (isMounted && framesRef.current.length === 0 && !spriteImageRef.current) {
        try {
          const defaultFrames = await generateTransparent360JarFrames(96, 640, 640);
          if (isMounted && defaultFrames.length > 0) {
            framesRef.current = defaultFrames;
            setFrameDimensions({ width: 640, height: 640 });
            currentRenderedFrameIdx.current = -1;
            // Cache procedural frames so they survive React re-mounts (navigation back from subpage)
            setCachedFrames(varietyId, {
              varietyId,
              bitmaps: defaultFrames,
              dimensions: { width: 640, height: 640 },
              detectedAspect: '1:1',
              fileName: `${varietyId}_procedural`,
              url: `procedural://${varietyId}`,
            });
          }
        } catch (e) {
          console.warn('Could not generate procedural fallback frames:', e);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isActive, varietyId, defaultVideoUrl, chromaMode, chromaTolerance, framingMode, cropWidthRatio, targetFrameCount, extractFramesFromVideo, drawActiveFrame]);

  // Reactive wake-up & frame cache validation when jar enters carousel view
  useEffect(() => {
    isCarouselVisibleRef.current = isCarouselVisible;
    if (isCarouselVisible) {
      // 1. If frames are not yet in framesRef, check cache or initiate load immediately
      if (framesRef.current.length === 0 && !spriteImageRef.current) {
        const cached = getCachedFrames(varietyId);
        if (cached) {
          if (cached.spriteImage && cached.spriteInfo) {
            spriteImageRef.current = cached.spriteImage;
            spriteInfoRef.current = cached.spriteInfo;
            setFrameDimensions(cached.dimensions);
            setDetectedAspect(cached.detectedAspect);
            setIsUserVideoLoaded(true);
            setVideoFileName(cached.fileName);
            setVideoUrl(cached.url);
            activeVideoUrlRef.current = cached.url;
            currentRenderedFrameIdx.current = -1;
            drawActiveFrame(currentAngleProgressRef.current, true);
          } else if (cached.bitmaps.length > 0) {
            framesRef.current = cached.bitmaps;
            setFrameDimensions(cached.dimensions);
            setDetectedAspect(cached.detectedAspect);
            setIsUserVideoLoaded(true);
            setVideoFileName(cached.fileName);
            setVideoUrl(cached.url);
            activeVideoUrlRef.current = cached.url;
            currentRenderedFrameIdx.current = -1;
            drawActiveFrame(currentAngleProgressRef.current, true);
          }
        } else {
          const bundledSprite = BUNDLED_VARIETY_SPRITES[varietyId] || BUNDLED_VARIETY_SPRITES[varietyId.toLowerCase()];
          if (bundledSprite) {
            loadFramesFromSpriteSheet({
              varietyId,
              spriteInfo: bundledSprite,
              chromaMode: 'none',
              chromaTolerance: 0,
            }).then((res) => {
              if (res) {
                if (res.spriteImage && res.spriteInfo) {
                  spriteImageRef.current = res.spriteImage;
                  spriteInfoRef.current = res.spriteInfo;
                  setFrameDimensions(res.dimensions);
                  setDetectedAspect(res.detectedAspect);
                  setIsUserVideoLoaded(true);
                  setVideoFileName(bundledSprite.fileName);
                  setVideoUrl(bundledSprite.videoUrl);
                  activeVideoUrlRef.current = bundledSprite.videoUrl;
                  currentRenderedFrameIdx.current = -1;
                  drawActiveFrame(currentAngleProgressRef.current, true);
                } else if (res.bitmaps.length > 0) {
                  framesRef.current = res.bitmaps;
                  setFrameDimensions(res.dimensions);
                  setDetectedAspect(res.detectedAspect);
                  setIsUserVideoLoaded(true);
                  setVideoFileName(bundledSprite.fileName);
                  setVideoUrl(bundledSprite.videoUrl);
                  activeVideoUrlRef.current = bundledSprite.videoUrl;
                  currentRenderedFrameIdx.current = -1;
                  drawActiveFrame(currentAngleProgressRef.current, true);
                }
              }
            });
          }
        }
      } else {
        // Redraw current frame immediately so jar displays cleanly
        drawActiveFrame(currentAngleProgressRef.current, true);
      }

      // 2. Ensure auto-spin is immediately active
      isAutoSpinActiveRef.current = true;
      autoSpinRampRef.current = 1;
    }
  }, [isCarouselVisible, varietyId, drawActiveFrame]);

  // 60FPS RAF Engine with seamless infinite loop integration & decoupled GPU transform physics (Auto-spin for all jars)
  useEffect(() => {
    let lastTime = performance.now();
    let lastAngleCallbackTime = 0;
    let isVisible = !document.hidden;

    // Visibility and Intersection Observer to pause RAF when offscreen or tab hidden (0% CPU background savings)
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

      if (!isVisible || !isCarouselVisibleRef.current) {
        lastTime = now;
        return;
      }

      // Delta time with bounds [1ms, 50ms] to avoid massive physics leaps on lag spikes
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // 1. Process buffered pointer input deltas inside RAF with sub-pixel precision (active jar only)
      if (isActive && isDraggingRef.current) {
        if (hasPendingPointerDeltaRef.current) {
          const pendingDx = pendingPointerDeltaXRef.current;
          pendingPointerDeltaXRef.current = 0;
          hasPendingPointerDeltaRef.current = false;

          const deltaProgress = (-pendingDx / 440) * (invertDirection ? -1 : 1);
          targetAngleProgressRef.current += deltaProgress;
          currentAngleProgressRef.current = targetAngleProgressRef.current;
        }
      } else {
        // 2. Smooth preset angle navigation (critically damped exponential lerp)
        if (isActive && isNavigatingPresetRef.current) {
          const diff = targetAngleProgressRef.current - currentAngleProgressRef.current;
          if (Math.abs(diff) > 0.00008) {
            // Frame-rate independent exponential lerp
            currentAngleProgressRef.current += diff * (1 - Math.exp(-14 * dt));
          } else {
            currentAngleProgressRef.current = targetAngleProgressRef.current;
            isNavigatingPresetRef.current = false;
          }
        } else {
          // 3. Auto-rotation: smooth turntable idle rotation with gentle ease-in acceleration (active for ALL visible jars)
          const shouldAutoSpin = (autoRotate || isAutoSpinActiveRef.current) && (!isActive || !isDraggingRef.current);
          if (shouldAutoSpin) {
            autoSpinRampRef.current = Math.min(1, autoSpinRampRef.current + dt / 0.8);
            const speed = (invertDirection ? -1 : 1) * autoRotateSpeed * 0.088 * autoSpinRampRef.current; // Natural fluid turntable speed
            targetAngleProgressRef.current += dt * speed;
            currentAngleProgressRef.current += dt * speed;
          } else {
            autoSpinRampRef.current = 0;
            // 4. Momentum inertia decay after user release (seamless 60fps aerodynamic bearing decay)
            if (Math.abs(velocityRef.current) > 0.00005) {
              currentAngleProgressRef.current += velocityRef.current * dt;
              targetAngleProgressRef.current = currentAngleProgressRef.current;

              const damping = Math.exp(-2.2 * dt);
              velocityRef.current *= damping;

              if (Math.abs(velocityRef.current) <= 0.0001) {
                velocityRef.current = 0;
              }
            }
          }
        }
      }

      // Periodically offset large values to avoid IEEE 754 precision loss while preserving exact position
      if (Math.abs(targetAngleProgressRef.current) > 100) {
        const fullTurns = Math.floor(targetAngleProgressRef.current);
        targetAngleProgressRef.current -= fullTurns;
        currentAngleProgressRef.current -= fullTurns;
      }

      // 5. Render active frame onto hardware-accelerated Canvas
      drawActiveFrame(currentAngleProgressRef.current, currentRenderedFrameIdx.current === -1);

      // Always guarantee reflection canvas is rendered and in sync with active frame
      if (reflectionCanvasRef.current && canvasRef.current) {
        if (lastReflectedFrameIdx.current !== currentRenderedFrameIdx.current) {
          syncReflectionCanvas();
        }
      }

      // 6. Calculate normalized 360° angle and discrete degree
      const current = currentAngleProgressRef.current;
      const normalizedP = ((current % 1) + 1) % 1;
      const deg360 = Math.round(normalizedP * 360) % 360;

      // 7. Pseudo-3D subtle perspective tilt & shadow response based on movement
      const effectiveVelocity = isDraggingRef.current 
        ? (velocitySamplesRef.current.length > 0 ? velocitySamplesRef.current[velocitySamplesRef.current.length - 1].velocity : 0)
        : velocityRef.current;

      const targetTiltY = Math.max(-5, Math.min(5, effectiveVelocity * -1.8));
      const targetTiltZ = Math.max(-1.5, Math.min(1.5, effectiveVelocity * -0.6));
      currentTiltYRef.current += (targetTiltY - currentTiltYRef.current) * (1 - Math.exp(-12 * dt));
      currentTiltZRef.current += (targetTiltZ - currentTiltZRef.current) * (1 - Math.exp(-12 * dt));

      if (canvasRef.current) {
        const scaleVal = (isActive && isDraggingRef.current) ? 0.985 : 1.0;
        const baseTiltX = (isActive && isEditorialTiltActive) ? 3.5 : 0;
        const baseTiltZ = (isActive && isEditorialTiltActive) ? -1.8 : 0;
        const tiltY = isActive ? currentTiltYRef.current.toFixed(2) : '0';
        const tiltZ = isActive ? (baseTiltZ + currentTiltZRef.current).toFixed(2) : '0';
        canvasRef.current.style.transform = `perspective(1000px) rotateX(${baseTiltX}deg) rotateY(${tiltY}deg) rotateZ(${tiltZ}deg) scale(${scaleVal})`;

        if (reflectionCanvasRef.current) {
          reflectionCanvasRef.current.style.transform = canvasRef.current.style.transform;
        }
      }

      // Dynamic reactive floor shadow shift with editorial tilt support
      if (groundShadowRef.current) {
        if (isActive) {
          const shadowShiftX = isEditorialTiltActive ? Math.max(-14, Math.min(14, currentTiltYRef.current * 1.8)) : 0;
          const shadowScaleX = 1.0 + Math.abs(currentTiltYRef.current) * 0.03;
          const shadowRotZ = isEditorialTiltActive ? -1.5 : 0;
          groundShadowRef.current.style.transform = `translateX(calc(-50% + ${shadowShiftX.toFixed(1)}px)) rotateZ(${shadowRotZ}deg) scaleX(${shadowScaleX.toFixed(2)})`;
        } else {
          // Słoiki boczne: cień idealnie centryczny pod słoikiem, zero bocznego przesunięcia i zero rotacji
          groundShadowRef.current.style.transform = 'translateX(-50%)';
        }
      }

      // 8. Zone-Triggered Hotspot State & External Notification (Active Jar only - 0% React re-renders on background jars)
      if (isActive) {
        let computedHotspotKey: 'h0' | 'h120' | 'h240' = 'h0';
        if (deg360 >= 60 && deg360 < 180) {
          computedHotspotKey = 'h120';
        } else if (deg360 >= 180 && deg360 < 300) {
          computedHotspotKey = 'h240';
        } else {
          computedHotspotKey = 'h0';
        }

        if (computedHotspotKey !== activeHotspotKeyRef.current) {
          activeHotspotKeyRef.current = computedHotspotKey;
          setActiveHotspotKey(computedHotspotKey);
        }

        // 10. Throttled external parent notification (~10 times/sec maximum)
        if (onAngleChange && now - lastAngleCallbackTime > 100) {
          lastAngleCallbackTime = now;
          onAngleChange(deg360);
        }
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (observer) {
        observer.disconnect();
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isActive, isCarouselVisible, autoRotate, autoRotateSpeed, invertDirection, drawActiveFrame, isEditorialTiltActive, onAngleChange]);

  // Pointer drag interactions with Pointer Capture for infinite continuous dragging across the screen
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    // Pause auto rotation immediately when user touches the jar
    pauseAutoSpin();
    isNavigatingPresetRef.current = false;
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    pendingPointerDeltaXRef.current = 0;
    hasPendingPointerDeltaRef.current = false;
    // Catch the spinning object immediately on grab
    velocityRef.current = 0;
    velocitySamplesRef.current = [];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    pauseAutoSpin();
    const now = performance.now();
    const lastTime = lastPointerTimeRef.current || now;
    const dt = Math.max(1, now - lastTime);
    const currentX = e.clientX;
    const dx = currentX - (lastPointerXRef.current ?? currentX);
    lastPointerXRef.current = currentX;
    lastPointerTimeRef.current = now;

    // Buffer delta for the 60fps RAF loop
    pendingPointerDeltaXRef.current += dx;
    hasPendingPointerDeltaRef.current = true;

    // Track instant velocity in turns per second
    const deltaProgress = (-dx / 440) * (invertDirection ? -1 : 1);
    const instantVelocity = deltaProgress / (dt / 1000);
    velocitySamplesRef.current.push({ time: now, velocity: instantVelocity });
    velocitySamplesRef.current = velocitySamplesRef.current.filter((s) => now - s.time < 120);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isDraggingRef.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    isDraggingRef.current = false;

    const now = performance.now();
    const lastTime = lastPointerTimeRef.current || now;

    // If user paused/held still before releasing (> 80ms), stop without spinning
    if (now - lastTime > 80 || velocitySamplesRef.current.length === 0) {
      velocityRef.current = 0;
    } else {
      // Calculate weighted velocity average for smooth, predictable release
      let totalWeight = 0;
      let weightedSum = 0;
      for (const sample of velocitySamplesRef.current) {
        const age = now - sample.time;
        const weight = Math.max(0.1, 1 - age / 120);
        weightedSum += sample.velocity * weight;
        totalWeight += weight;
      }
      const avgVelocity = totalWeight > 0 ? weightedSum / totalWeight : 0;
      // Clamp velocity to pleasant max speed (max ±2.8 revolutions per second)
      velocityRef.current = Math.max(-2.8, Math.min(2.8, avgVelocity));
    }
    velocitySamplesRef.current = [];

    // Schedule auto spin to resume after a calm delay of 2.5 seconds
    scheduleAutoSpinResume(2500);
  };

  // Interactive 360 Scrubber / Suwak Obrotu handler
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pauseAutoSpin();
    isNavigatingPresetRef.current = false;
    const newDeg = Number(e.target.value);
    const normalizedTarget = newDeg / 360;
    
    // Find closest integer turn to preserve smooth infinite continuity
    const currentTurn = Math.floor(currentAngleProgressRef.current);
    targetAngleProgressRef.current = currentTurn + normalizedTarget;
    currentAngleProgressRef.current = currentTurn + normalizedTarget;
    velocityRef.current = 0;
    scheduleAutoSpinResume(3000);
  };

  // Step rotation nudge by specified degrees (infinite wrap-around)
  const stepRotationDegrees = (degDelta: number) => {
    pauseAutoSpin();
    isNavigatingPresetRef.current = true;
    const progressDelta = degDelta / 360;
    targetAngleProgressRef.current += progressDelta;
    velocityRef.current = 0;
    scheduleAutoSpinResume(4000);
  };

  // Quick preset angle jumps with silky-smooth RAF spring interpolation
  const setAnglePreset = (targetDegree: number, resumeDelayMs: number = 2500) => {
    pauseAutoSpin();
    isNavigatingPresetRef.current = true;
    const normalizedTarget = ((targetDegree / 360) % 1 + 1) % 1;
    const currentNorm = ((currentAngleProgressRef.current % 1) + 1) % 1;
    let diff = normalizedTarget - currentNorm;
    if (diff > 0.5) diff -= 1;
    if (diff < -0.5) diff += 1;
    targetAngleProgressRef.current = currentAngleProgressRef.current + diff;
    velocityRef.current = 0;
    scheduleAutoSpinResume(resumeDelayMs);
  };

  // Sync external angle preset requests from parent Hero component
  useEffect(() => {
    if (typeof targetAnglePreset === 'number') {
      setAnglePreset(targetAnglePreset, 2500);
    }
  }, [targetAnglePreset]);

  // Handle carousel active front jar vs background side jar transitions
  useEffect(() => {
    const wasActive = prevIsActiveRef.current;
    prevIsActiveRef.current = isActive;

    if (!wasActive && isActive) {
      // Słoik stał się głównym słoikiem z przodu:
      // Ustawia się przodem (etykietą 0°), zatrzymuje na krótką chwilę (~1.2s),
      // a po chwili płynnie wraca do automatycznego obrotu!
      setAnglePreset(0, 1200);
    } else if (!isActive) {
      // Boczne słoiki: ZAWSZE obracają się automatycznie i bez przerw!
      isAutoSpinActiveRef.current = true;
      isNavigatingPresetRef.current = false;
      if (idleResumeTimerRef.current) {
        clearTimeout(idleResumeTimerRef.current);
        idleResumeTimerRef.current = null;
      }
    }
  }, [isActive]);

  // Active hotspots for the selected honey variety
  const varietyHotspots = getVarietyHotspots(varietyId);
  const h0Hotspot = varietyHotspots.find(h => h.angle === 0) || varietyHotspots[0];
  const h120Hotspot = varietyHotspots.find(h => h.angle === 120) || varietyHotspots[1] || varietyHotspots[0];
  const h240Hotspot = varietyHotspots.find(h => h.angle === 240) || varietyHotspots[2] || varietyHotspots[0];

  const renderHotspotIcon = (iconName: string, ambientColor: string) => {
    switch (iconName) {
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5" style={{ color: ambientColor }} />;
      case 'heart':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'trees':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="w-3.5 h-3.5" style={{ color: ambientColor }} />;
      case 'feather':
        return <Feather className="w-3.5 h-3.5 text-amber-200" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'sun':
        return <Sun className="w-3.5 h-3.5 text-amber-300" />;
      case 'droplets':
        return <Droplets className="w-3.5 h-3.5" style={{ color: ambientColor }} />;
      case 'shield':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" style={{ color: ambientColor }} />;
    }
  };

  return (
    <div 
      className="relative w-full flex flex-col items-center select-none overflow-visible pointer-events-none"
    >
      {/* Hidden reference video for custom user upload fallback only - never preloads when sprite is active */}
      {videoUrl && !spriteImageRef.current && framesRef.current.length === 0 && (
        <video
          ref={videoElementRef}
          src={videoUrl}
          playsInline
          muted
          loop
          preload="none"
          className="hidden"
        />
      )}

      {/* MAIN FRAMELESS STAGE: Infinite drag rotation strictly bounded to jar silhouette (page scrolls naturally on wheel) */}
      <div
        ref={stageRef}
        data-frameless-360-stage="true"
        onPointerDown={isActive ? handlePointerDown : undefined}
        onPointerMove={isActive ? handlePointerMove : undefined}
        onPointerUp={isActive ? handlePointerUp : undefined}
        onPointerCancel={isActive ? handlePointerUp : undefined}
        onTouchStart={isActive ? (e) => e.stopPropagation() : undefined}
        onTouchMove={isActive ? (e) => e.stopPropagation() : undefined}
        onTouchEnd={isActive ? (e) => e.stopPropagation() : undefined}
        style={{
          aspectRatio: `${frameDimensions.width} / ${frameDimensions.height}`,
          touchAction: 'pan-y',
        }}
        className="relative w-full max-h-[min(68vh,600px)] flex items-center justify-center cursor-grab active:cursor-grabbing group no-drag overflow-visible pointer-events-auto"
      >
        {/* ATMOSPHERIC RADIAL BACKLIGHT GLOW (Tylko dla aktywnego słoika centralnego; słoiki boczne mają dedykowaną warstwę z-index: 4) */}
        {isActive && (
          <div 
            className="absolute inset-x-8 top-8 bottom-14 pointer-events-none transition-all duration-700 opacity-60 group-hover:opacity-85"
            style={{
              background: `radial-gradient(ellipse 65% 65% at 50% 50%, ${ambientToneHex}45 0%, ${ambientToneHex}10 50%, transparent 75%)`,
            }}
          />
        )}

        {/* ORGANIC GROUND CONTACT SHADOWS (Tylko dla aktywnego słoika; słoiki boczne są uziemione za wstęgą na z-index: 4) */}
        {isActive && (
          <div 
            ref={groundShadowRef}
            className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 w-[70%] h-10 pointer-events-none will-change-transform"
          >
            <div className="w-full h-full rounded-[100%] bg-black/60 blur-xl" />
            <div className="absolute inset-x-[15%] bottom-1 h-5 rounded-[100%] bg-black/80 blur-md" />
            {/* Golden amber caustic floor pool */}
            <div 
              className="absolute inset-x-[12%] bottom-1 h-6 rounded-[100%] blur-md opacity-40"
              style={{
                background: `radial-gradient(ellipse at center, ${ambientToneHex} 0%, transparent 75%)`
              }}
            />
          </div>
        )}

        {/* STUDIO FLOOR MIRROR REFLECTION OF JAR IN REFLECTIVE DARK SURFACE (Active & Orbiting Jars) */}
        <canvas
          ref={reflectionCanvasRef}
          width={frameDimensions.width}
          height={Math.round(frameDimensions.height * 0.70)}
          className="absolute left-0 w-full pointer-events-none select-none will-change-transform"
          style={{
            top: '91.5%',
            height: '70%',
            filter: 'blur(1.4px) brightness(0.92)',
            opacity: isActive ? 0.80 : 0.48,
            zIndex: 2,
            transformOrigin: '50% 0%',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.35) 55%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.35) 55%, transparent 95%)',
          }}
        />

        {/* 60FPS HARDWARE-ACCELERATED TRANSPARENT CANVAS: Pixel-perfect aspect ratio, ZERO artificial drop-shadow leaking onto ribbon */}
        <canvas
          ref={canvasRef}
          width={frameDimensions.width}
          height={frameDimensions.height}
          className="relative z-10 w-full h-full object-contain pointer-events-none will-change-transform"
          style={{
            // Czysta, naturalna ekspozycja szkła bez sztucznego przyciemniania krawędzi słoika
            filter: 'contrast(1.01) saturate(1.04)',
            imageRendering: 'auto',
          }}
        />

        {/* INTERACTIVE ROTATION-BASED POPUPS */}
        {/* Rendered via portal into #jar-popups-portal-target (z-index: 60) so they always remain completely in front of the honey ribbon */}
        {isActive && (() => {
          const popupsContent = (
            <div className="absolute inset-0 pointer-events-none">
              {activeHotspotKey === 'h0' && (
                <div
                  key="h0-hotspot"
                  className="animate-hotspot-left absolute z-50 -top-7 sm:-top-6 lg:-top-8 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-3.5 md:left-3 lg:left-[52px] xl:left-[48px] w-[92%] max-w-[290px] sm:w-[280px] pointer-events-none"
                >
                  <div className="relative flex flex-col items-center sm:items-start text-center sm:text-left py-1">
                    {/* Subtelna winieta w tle dla idealnej czytelności bez twardych krawędzi */}
                    <div className="absolute inset-0 bg-[#0A0705]/65 blur-[26px] -m-6 sm:-m-10 rounded-full -z-10 pointer-events-none" />
                    
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 sm:mb-1.5">
                      <span 
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ color: ambientToneHex }}
                      >
                        {renderHotspotIcon(h0Hotspot.iconName, ambientToneHex)} {h0Hotspot.badge}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#E8E0D2]/80 uppercase tracking-widest border-l border-white/20 pl-2">
                        {h0Hotspot.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-3xl font-serif font-black text-[#FAF7F2] leading-[1.15] mb-1 sm:mb-2.5 [text-shadow:0_4px_24px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,0.8)]">
                      {h0Hotspot.title}
                    </h3>
                    <p className="text-[11px] sm:text-[13px] text-[#E8E0D2] font-normal leading-relaxed line-clamp-2 sm:line-clamp-none [text-shadow:0_2px_16px_rgba(0,0,0,0.95),0_1px_4px_rgba(0,0,0,0.9)]">
                      {h0Hotspot.description}
                    </p>
                  </div>
                </div>
              )}

              {activeHotspotKey === 'h120' && (
                <div
                  key="h120-hotspot"
                  className="animate-hotspot-right absolute z-50 -top-7 sm:top-auto sm:-bottom-5 lg:-bottom-7 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto right-auto sm:right-3.5 md:right-3 lg:right-[52px] xl:right-[48px] w-[92%] max-w-[290px] sm:w-[280px] pointer-events-none flex flex-col items-center sm:items-end text-center sm:text-right"
                >
                  <div className="relative flex flex-col items-center sm:items-end text-center sm:text-right py-1">
                    {/* Subtelna winieta w tle dla idealnej czytelności bez twardych krawędzi */}
                    <div className="absolute inset-0 bg-[#0A0705]/65 blur-[26px] -m-6 sm:-m-10 rounded-full -z-10 pointer-events-none" />

                    <div className="flex items-center justify-center sm:justify-end gap-2 mb-1 sm:mb-1.5">
                      <span className="text-[9px] sm:text-[10px] text-[#E8E0D2]/80 uppercase tracking-widest border-r border-white/20 pr-2">
                        {h120Hotspot.category}
                      </span>
                      <span 
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ color: ambientToneHex }}
                      >
                        {renderHotspotIcon(h120Hotspot.iconName, ambientToneHex)} {h120Hotspot.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-3xl font-serif font-black text-[#FAF7F2] leading-[1.15] mb-1 sm:mb-2.5 [text-shadow:0_4px_24px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,0.8)]">
                      {h120Hotspot.title}
                    </h3>
                    <p className="text-[11px] sm:text-[13px] text-[#E8E0D2] font-normal leading-relaxed line-clamp-2 sm:line-clamp-none [text-shadow:0_2px_16px_rgba(0,0,0,0.95),0_1px_4px_rgba(0,0,0,0.9)]">
                      {h120Hotspot.description}
                    </p>
                  </div>
                </div>
              )}

              {activeHotspotKey === 'h240' && (
                <div
                  key="h240-hotspot"
                  className="animate-hotspot-down absolute z-50 -top-7 sm:-top-6 lg:-top-8 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto right-auto sm:right-3.5 md:right-3 lg:right-[52px] xl:right-[48px] w-[92%] max-w-[290px] sm:w-[280px] pointer-events-none flex flex-col items-center sm:items-end text-center sm:text-right"
                >
                  <div className="relative flex flex-col items-center sm:items-end text-center sm:text-right py-1">
                    {/* Subtelna winieta w tle dla idealnej czytelności bez twardych krawędzi */}
                    <div className="absolute inset-0 bg-[#0A0705]/65 blur-[26px] -m-6 sm:-m-10 rounded-full -z-10 pointer-events-none" />

                    <div className="flex items-center justify-center sm:justify-end gap-2 mb-1 sm:mb-1.5">
                      <span className="text-[9px] sm:text-[10px] text-[#E8E0D2]/80 uppercase tracking-widest border-r border-white/20 pr-2">
                        {h240Hotspot.category}
                      </span>
                      <span 
                        className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]"
                        style={{ color: ambientToneHex }}
                      >
                        {renderHotspotIcon(h240Hotspot.iconName, ambientToneHex)} {h240Hotspot.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-3xl font-serif font-black text-[#FAF7F2] leading-[1.15] mb-1 sm:mb-2.5 [text-shadow:0_4px_24px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,0.8)]">
                      {h240Hotspot.title}
                    </h3>
                    <p className="text-[11px] sm:text-[13px] text-[#E8E0D2] font-normal leading-relaxed line-clamp-2 sm:line-clamp-none [text-shadow:0_2px_16px_rgba(0,0,0,0.95),0_1px_4px_rgba(0,0,0,0.9)]">
                      {h240Hotspot.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );

          return (portalElement && typeof document !== 'undefined' && document.body.contains(portalElement))
            ? createPortal(popupsContent, portalElement)
            : popupsContent;
        })()}
      </div>
    </div>
  );
};


