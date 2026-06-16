"use client";

export default function Divider({ label, className = "" }) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-border-light" />
        <span className="text-xs text-text-tertiary uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-border-light" />
      </div>
    );
  }

  return <div className={`h-px bg-border-light ${className}`} />;
}
