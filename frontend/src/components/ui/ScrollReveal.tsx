import { type ReactNode } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  threshold?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

/**
 * ScrollReveal smoothly fades and translates an element into view when entering viewport.
 * Disconnects once triggered and respects reduced-motion preferences.
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.9,
  yOffset = 18,
  threshold = 0.08,
  direction = 'up',
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: yOffset, x: 0 };
      case 'down':
        return { opacity: 0, y: -yOffset, x: 0 };
      case 'left':
        return { opacity: 0, x: yOffset, y: 0 };
      case 'right':
        return { opacity: 0, x: -yOffset, y: 0 };
      case 'none':
      default:
        return { opacity: 0, x: 0, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialOffset()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // smooth, premium ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  threshold?: number;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.12,
  delayChildren = 0,
  threshold = 0.08,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
}

export function StaggerItem({
  children,
  className = '',
  yOffset = 18,
  duration = 0.85,
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
