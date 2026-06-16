"use client";

import { PackageOpen } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description,
  action,
  actionLabel,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
        {icon || <PackageOpen size={28} className="text-text-tertiary" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="md" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
