'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { formatNumber } from '@/utils/formatNumber';

interface AnimatedCounterProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  duration?: number; // Duration in seconds
}

export default function AnimatedCounter({
  value,
  direction = 'up',
  className = '',
  duration = 1,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === 'down' ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 300,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: '-10px' });

  useEffect(() => {
    if (isInView) {
      motionValue.set(direction === 'down' ? 0 : value);
    }
  }, [motionValue, isInView, value, direction]);

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

  // Handle case where animated value might change after initial mount
  useEffect(() => {
     if(isInView) {
        motionValue.set(value);
     }
  }, [value, isInView, motionValue]);


  return <span className={className} ref={ref}>{formatNumber(direction === 'down' ? value : 0)}</span>;
}
