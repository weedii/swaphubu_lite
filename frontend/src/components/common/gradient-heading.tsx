import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientHeadingProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function GradientHeading({
  children,
  className,
  variant = "default",
  as: Component = "h1",
}: GradientHeadingProps) {
  const gradientClasses = {
    default:
      "bg-gradient-to-r from-gray-700 via-orange-500 to-gray-600 dark:from-gray-900 dark:via-orange-600 dark:to-gray-800 bg-clip-text text-transparent",
    primary:
      "bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 dark:from-orange-300 dark:via-orange-400 dark:to-orange-500 bg-clip-text text-transparent",
    secondary:
      "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 dark:from-gray-200 dark:via-gray-300 dark:to-gray-400 bg-clip-text text-transparent",
  };

  return (
    <Component className={cn("font-bold", gradientClasses[variant], className)}>
      {children}
    </Component>
  );
}
