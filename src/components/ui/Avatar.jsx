"use client";

import Image from "next/image";

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
  "2xl": "w-20 h-20 text-xl",
};

export default function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  className = "",
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 ${sizes[size] || sizes.md} ${className}`}
      >
        <Image
          src={src}
          alt={alt || name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-full shrink-0 flex items-center justify-center
        bg-primary-100 text-primary-700 font-semibold
        ${sizes[size] || sizes.md} ${className}
      `}
    >
      {initials}
    </div>
  );
}
