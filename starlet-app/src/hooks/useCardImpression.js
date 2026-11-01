import { useEffect, useRef } from 'react';
import { recordViewportPass } from '../engine/habituationEngine';

/**
 * useCardImpression Hook
 * 
 * Passively observes when a card lingers in the viewport for >= 1.2s
 * to increment the anti-habituation pass count without extra re-renders.
 */
export function useCardImpression(performerId) {
  const elementRef = useRef(null);
  const timerRef = useRef(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current || !performerId || recordedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!timerRef.current && !recordedRef.current) {
            timerRef.current = setTimeout(() => {
              recordViewportPass(performerId);
              recordedRef.current = true;
            }, 1200);
          }
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [performerId]);

  return elementRef;
}

