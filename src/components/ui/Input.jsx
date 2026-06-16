"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = "text",
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full h-10 px-3 text-sm bg-bg-primary text-text-primary
            border rounded-[var(--radius-md)]
            placeholder:text-text-tertiary
            transition-colors duration-[var(--transition-fast)]
            focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary
            ${error ? "border-error focus:border-error focus:ring-error" : "border-border-light hover:border-border-default"}
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon || isPassword ? "pr-10" : ""}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
