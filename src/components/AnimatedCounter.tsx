'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { formatNumber } from '@/utils/formatNumber';

interface AnimatedCounterProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  duration?: number; // Duration in seconds
  slow?: boolean; // Use slower spring animation for large stat numbers
}

export default function AnimatedCounter({
  value,
  direction = 'up',
  className = '',
  duration = 1,
  slow = false,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, slow ? {
    bounce: 0,
    duration: 8000.0,
  } : {
    bounce: 0,
    duration: 0.8
  });

  useEffect(() => {
    motionValue.set(direction === 'down' ? 0 : value);
  }, [motionValue, value, direction]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatNumber(Math.floor(latest));
      }
    });

    // Set initial value immediately
    if (ref.current) {
      ref.current.textContent = formatNumber(motionValue.get());
    }

    return () => unsubscribe();
  }, [springValue, motionValue]);

  return <span className={className} ref={ref}>{formatNumber(direction === 'down' ? value : 0)}</span>;
}
