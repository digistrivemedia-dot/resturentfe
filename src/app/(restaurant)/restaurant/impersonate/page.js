"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setToken } from "@/lib/tokenManager";
import useAuthStore from "@/stores/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ImpersonatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUserFromCookie, setInitialized } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("t");
    if (!token) {
      router.replace("/restaurant/login");
      return;
    }

    fetch(`${API_BASE}/auth/impersonate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("exchange_failed");
        return r.json();
      })
      .then((data) => {
        const accessToken = data?.data?.token;
        const user = data?.data?.user;
        if (!accessToken || !user) throw new Error("bad_response");
        setToken(accessToken);
        setUserFromCookie(user);
        setInitialized();
        router.replace("/restaurant/dashboard");
      })
      .catch(() => {
        router.replace("/restaurant/login");
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <Loader2 size={32} className="text-primary animate-spin" />
      <p className="text-sm text-text-secondary">Signing in as restaurant owner...</p>
    </div>
  );
}
