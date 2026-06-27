"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, Loader2, ChevronRight,
  ShieldCheck, Smartphone, AlertCircle,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { APP_NAME } from "@/constants";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const { loginWithPassword, googleLogin, isLoading: authLoading, isAuthenticated, user } = useAuthStore();

  // Redirect away if already logged in as restaurant_owner
  useEffect(() => {
    if (isAuthenticated && user?.role === "restaurant_owner") {
      router.replace("/restaurant/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const [tab, setTab] = useState("email"); // email | phone
  const [form, setForm] = useState({ email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setApiError("");
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const { user: loggedUser } = await googleLogin(tokenResponse.access_token);
        if (loggedUser.role !== "restaurant_owner") {
          toast.error("This portal is for restaurant owners only");
          return;
        }
        toast.success("Welcome back!");
        router.push("/restaurant/dashboard");
      } catch (err) {
        setApiError(err.message || "Google login failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google sign-in was cancelled or failed");
    },
    flow: "implicit",
  });

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
    <div className="min-h-screen bg-bg-secondary flex">

      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary to-primary-dark flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <Link href="/" className="text-2xl font-extrabold text-white relative z-10">
          {APP_NAME}
          <span className="ml-2 text-sm font-medium text-white/60">for Restaurants</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-6">
            Manage your restaurant<br />from anywhere
          </h2>
          <div className="space-y-4">
            {[
              { icon: "📊", title: "Real-time analytics", desc: "Track revenue, orders & performance" },
              { icon: "🔔", title: "Instant order alerts", desc: "Never miss an order with live notifications" },
              { icon: "🍽️", title: "Easy menu management", desc: "Update items, prices & availability in seconds" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-[var(--radius-lg)] flex items-center justify-center text-xl shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40 relative z-10">
          © 2026 {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-xl font-extrabold text-primary">{APP_NAME}</Link>
            <p className="text-xs text-text-tertiary mt-1">Restaurant Portal</p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary">Welcome back</h1>
            <p className="text-sm text-text-secondary mt-1">Sign in to your restaurant dashboard</p>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={() => triggerGoogleLogin()}
            disabled={googleLoading}
            className="w-full h-11 flex items-center justify-center gap-3 border border-border-default rounded-[var(--radius-lg)] text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors mb-5 shadow-[var(--shadow-sm)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-tertiary font-medium">OR USE EMAIL / PHONE</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          {/* Tab switch */}
          <div className="flex bg-bg-secondary rounded-[var(--radius-xl)] p-1 mb-6">
            {[
              { key: "email", label: "Email", icon: Mail },
              { key: "phone", label: "Phone", icon: Smartphone },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setErrors({}); setApiError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 h-9 text-sm font-semibold rounded-[var(--radius-lg)] transition-all ${
                  tab === key
                    ? "bg-white text-text-primary shadow-[var(--shadow-sm)]"
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
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="owner@restaurant.com"
                    className={`w-full h-11 pl-10 pr-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 transition-colors ${
                      errors.email ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
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
                    className={`w-full h-11 pl-[3.75rem] pr-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 transition-colors ${
                      errors.phone ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
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
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full h-11 pl-10 pr-11 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 transition-colors ${
                    errors.password ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-error-light text-error text-sm px-3 py-2.5 rounded-[var(--radius-lg)]">
                <AlertCircle size={15} className="shrink-0" /> {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-[var(--shadow-md)]"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          {/* Contact admin note */}
          <div className="mt-6 flex items-start gap-2.5 bg-bg-secondary rounded-[var(--radius-xl)] px-4 py-3.5">
            <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">
              Don't have an account?{" "}
              <Link href="mailto:support@sriishacafe.com" className="font-semibold text-primary hover:underline">
                Contact Sri Isha Cafe admin
              </Link>{" "}
              to get your restaurant onboarded.
            </p>
          </div>

          <p className="text-center text-xs text-text-tertiary mt-6">
            <Link href="/" className="hover:text-primary transition-colors">← Back to customer app</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
