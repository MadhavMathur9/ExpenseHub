import { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  format?: (val: number) => string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedNumber smoothly counts up from 0 to value when entering the viewport.
 * Guarantees ending on the exact value with custom formatting and reduced motion support.
 */
export function AnimatedNumber({
  value,
  duration = 0.75,
  delay = 0,
  format,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const [displayValue, setDisplayValue] = useState<number>(shouldReduceMotion ? value : 0);
  const prevValueRef = useRef<number>(shouldReduceMotion ? value : 0);
  const hasAnimatedInitRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    if (!isInView && !hasAnimatedInitRef.current) {
      return;
    }

    const isFirstRun = !hasAnimatedInitRef.current;
    const startVal = isFirstRun ? 0 : prevValueRef.current;
    const endVal = value;

    if (!isFirstRun && startVal === endVal) {
      return;
    }

    hasAnimatedInitRef.current = true;
    prevValueRef.current = endVal;

    let startTime: number | null = null;
    let animationFrameId: number;

    const durationMs = duration * 1000;
    const delayMs = isFirstRun ? delay * 1000 : 0;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        // Natural cubic ease-out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (endVal - startVal) * easeOut;

        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(endVal); // Guarantee precision on exact target
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, duration, delay, shouldReduceMotion]);

  const formatted = format
    ? format(displayValue)
    : decimals > 0
    ? displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : Math.round(displayValue).toLocaleString('en-US');

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
