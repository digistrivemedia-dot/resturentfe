"use client";

export default function Skeleton({
  width,
  height,
  circle = false,
  className = "",
  count = 1,
}) {
  const style = {
    width: width || "100%",
    height: height || "1rem",
  };

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`skeleton ${circle ? "rounded-full" : "rounded-[var(--radius-md)]"} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`skeleton ${circle ? "rounded-full" : "rounded-[var(--radius-md)]"} ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-primary rounded-[var(--radius-lg)] border border-border-light p-4">
      <Skeleton height="160px" className="mb-3" />
      <Skeleton height="1.25rem" width="70%" className="mb-2" />
      <Skeleton height="0.875rem" width="50%" className="mb-2" />
      <Skeleton height="0.875rem" width="40%" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width="48px" height="48px" circle />
          <div className="flex-1">
            <Skeleton height="1rem" width="60%" className="mb-2" />
            <Skeleton height="0.75rem" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
