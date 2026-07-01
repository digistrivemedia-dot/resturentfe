"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import { setToken } from "@/lib/tokenManager";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Remove non-httpOnly cookies so the middleware stops blocking /login
function clearClientCookies() {
  document.cookie = "userRole=; Max-Age=0; path=/";
  document.cookie = "userInfo=; Max-Age=0; path=/";
}

export default function AuthInitializer() {
  const { setUserFromCookie, setInitialized } = useAuthStore();

  useEffect(() => {
    const userInfoRaw = getCookie("userInfo");
    const userRole = getCookie("userRole");

    // ── Case 1: No session cookies at all → not logged in ─────────────────
    if (!userRole) {
      setInitialized();
      return;
    }

    // ── Case 2: Full session — userInfo cookie present (normal path) ───────
    // Also call refresh-token to get an in-memory access token so the first
    // API request on any page doesn't have to fail-then-retry via the interceptor.
    if (userInfoRaw) {
      try {
        const user = JSON.parse(userInfoRaw);
        setUserFromCookie(user);
      } catch {
        // Malformed cookie — fall through as logged out
      }
      // Best-effort token refresh — don't block initialization on failure
      fetch(`${API_BASE}/auth/refresh-token`, { method: "POST", credentials: "include" })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          const token = data?.data?.token;
          if (token) setToken(token);
        })
        .catch(() => {})
        .finally(() => setInitialized());
      return;
    }

    // ── Case 3: Partial/old session — userRole exists but no userInfo ──────
    // Happens when: cookies were set before userInfo cookie was introduced,
    // or userInfo cookie expired. Try to recover via refresh-token → /me.
    // On failure: clear non-httpOnly cookies so /login becomes accessible again.
    fetch(`${API_BASE}/auth/refresh-token`, { method: "POST", credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("refresh_failed");
        return r.json();
      })
      .then((data) => {
        const token = data?.data?.token;
        if (!token) throw new Error("no_token");
        setToken(token);
        return fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => {
          if (!r.ok) throw new Error("me_failed");
          return r.json();
        });
      })
      .then((data) => {
        const user = data?.data?.user;
        if (user) setUserFromCookie(user);
      })
      .catch(() => {
        // Session is broken or expired — clear client-readable cookies
        // so the middleware stops redirecting /login → /home
        clearClientCookies();
      })
      .finally(() => setInitialized());
  }, []);

  return null;
}
