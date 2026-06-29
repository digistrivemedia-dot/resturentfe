"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  ShieldCheck, Smartphone, AlertCircle,
  BarChart3, BellRing, UtensilsCrossed, CheckCircle2,
} from "lucide-react";
import { APP_NAME } from "@/constants";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

const FEATURES = [
  { icon: BarChart3,       title: "Real-time analytics",    desc: "Track revenue, orders & performance" },
  { icon: BellRing,        title: "Instant order alerts",   desc: "Never miss an order with live notifications" },
  { icon: UtensilsCrossed, title: "Easy menu management",   desc: "Update items, prices & availability in seconds" },
];

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { loginWithPassword, isLoading: authLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role === "restaurant_owner") {
      router.replace("/restaurant/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const [tab, setTab] = useState("email");
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (tab === "email" && !form.email.trim()) e.email = "Email is required";
    if (tab === "phone" && !form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const credential = tab === "email" ? form.email : form.phone;
      const { user } = await loginWithPassword(credential, form.password);
      if (user.role !== "restaurant_owner") {
        toast.error("This portal is for restaurant owners only");
        setLoading(false);
        return;
      }
      toast.success("Welcome back!");
      router.push("/restaurant/dashboard");
    } catch (err) {
      setApiError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#1a1a1a] p-10 xl:p-14 relative overflow-hidden">

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image src="/logo.png" alt="Sri Isha Cafe" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-bold text-base">
            Sri Isha <span className="text-primary">Cafe</span>
            <span className="ml-2 text-xs font-medium text-white/40">for Restaurants</span>
          </span>
        </Link>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Restaurant Portal
            </p>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Manage your restaurant<br />from anywhere.
            </h2>
            <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xs">
              Everything you need to run your restaurant — orders, menu, analytics, and more — in one place.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className="text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/20">
          © 2026 Sri Isha Cafe. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 xl:p-16 bg-white">

        {/* Mobile logo */}
        <Link href="/" className="mb-10 lg:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image src="/logo.png" alt="Sri Isha Cafe" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-text-primary text-base">
            Sri Isha <span className="text-primary">Cafe</span>
          </span>
        </Link>

        <div className="w-full max-w-[360px]">

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-text-primary">Restaurant sign in</h1>
            <p className="text-sm text-text-secondary mt-1.5">Access your restaurant dashboard</p>
          </div>

          {/* Tab switch — Email / Phone */}
          <div className="flex bg-bg-secondary rounded-xl p-1 mb-5">
            {[
              { key: "email", label: "Email",  icon: Mail },
              { key: "phone", label: "Phone",  icon: Smartphone },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setErrors({}); setApiError(""); }}
                className={`flex-1 inline-flex items-center justify-center gap-2 h-9 text-sm font-semibold rounded-lg transition-all ${
                  tab === key
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email or Phone */}
            {tab === "email" ? (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" strokeWidth={2} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="owner@restaurant.com"
                    className={`w-full h-11 pl-10 pr-4 text-sm border rounded-lg bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? "border-error focus:ring-error/20"
                        : "border-border-default hover:border-primary/50 focus:border-primary focus:ring-primary/15"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-error mt-1.5">{errors.email}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-sm text-text-secondary font-medium">+91</span>
                    <span className="w-px h-4 bg-border-default" />
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full h-11 pl-[3.75rem] pr-4 text-sm border rounded-lg bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors ${
                      errors.phone
                        ? "border-error focus:ring-error/20"
                        : "border-border-default hover:border-primary/50 focus:border-primary focus:ring-primary/15"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-error mt-1.5">{errors.phone}</p>}
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-primary">Password</label>
                <Link href="#" className="text-xs text-primary font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" strokeWidth={2} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full h-11 pl-10 pr-11 text-sm border rounded-lg bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-error focus:ring-error/20"
                      : "border-border-default hover:border-primary/50 focus:border-primary focus:ring-primary/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1.5">{errors.password}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-error-light border border-error/20 text-error text-sm rounded-lg px-3.5 py-3">
                <AlertCircle size={15} className="shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-white font-semibold rounded-lg inline-flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={15} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          {/* Contact admin */}
          <div className="mt-6 flex items-start gap-2.5 bg-bg-secondary rounded-xl px-4 py-3.5">
            <ShieldCheck size={15} className="text-primary shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-xs text-text-secondary leading-relaxed">
              Don&apos;t have an account?{" "}
              <Link href="mailto:support@sriishacafe.com" className="font-semibold text-primary hover:underline">
                Contact Sri Isha Cafe admin
              </Link>{" "}
              to get your restaurant onboarded.
            </p>
          </div>

          {/* Back to customer */}
          <div className="mt-6 pt-5 border-t border-border-light text-center">
            <p className="text-xs text-text-tertiary">
              Looking to order food?{" "}
              <Link href="/" className="text-primary font-semibold hover:underline">
                Customer app →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
