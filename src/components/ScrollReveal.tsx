import React, { useEffect, useRef, useState } from 'react';

export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /**
   * Direction of the subtle initial offset.
   * Defaults to 'up' (slides slightly upwards into place).
   */
  direction?: ScrollRevealDirection;
  /**
   * Delay in seconds before triggering the transition once visible.
   * Useful for stagger sequences (e.g. 0.1, 0.2, 0.3).
   */
  delay?: number;
  /**
   * Transition duration in seconds. Defaults to 0.7s.
   */
  duration?: number;
  /**
   * Distance in pixels of the initial displacement. Defaults to 24px.
   */
  distance?: number;
  /**
   * Intersection threshold (0.0 to 1.0). Defaults to 0.15.
   */
  threshold?: number;
  /**
   * Intersection observer rootMargin (e.g. '0px 0px -50px 0px').
   */
  rootMargin?: string;
  /**
   * Optional custom className applied to the wrapper element.
   */
  className?: string;
  /**
   * HTML tag to render. Defaults to 'div'.
   */
  as?: keyof React.JSX.IntrinsicElements;
  /**
   * If true, animation repeats whenever entering viewport. Defaults to false (triggers once).
   */
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.7,
  distance = 24,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  as: Component = 'div',
  once = true,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect user's accessibility preferences for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver is not supported (SSR or legacy browsers), display immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    // Fallback timer: if observer doesn't fire within 900ms (e.g. edge browser quirks), ensure content shows
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 900);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            clearTimeout(fallbackTimer);
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  // Compute offset transform based on direction
  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'none':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: getTransform(),
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}s`,
    transitionDelay: `${delay}s`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth ease-out-expo curve
    willChange: isVisible ? 'auto' : 'opacity, transform',
  };

  const ComponentTag = Component as any;

  return (
    <ComponentTag ref={ref} style={style} className={className}>
      {children}
    </ComponentTag>
  );
};

