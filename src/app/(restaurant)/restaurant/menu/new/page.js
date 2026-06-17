"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MenuItemForm from "@/components/restaurant/MenuItemForm";
import { Spinner } from "@/components/ui";

function NewMenuItemPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") || null;
  return <MenuItemForm editId={editId} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
          <Spinner size="lg" label="Loading..." />
        </div>
      }
    >
      <NewMenuItemPage />
    </Suspense>
  );
}
