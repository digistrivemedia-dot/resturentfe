"use client";

import { Loader2 } from "lucide-react";

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export default function Spinner({
  size = "md",
  className = "",
  label,
  fullScreen = false,
}) {
  const spinner = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Loader2
        className={`animate-spin text-primary ${sizes[size] || sizes.md}`}
      />
      {label && <p className="text-sm text-text-secondary">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-primary/80 z-[var(--z-overlay)]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
