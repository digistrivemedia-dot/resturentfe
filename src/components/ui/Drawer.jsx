"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
  size = "md",
  showClose = true,
  closeOnOverlay = true,
  className = "",
  footer,
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
    sm: "w-80",
    md: "w-96",
    lg: "w-[480px]",
    xl: "w-[600px]",
    full: "w-screen",
  };

  const positions = {
    right: "right-0 top-0 h-full animate-slide-in-right",
    left: "left-0 top-0 h-full",
    bottom: "bottom-0 left-0 w-full h-auto max-h-[90vh]",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 animate-fade-in"
      style={{
        backgroundColor: "var(--bg-overlay)",
        zIndex: "var(--z-drawer)",
      }}
      onClick={(e) => {
        if (closeOnOverlay && e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`
          fixed bg-bg-primary flex flex-col
          shadow-[var(--shadow-modal)]
          ${positions[position] || positions.right}
          ${position !== "bottom" ? sizes[size] || sizes.md : ""}
          ${className}
        `}
      >
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
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border-light shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
