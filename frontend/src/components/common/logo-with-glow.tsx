import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoWithGlowProps {
  href?: string;
  className?: string;
  imageUrl?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  glowColor?: "orange" | "gray" | "green" | "blue";
}

export function LogoWithGlow({
  href = "/",
  className,
  imageUrl = "/swaphubu.webp",
  alt = "SwapHubu",
  size = "md",
  glowColor = "orange",
}: LogoWithGlowProps) {
  const sizeClasses = {
    sm: "h-12",
    md: "h-16",
    lg: "h-20",
  };

  const glowClasses = {
    orange: "from-orange-500 to-orange-600",
    gray: "from-gray-600 to-gray-800",
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
  };

  const logo = (
    <div className={cn("relative", className)}>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${glowClasses[glowColor]} rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity`}
      ></div>
      <Image
        src={imageUrl}
        alt={alt}
        width={100}
        height={100}
        className={cn("relative mx-auto w-auto", sizeClasses[size])}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group">
        {logo}
      </Link>
    );
  }

  return logo;
}
