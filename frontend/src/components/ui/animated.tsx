"use client";

import { motion, HTMLMotionProps, Transition } from "motion/react";
import { fadeIn, slideUp, scale, cardHover, springTransition, shake } from "@/lib/animations";

interface AnimatedProps extends HTMLMotionProps<"div"> {
  variant?: "fadeIn" | "slideUp" | "scale" | "cardHover" | "shake";
  delay?: number;
  duration?: number;
}

type VariantType = {
  initial: any;
  animate?: any;
  exit?: any;
  hover?: any;
};

const variants: Record<string, VariantType> = {
  fadeIn,
  slideUp,
  scale,
  cardHover,
  shake,
};

export function Animated({
  children,
  variant = "fadeIn",
  delay = 0,
  duration,
  className,
  ...props
}: AnimatedProps) {
  const selectedVariant = variants[variant];
  
  const transition: Transition = {
    ...springTransition,
    delay,
    ...(duration && { duration }),
  } as Transition;

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      whileHover={variant === "cardHover" ? selectedVariant.hover : undefined}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Specific animated components for common use cases
export function FadeIn({ children, delay = 0, ...props }: Omit<AnimatedProps, "variant">) {
  return (
    <Animated variant="fadeIn" delay={delay} {...props}>
      {children}
    </Animated>
  );
}

export function SlideUp({ children, delay = 0, ...props }: Omit<AnimatedProps, "variant">) {
  return (
    <Animated variant="slideUp" delay={delay} {...props}>
      {children}
    </Animated>
  );
}

export function AnimatedCard({ children, ...props }: Omit<AnimatedProps, "variant">) {
  return (
    <Animated variant="cardHover" {...props}>
      {children}
    </Animated>
  );
}

export function Shake({ children, ...props }: Omit<AnimatedProps, "variant">) {
  return (
    <Animated variant="shake" {...props}>
      {children}
    </Animated>
  );
} 