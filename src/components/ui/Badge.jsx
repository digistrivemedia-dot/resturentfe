"use client";

const variants = {
  default: "bg-bg-secondary text-text-primary",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-light text-success-dark",
  warning: "bg-warning-light text-warning-dark",
  error: "bg-error-light text-error-dark",
  info: "bg-info-light text-info-dark",
  veg: "bg-success-light text-veg",
  "non-veg": "bg-error-light text-non-veg",
  outline: "bg-transparent border border-border-default text-text-secondary",
};

const sizes = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-xs px-2 py-1",
  lg: "text-sm px-2.5 py-1",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-[var(--radius-full)]
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success"
              ? "bg-success"
              : variant === "error"
                ? "bg-error"
                : variant === "warning"
                  ? "bg-warning"
                  : "bg-text-tertiary"
          }`}
        />
      )}
      {children}
    </span>
  );
}

export function VegBadge({ isVeg }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center w-4 h-4 border rounded-sm
        ${isVeg ? "border-veg" : "border-non-veg"}
      `}
    >
      <span
        className={`w-2 h-2 rounded-full ${isVeg ? "bg-veg" : "bg-non-veg"}`}
      />
    </span>
  );
}
