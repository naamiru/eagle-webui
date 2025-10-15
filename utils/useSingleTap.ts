import { useCallback, useRef } from "react";

type SingleTapOptions = {
  onSingleTap: (e: PointerEvent) => void;
  /** Delay (ms) before confirming a single tap to ensure no double tap occurs */
  doubleTapDelay?: number; // default 300
  /** Maximum movement (px) allowed during a tap; beyond this is considered a swipe */
  moveThreshold?: number; // default 10
  /** Maximum duration (ms) for a tap; longer presses are ignored */
  tapMaxDuration?: number; // default 300
  /** Distance (px) threshold for detecting two taps as the same location */
  doubleSpatialThreshold?: number; // default 24
};

/**
 * React hook to detect a *single tap* gesture on mobile devices.
 * - Excludes double taps (waits a short delay before firing)
 * - Excludes swipes (movement beyond threshold)
 * - Excludes long presses (duration beyond limit)
 */
export function useSingleTap(opts: SingleTapOptions) {
  const {
    onSingleTap,
    doubleTapDelay = 300,
    moveThreshold = 10,
    tapMaxDuration = 300,
    doubleSpatialThreshold = 24,
  } = opts;

  const activeIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const movedRef = useRef(false);

  const lastTapTimeRef = useRef(0);
  const lastTapXRef = useRef(0);
  const lastTapYRef = useRef(0);
  const singleTimerRef = useRef<number | null>(null);

  const clearSingleTimer = useCallback(() => {
    if (singleTimerRef.current != null) {
      window.clearTimeout(singleTimerRef.current);
      singleTimerRef.current = null;
    }
  }, []);

  const resetActive = useCallback(() => {
    activeIdRef.current = null;
    movedRef.current = false;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || e.isPrimary === false) return;
    activeIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startTimeRef.current = performance.now();
    movedRef.current = false;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch" || activeIdRef.current !== e.pointerId)
        return;
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;
      if (dx * dx + dy * dy > moveThreshold * moveThreshold) {
        movedRef.current = true; // Considered a swipe
      }
    },
    [moveThreshold]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "touch" || activeIdRef.current !== e.pointerId)
        return;
      resetActive();
    },
    [resetActive]
  );

  const onPointerUp = useCallback(
    (reactEvent: React.PointerEvent) => {
      if (reactEvent.pointerType !== "touch") return;
      if (activeIdRef.current !== reactEvent.pointerId) return;

      const now = performance.now();
      const duration = now - startTimeRef.current;
      const endX = reactEvent.clientX;
      const endY = reactEvent.clientY;
      const moved = movedRef.current;

      resetActive();

      // Ignore if too long or moved too far
      if (moved || duration > tapMaxDuration) return;

      const prevTime = lastTapTimeRef.current;
      const prevX = lastTapXRef.current;
      const prevY = lastTapYRef.current;

      const dist2 = (endX - prevX) ** 2 + (endY - prevY) ** 2;
      const isWithinDoubleWindow = now - prevTime <= doubleTapDelay;
      const isWithinSpatial = dist2 <= doubleSpatialThreshold ** 2;

      // If another tap occurs quickly in the same spot → skip single tap (double tap)
      if (isWithinDoubleWindow && isWithinSpatial) {
        clearSingleTimer();
        lastTapTimeRef.current = 0;
        return;
      }

      // Otherwise, confirm single tap after delay
      lastTapTimeRef.current = now;
      lastTapXRef.current = endX;
      lastTapYRef.current = endY;

      clearSingleTimer();
      singleTimerRef.current = window.setTimeout(() => {
        singleTimerRef.current = null;
        onSingleTap(reactEvent.nativeEvent);
        lastTapTimeRef.current = 0;
      }, doubleTapDelay);
    },
    [
      doubleTapDelay,
      doubleSpatialThreshold,
      onSingleTap,
      tapMaxDuration,
      clearSingleTimer,
      resetActive,
    ]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } as const;
}
