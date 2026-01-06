import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/button";

interface GradientButtonProps extends ButtonProps {
  gradientVariant?: "primary" | "secondary" | "success";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function GradientButton({
  children,
  className,
  gradientVariant = "primary",
  isLoading = false,
  loadingText,
  icon,
  iconPosition = "right",
  ...props
}: GradientButtonProps) {
  const gradientClasses = {
    primary:
      "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white dark:from-gray-900 dark:to-orange-600 dark:hover:from-black dark:hover:to-orange-700",
    secondary:
      "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white dark:from-gray-700 dark:to-gray-900 dark:hover:from-gray-800 dark:hover:to-black",
    success:
      "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700",
  };

  const baseClasses =
    "w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]";

  return (
    <Button
      className={cn(baseClasses, gradientClasses[gradientVariant], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          {loadingText || "Loading..."}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </div>
      )}
    </Button>
  );
}
