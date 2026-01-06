// Animation variants for Framer Motion
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const shake = {
  initial: { x: 0 },
  animate: { 
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.5 }
  },
  exit: { x: 0 },
};

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const cardHover = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 300 }
  },
};

// Transition presets
export const springTransition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

export const easeTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const quickTransition = {
  duration: 0.2,
  ease: "easeOut",
}; 