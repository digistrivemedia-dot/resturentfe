"use client";

import { use } from "react";
import MenuItemForm from "@/components/restaurant/MenuItemForm";

export default function EditMenuItemPage({ params }) {
  const { id } = use(params);
  return <MenuItemForm editId={id} />;
}
