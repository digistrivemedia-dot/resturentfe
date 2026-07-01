"use client";

import { Star } from "lucide-react";

export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mb-4">
        <Star size={28} className="text-text-tertiary" />
      </div>
      <h2 className="text-xl font-bold text-text-primary">Reviews</h2>
      <p className="text-text-secondary mt-2 text-sm max-w-sm">
        Customer reviews management is coming soon. You'll be able to view and moderate all restaurant reviews here.
      </p>
    </div>
  );
}
