import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BaseGradientLinkProps {
  children: React.ReactNode;
  className?: string;
  gradientVariant?: "primary" | "secondary" | "success";
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

interface NextLinkProps extends BaseGradientLinkProps {
  href: string;
  useNextLink?: true;
  target?: never;
  rel?: never;
}

interface AnchorLinkProps extends BaseGradientLinkProps {
  href: string;
  useNextLink: false;
  target?: string;
  rel?: string;
}

type GradientLinkProps = NextLinkProps | AnchorLinkProps;

export function GradientLink({
  children,
  className,
  href,
  gradientVariant = "primary",
  isLoading = false,
  loadingText,
  icon,
  iconPosition = "right",
  useNextLink = true,
  ...restProps
}: GradientLinkProps) {
  const gradientClasses = {
    primary:
      "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white dark:from-gray-900 dark:to-orange-600 dark:hover:from-black dark:hover:to-orange-700",
    secondary:
      "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white dark:from-gray-700 dark:to-gray-900 dark:hover:from-gray-800 dark:hover:to-black",
    success:
      "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700",
  };

  const baseClasses =
    "inline-flex items-center justify-center w-full h-12 px-6 font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-center no-underline";

  const content = isLoading ? (
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
  );

  const linkClasses = cn(
    baseClasses,
    gradientClasses[gradientVariant],
    className
  );

  if (useNextLink) {
    return (
      <Link href={href} className={linkClasses}>
        {content}
      </Link>
    );
  }

  const { href: _, ...anchorProps } = restProps as AnchorLinkProps;

  return (
    <a href={href} className={linkClasses} {...anchorProps}>
      {content}
    </a>
  );
}
