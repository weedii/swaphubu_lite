"use client";

import React, { ReactNode, useMemo } from "react";

// Types
interface FloatingElement {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: string;
  color: string;
  delay?: string;
}

interface AuthBackgroundProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  floatingElements?: FloatingElement[];
  showGrid?: boolean;
}

// Component configurations
const VARIANT_CONFIGS = {
  primary: {
    floatingElements: [
      {
        top: "20px",
        left: "20px",
        size: "w-24 h-24",
        color: "bg-orange-200/25",
      },
      {
        top: "1/3",
        right: "20px",
        size: "w-32 h-32",
        color: "bg-gray-200/30 dark:bg-gray-700/30",
        delay: "delay-1000",
      },
      {
        bottom: "1/4",
        left: "1/4",
        size: "w-20 h-20",
        color: "bg-orange-300/25",
        delay: "delay-2000",
      },
      {
        bottom: "20px",
        right: "1/4",
        size: "w-28 h-28",
        color: "bg-gray-300/25 dark:bg-gray-600/25",
        delay: "delay-500",
      },
    ],
    particleCount: 12,
    particleType: "icon",
  },
  secondary: {
    floatingElements: [
      {
        top: "20px",
        left: "10px",
        size: "w-20 h-20",
        color: "bg-orange-200/20",
      },
      {
        top: "40px",
        right: "20px",
        size: "w-32 h-32",
        color: "bg-gray-200/30 dark:bg-gray-700/30",
        delay: "delay-1000",
      },
      {
        bottom: "20px",
        left: "20px",
        size: "w-24 h-24",
        color: "bg-orange-300/20",
        delay: "delay-2000",
      },
      {
        bottom: "40px",
        right: "10px",
        size: "w-16 h-16",
        color: "bg-gray-300/20 dark:bg-gray-600/20",
        delay: "delay-500",
      },
    ],
    particleCount: 20,
    particleType: "small",
  },
  tertiary: {
    floatingElements: [
      {
        top: "10px",
        left: "1/4",
        size: "w-24 h-24",
        color: "bg-orange-200/25",
      },
      {
        top: "1/3",
        right: "10px",
        size: "w-32 h-32",
        color: "bg-gray-200/30 dark:bg-gray-700/30",
        delay: "delay-1000",
      },
      {
        bottom: "1/4",
        left: "10px",
        size: "w-20 h-20",
        color: "bg-orange-300/25",
        delay: "delay-2000",
      },
      {
        bottom: "10px",
        right: "1/3",
        size: "w-28 h-28",
        color: "bg-gray-300/25 dark:bg-gray-600/25",
        delay: "delay-500",
      },
    ],
    particleCount: 15,
    particleType: "medium",
  },
};

// Sub-components
const FloatingElements = ({ elements }: { elements: FloatingElement[] }) => (
  <>
    {elements.map((element, index) => (
      <div
        key={index}
        className={`absolute ${element.size} ${
          element.color
        } rounded-full blur-xl animate-pulse ${element.delay || ""}`}
        style={{
          top: element.top,
          left: element.left,
          right: element.right,
          bottom: element.bottom,
        }}
      />
    ))}
  </>
);

const ParticleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 animate-pulse"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

// Generate random positions once and reuse them
const generateParticlePositions = (count: number) => {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
    animationDuration: `${1 + Math.random() * 2}s`,
  }));
};

const Particles = ({
  variant,
}: {
  variant: "primary" | "secondary" | "tertiary";
}) => {
  const config = VARIANT_CONFIGS[variant];

  // Memoize the particle positions so they don't change on re-render
  const particlePositions = useMemo(
    () => generateParticlePositions(config.particleCount),
    [config.particleCount]
  );

  if (variant === "primary") {
    return (
      <div className="absolute inset-0">
        {particlePositions.map((position, i) => (
          <div
            key={i}
            className="absolute text-orange-200/20 dark:text-orange-400/10"
            style={{
              left: position.left,
              top: position.top,
              animationDelay: position.animationDelay,
              transform: position.transform,
            }}
          >
            <ParticleIcon />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "secondary") {
    return (
      <div className="absolute inset-0">
        {particlePositions.map((position, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"
            style={{
              left: position.left,
              top: position.top,
              animationDelay: position.animationDelay,
              animationDuration: position.animationDuration,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "tertiary") {
    return (
      <div className="absolute inset-0">
        {particlePositions.map((position, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-orange-400/40 rounded-full animate-pulse"
            style={{
              left: position.left,
              top: position.top,
              animationDelay: position.animationDelay,
              animationDuration: position.animationDuration,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

const GridPattern = () => (
  <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
);

// Main component
export function AuthBackground({
  children,
  variant = "primary",
  floatingElements,
  showGrid = true,
}: AuthBackgroundProps) {
  const elements =
    floatingElements || VARIANT_CONFIGS[variant].floatingElements;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100 dark:from-gray-900 dark:via-orange-900/10 dark:to-black">
        <FloatingElements elements={elements} />
        <Particles variant={variant} />
        {showGrid && <GridPattern />}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>

      {/* CSS for grid pattern */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(0, 0, 0, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
