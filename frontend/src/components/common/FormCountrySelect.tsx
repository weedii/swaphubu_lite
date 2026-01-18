"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Shake } from "@/components/ui/animated";
import {
  CountryDropdown,
  type Country,
} from "@/components/ui/country-dropdown";

interface FormCountrySelectProps {
  label?: string;
  icon?: ReactNode;
  error?: string;
  variant?: "primary" | "secondary";
  id?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onCountrySelect?: (country: Country | null) => void; // New callback for full country object
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function FormCountrySelect({
  label,
  icon,
  error,
  variant = "primary",
  id,
  value,
  onValueChange,
  onCountrySelect,
  placeholder = "Select your country...",
  disabled = false,
  className,
  autoFocus = false,
}: FormCountrySelectProps) {
  const gradientStyles = {
    primary: "from-orange-500/10 to-gray-500/10",
    secondary: "from-gray-500/10 to-orange-500/10",
  };

  const handleCountryChange = (country: Country) => {
    onValueChange?.(country.alpha2);
    onCountrySelect?.(country);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium flex items-center gap-2"
        >
          {icon && <span className="text-orange-500">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative group">
        <CountryDropdown
          defaultValue={value}
          onChange={handleCountryChange}
          placeholder={placeholder}
          disabled={disabled}
          error={error}
          className={cn("transition-all duration-300", className)}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-md bg-gradient-to-r opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none",
            gradientStyles[variant]
          )}
        ></div>
      </div>
      {error && (
        <Shake>
          <p className="text-sm text-red-500">{error}</p>
        </Shake>
      )}
    </div>
  );
}
