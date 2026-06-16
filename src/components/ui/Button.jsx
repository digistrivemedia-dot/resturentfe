"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-primary text-text-inverse hover:bg-primary-dark active:bg-primary-700",
  secondary:
    "bg-bg-secondary text-text-primary border border-border-light hover:bg-bg-tertiary",
  outline:
    "bg-transparent text-primary border border-primary hover:bg-primary-50",
  ghost: "bg-transparent text-text-primary hover:bg-bg-hover",
  danger: "bg-error text-text-inverse hover:bg-error-dark",
  success: "bg-success text-text-inverse hover:bg-success-dark",
  link: "bg-transparent text-text-link underline-offset-4 hover:underline p-0 h-auto",
};

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  xl: "h-14 px-8 text-lg gap-2.5",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
  "icon-lg": "h-12 w-12 p-0",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = "",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]
        cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
