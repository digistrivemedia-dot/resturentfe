"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  autoFocus = false,
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="
          w-full h-10 pl-10 pr-10 text-sm bg-bg-secondary text-text-primary
          border border-transparent rounded-[var(--radius-full)]
          placeholder:text-text-tertiary
          transition-colors duration-[var(--transition-fast)]
          focus:outline-none focus:bg-bg-primary focus:border-border-focus focus:ring-1 focus:ring-border-focus
        "
      />
      {value && (
        <button
          onClick={() => {
            onChange?.("");
            onClear?.();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
