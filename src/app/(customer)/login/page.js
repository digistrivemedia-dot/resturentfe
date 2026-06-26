"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, CheckCircle2, UtensilsCrossed } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

const FEATURES = [
  "Browse hundreds of local restaurants",
  "Real-time order tracking",
  "Exclusive deals and coupons",
  "Fast, reliable delivery",
];

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, isLoading, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "super_admin") router.replace("/admin/dashboard");
      else if (user.role === "restaurant_owner") router.replace("/restaurant/dashboard");
      else router.replace("/home");
    }
  }, [isAuthenticated, user, router]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    try {
      await sendOtp(trimmed);
      toast.success("OTP sent to your email!");
      router.push(`/verify-otp?email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    }
  };

  const handleGoogleLogin = () => {
    toast.error("Google login coming soon!");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[42%] flex-col justify-between bg-[#1a1a1a] p-10 lg:p-14 relative overflow-hidden">

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top — Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Sri Isha Cafe"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-bold text-base">
            Sri Isha <span className="text-primary">Cafe</span>
          </span>
        </Link>

        {/* Middle — headline + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Customer Portal
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Great food,<br />delivered to your door.
            </h2>
            <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xs">
              Sign in to explore restaurants, place orders, and track deliveries in real time.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                <CheckCircle2 size={16} className="text-primary shrink-0" strokeWidth={2} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom — copyright */}
        <p className="relative z-10 text-xs text-white/20">
          © 2026 Sri Isha Cafe. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 bg-white">

        {/* Mobile logo */}
        <Link href="/" className="mb-10 md:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Sri Isha Cafe"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-text-primary text-base">
            Sri Isha <span className="text-primary">Cafe</span>
          </span>
        </Link>

        <div className="w-full max-w-[360px]">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-text-primary">Sign in</h1>
            <p className="text-text-secondary text-sm mt-1.5">
              Enter your email to receive a one-time password
            </p>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-11 flex items-center justify-center gap-3 border border-border-default rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-secondary transition-colors mb-5"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border-light" />
            <span className="text-xs text-text-tertiary font-medium tracking-wide">OR</span>
            <div className="flex-1 h-px bg-border-light" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
                  strokeWidth={2}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className={`w-full h-11 pl-10 pr-4 text-sm border rounded-lg bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors
                    ${error
                      ? "border-error focus:ring-error/20"
                      : "border-border-default hover:border-primary/50 focus:border-primary focus:ring-primary/15"
                    }`}
                />
              </div>
              {error && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary text-white font-semibold rounded-lg inline-flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Sending OTP…</>
              ) : (
                <>Send OTP <ArrowRight size={15} strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          {/* T&C */}
          <p className="text-center text-xs text-text-tertiary mt-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-text-secondary hover:text-primary underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-text-secondary hover:text-primary underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
          </p>

          {/* Restaurant portal link */}
          <div className="mt-8 pt-6 border-t border-border-light text-center">
            <p className="text-xs text-text-tertiary">
              Are you a restaurant owner?{" "}
              <Link href="/restaurant/login" className="text-primary font-semibold hover:underline">
                Restaurant portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
