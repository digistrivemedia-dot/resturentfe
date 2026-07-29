"use client";

import { use } from "react";
import RestaurantMenuView from "@/components/customer/RestaurantMenuView";

export default function RestaurantPage({ params }) {
  const { slug } = use(params);
  return <RestaurantMenuView slug={slug} backHref="/home" />;
}
