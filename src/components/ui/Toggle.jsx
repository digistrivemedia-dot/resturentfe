"use client";

export default function Toggle({
  checked = false,
  onChange,
  label,
  disabled = false,
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: { track: "w-8 h-4", thumb: "w-3 h-3", translate: "translate-x-4" },
    md: { track: "w-10 h-5", thumb: "w-4 h-4", translate: "translate-x-5" },
    lg: { track: "w-12 h-6", thumb: "w-5 h-5", translate: "translate-x-6" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <label
      className={`inline-flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`
          relative inline-flex shrink-0 items-center rounded-full
          transition-colors duration-[var(--transition-base)]
          ${s.track}
          ${checked ? "bg-primary" : "bg-border-default"}
          cursor-pointer disabled:cursor-not-allowed
        `}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-sm
            transition-transform duration-[var(--transition-base)]
            ${s.thumb}
            ${checked ? s.translate : "translate-x-0.5"}
          `}
        />
      </button>
      {label && <span className="text-sm text-text-primary">{label}</span>}
    </label>
  );
}
