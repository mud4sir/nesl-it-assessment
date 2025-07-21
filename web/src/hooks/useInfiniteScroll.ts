import { useState, useEffect, useCallback, useRef } from 'react';

interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll(
  callback: () => void,
  options: InfiniteScrollOptions = {}
) {
  const [targetRef, setTargetRef] = useState<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useRef(false);
  const callbackRef = useRef(callback);

  const { threshold = 1.0, rootMargin = '100px' } = options;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isFetchingRef.current) {
      isFetchingRef.current = true;
      callbackRef.current();
    }
  }, []);

  useEffect(() => {
    if (!targetRef) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(targetRef);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [targetRef, handleIntersection, threshold, rootMargin]);

  const resetFetching = useCallback(() => {
    isFetchingRef.current = false;
  }, []);

  return { setTargetRef, resetFetching };
}