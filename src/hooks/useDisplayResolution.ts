import { useState, useEffect } from 'react';

export type DisplayMode = 'auto' | 'standard-16-9' | 'ultrawide-21-9' | 'laptop';

export interface DisplayInfo {
  mode: DisplayMode;
  detectedRatio: number; // width / height
  detectedRatioLabel: string; // e.g. '21:9' or '16:9'
  isUltrawide: boolean; // >= 2.05:1 (e.g. 34-inch monitors)
  isLargeDesktop: boolean; // 27" / 4K or >= 1920px
  screenName: string; // e.g. "Monitor 34″ Ultrawide (21:9)"
  windowWidth: number;
  windowHeight: number;
  containerClass: string;
}

export function useDisplayResolution() {
  const [mode, setMode] = useState<DisplayMode>(() => {
    try {
      const saved = localStorage.getItem('warmia_display_mode');
      if (saved === 'standard-16-9' || saved === 'ultrawide-21-9' || saved === 'laptop') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'auto';
  });

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSetMode = (newMode: DisplayMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('warmia_display_mode', newMode);
    } catch {
      // ignore
    }
  };

  const ratio = windowSize.width / Math.max(1, windowSize.height);
  const isPhysicallyUltrawide = ratio >= 2.05 || (typeof window !== 'undefined' && window.screen.width / Math.max(1, window.screen.height) >= 2.05);
  const isLarge = windowSize.width >= 1600;

  // Derive active format based on mode
  const effectiveUltrawide = mode === 'ultrawide-21-9' || (mode === 'auto' && isPhysicallyUltrawide);
  const effective169 = mode === 'standard-16-9' || (mode === 'auto' && !isPhysicallyUltrawide && isLarge);
  const effectiveLaptop = mode === 'laptop' || (mode === 'auto' && !isPhysicallyUltrawide && !isLarge);

  let detectedRatioLabel = '16:9';
  let screenName = 'Monitor 24″-27″ Standard (16:9)';

  if (ratio >= 2.2) {
    detectedRatioLabel = '21:9';
    screenName = 'Monitor 34″ Ultrawide (21:9 Kinowy)';
  } else if (ratio >= 3.0) {
    detectedRatioLabel = '32:9';
    screenName = 'Monitor Super Ultrawide (32:9)';
  } else if (ratio >= 1.7) {
    detectedRatioLabel = '16:9';
    if (windowSize.width >= 2400) {
      screenName = 'Monitor 27″-32″ QHD/4K (16:9)';
    } else {
      screenName = 'Monitor 24″-27″ FHD (16:9)';
    }
  } else if (ratio >= 1.55) {
    detectedRatioLabel = '16:10';
    screenName = 'Ekran Laptopa / Biurowy (16:10)';
  } else {
    detectedRatioLabel = 'Pionowy / Mobilny';
    screenName = 'Ekran Kompaktowy / Pionowy';
  }

  // Active container class according to mode / viewport width
  let containerClass = 'max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1720px]';
  if (effectiveUltrawide) {
    containerClass = 'max-w-[1720px]';
  } else if (effectiveLaptop) {
    containerClass = 'max-w-7xl xl:max-w-[1360px]';
  } else if (effective169) {
    containerClass = 'max-w-[1440px]';
  }

  return {
    mode,
    setMode: handleSetMode,
    detectedRatio: ratio,
    detectedRatioLabel,
    isUltrawide: effectiveUltrawide,
    isLargeDesktop: effective169 || effectiveUltrawide,
    effectiveLaptop,
    screenName,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
    containerClass,
  };
}
