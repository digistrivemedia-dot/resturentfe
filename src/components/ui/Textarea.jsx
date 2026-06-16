"use client";

import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = "",
    containerClassName = "",
    rows = 3,
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
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm bg-bg-primary text-text-primary
          border rounded-[var(--radius-md)] resize-vertical
          placeholder:text-text-tertiary
          transition-colors duration-[var(--transition-fast)]
          focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary
          ${error ? "border-error" : "border-border-light hover:border-border-default"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
});

export default Textarea;
