"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = "Select an option",
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full h-10 px-3 pr-10 text-sm bg-bg-primary text-text-primary
            border rounded-[var(--radius-md)] appearance-none
            transition-colors duration-[var(--transition-fast)]
            focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary
            ${error ? "border-error" : "border-border-light hover:border-border-default"}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={typeof opt === "object" ? opt.value : opt}
              value={typeof opt === "object" ? opt.value : opt}
            >
              {typeof opt === "object" ? opt.label : opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
});

export default Select;
