"use client";

import React, { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Shake } from "@/components/ui/animated";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  variant?: "primary" | "secondary";
  showPasswordToggle?: boolean;
  externalPasswordState?: {
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
  };
  autoFocus?: boolean;
}

export function FormInput({
  label,
  icon,
  error,
  className,
  variant = "primary",
  id,
  type = "text",
  showPasswordToggle = false,
  externalPasswordState,
  autoFocus = false,
  ...props
}: FormInputProps) {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  // Use either external or internal password state
  const showPassword = externalPasswordState
    ? externalPasswordState.showPassword
    : internalShowPassword;
  const setShowPassword = externalPasswordState
    ? externalPasswordState.setShowPassword
    : setInternalShowPassword;

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  const gradientStyles = {
    primary: "from-orange-500/10 to-gray-500/10",
    secondary: "from-gray-500/10 to-orange-500/10",
  };

  const focusStyles = {
    primary: "focus:border-orange-500 focus:ring-orange-500/20",
    secondary: "focus:border-gray-600 focus:ring-gray-600/20",
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
        <Input
          id={id}
          type={inputType}
          className={cn(
            "h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 transition-all duration-300",
            focusStyles[variant],
            showPasswordToggle ? "pr-12" : "pr-4",
            "pl-4",
            className
          )}
          {...props}
          autoFocus={autoFocus}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
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
