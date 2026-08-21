"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  closeOnOverlay = true,
  className = "",
  footer,
  // "center" (default) — unchanged, always a centered dialog, every existing
  // caller keeps its current look.
  // "sheet" — bottom sheet on mobile web (slides up, ~60vh cap, top corners
  // only), becomes a normal centered dialog at the sm breakpoint and up.
  variant = "center",
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
  };

  // Fully static class strings, not built via template-literal concatenation
  // of a "sm:" prefix + a stored size string — Tailwind's build-time class
  // scanner only picks up class names that appear literally in source, so a
  // runtime-constructed "sm:" + sizes[size] would silently never be generated.
  const sheetSizes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    full: "sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-2rem)]",
  };

  const isSheet = variant === "sheet";

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 flex justify-center animate-fade-in ${
        isSheet ? "items-end sm:items-center p-0 sm:p-4" : "items-center p-4"
      }`}
      style={{
        backgroundColor: "var(--bg-overlay)",
        zIndex: "var(--z-modal)",
      }}
      onClick={(e) => {
        if (closeOnOverlay && e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`
          bg-bg-primary w-full shadow-[var(--shadow-modal)] flex flex-col
          ${isSheet
            ? "rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)] max-h-[60vh] sm:max-h-[90vh] animate-sheet-up sm:animate-slide-up"
            : "rounded-[var(--radius-lg)] max-h-[90vh] animate-slide-up"
          }
          ${isSheet ? sheetSizes[size] || sheetSizes.md : sizes[size] || sizes.md}
          ${className}
        `}
      >
        {/* Drag handle — sheet affordance, hidden once it becomes a centered dialog */}
        {isSheet && (
          <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0">
            <div className="w-9 h-1 rounded-full bg-border-default" />
          </div>
        )}

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
            {title && (
              <h2 className="text-lg font-semibold text-text-primary">
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
