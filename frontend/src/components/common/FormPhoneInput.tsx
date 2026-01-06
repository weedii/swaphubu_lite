"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Shake } from "@/components/ui/animated";
import { CircleFlag } from "react-circle-flags";
import { countries } from "country-data-list";
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  CountryCode,
} from "libphonenumber-js";
import type { Country } from "@/components/ui/country-dropdown";

interface FormPhoneInputProps {
  label?: string;
  icon?: ReactNode;
  error?: string;
  variant?: "primary" | "secondary";
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean, fullPhoneNumber?: string) => void; // New validation callback
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectedCountryCode?: string; // alpha2 country code
  autoFocus?: boolean;
}

export function FormPhoneInput({
  label,
  icon,
  error,
  variant = "primary",
  id,
  value = "",
  onChange,
  onValidationChange,
  placeholder,
  disabled = false,
  className,
  selectedCountryCode,
  autoFocus = false,
}: FormPhoneInputProps) {
  const [countryData, setCountryData] = useState<Country | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [internalError, setInternalError] = useState<string>("");

  const gradientStyles = {
    primary: "from-orange-500/10 to-gray-500/10",
    secondary: "from-gray-500/10 to-orange-500/10",
  };

  const focusStyles = {
    primary: "focus:border-orange-500 focus:ring-orange-500/20",
    secondary: "focus:border-gray-600 focus:ring-gray-600/20",
  };

  // Update country data when selected country changes
  useEffect(() => {
    if (selectedCountryCode) {
      const country = countries.all.find(
        (c: Country) => c.alpha2 === selectedCountryCode
      );
      setCountryData(country || null);
    } else {
      setCountryData(null);
    }
  }, [selectedCountryCode]);

  // Validate phone number when value or country changes
  useEffect(() => {
    if (!value || !selectedCountryCode || !countryData) {
      setIsValid(null);
      setInternalError("");
      onValidationChange?.(false);
      return;
    }

    try {
      const fullNumber =
        countryData.countryCallingCodes[0] + value.replace(/\D/g, "");
      const isValidNumber = isValidPhoneNumber(
        fullNumber,
        selectedCountryCode as CountryCode
      );
      setIsValid(isValidNumber);

      if (isValidNumber) {
        setInternalError("");
        onValidationChange?.(true, fullNumber);
      } else {
        setInternalError(
          `Please enter a valid phone number for ${countryData.name}`
        );
        onValidationChange?.(false);
      }
    } catch {
      setIsValid(false);
      setInternalError(
        `Please enter a valid phone number for ${
          countryData?.name || "the selected country"
        }`
      );
      onValidationChange?.(false);
    }
  }, [value, selectedCountryCode, countryData, onValidationChange]);

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove any non-digit characters except spaces, dashes, and parentheses
    inputValue = inputValue.replace(/[^\d\s\-\(\)]/g, "");

    // Limit length to reasonable phone number length
    const digitsOnly = inputValue.replace(/\D/g, "");
    if (digitsOnly.length > 15) {
      return;
    }

    // Create new event with cleaned value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: inputValue,
      },
    };

    onChange?.(newEvent);
  };

  // Get placeholder based on country
  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    if (!selectedCountryCode) {
      return "Select country first";
    }

    // Return a generic placeholder for the selected country
    return "Enter your phone number";
  };

  // Get validation status styling
  const getValidationStyling = () => {
    if (!value || !selectedCountryCode) return "";

    if (isValid === true) {
      return "border-green-500 focus:border-green-500 focus:ring-green-500/20";
    } else if (isValid === false) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500/20";
    }

    return "";
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
        <div className="relative flex">
          {/* Country Code Display */}
          {countryData && (
            <div className="flex items-center px-3 py-2 bg-muted/50 border border-r-0 border-input rounded-l-md h-12">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                  <CircleFlag
                    countryCode={countryData.alpha2.toLowerCase()}
                    height={20}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {countryData.countryCallingCodes[0]}
                </span>
              </div>
            </div>
          )}

          {/* Phone Input */}
          <Input
            id={id}
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={getPlaceholder()}
            disabled={disabled || !selectedCountryCode}
            autoFocus={autoFocus}
            className={cn(
              "h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300",
              countryData ? "rounded-l-none border-l-0 pl-4" : "pl-4",
              !countryData && focusStyles[variant],
              (error || internalError) &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              !(error || internalError) && getValidationStyling(),
              className
            )}
          />

          {/* Validation Icon */}
          {value && selectedCountryCode && !(error || internalError) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid === true && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {isValid === false && (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-md bg-gradient-to-r opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none",
            gradientStyles[variant]
          )}
        />
      </div>

      {/* Error message */}
      {(error || internalError) && (
        <Shake>
          <p className="text-sm text-red-500">{error || internalError}</p>
        </Shake>
      )}

      {/* Validation feedback */}
      {!(error || internalError) && value && selectedCountryCode && (
        <div className="flex items-center gap-2">
          {isValid === true && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Valid phone number for {countryData?.name}
            </p>
          )}
        </div>
      )}

      {/* Helper text */}
      {!selectedCountryCode && (
        <p className="text-xs text-muted-foreground">
          Please select your country first to enter your phone number
        </p>
      )}

      {selectedCountryCode && !value && (
        <p className="text-xs text-muted-foreground">
          Enter your phone number without the country code (
          {countryData?.countryCallingCodes[0]})
        </p>
      )}
    </div>
  );
}
