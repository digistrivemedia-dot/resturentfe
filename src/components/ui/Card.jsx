"use client";

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  border = true,
  onClick,
  ...props
}) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`
        bg-bg-primary rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]
        ${border ? "border border-border-light" : ""}
        ${hover ? "hover:shadow-[var(--shadow-md)] transition-shadow duration-[var(--transition-base)] cursor-pointer" : ""}
        ${paddings[padding] || paddings.md}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-text-secondary mt-1 ${className}`}>
      {children}
    </p>
  );
}
