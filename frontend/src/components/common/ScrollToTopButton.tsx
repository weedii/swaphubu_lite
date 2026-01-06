"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    const throttledScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Container styles
  const containerClasses = cn(
    "fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out",
    isVisible
      ? "translate-y-0 opacity-100 scale-100"
      : "translate-y-16 opacity-0 scale-75 pointer-events-none"
  );

  // Button styles
  const buttonClasses = cn(
    "group relative p-4 rounded-full border border-primary/20",
    "bg-black border-primary",
    "hover:from-primary/90 hover:to-primary/70",
    "text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/25",
    "transition-all duration-300 ease-out",
    "hover:scale-110 hover:-translate-y-1",
    "active:scale-95 active:translate-y-0"
  );

  // Icon styles
  const iconClasses = cn(
    "transition-all duration-300 ease-out",
    "group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-90"
  );

  return (
    <div className={containerClasses}>
      <button
        onClick={scrollToTop}
        className={buttonClasses}
        aria-label="Scroll to top"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <ChevronUp size={24} className={iconClasses} />
        </div>
      </button>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        button:hover {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
