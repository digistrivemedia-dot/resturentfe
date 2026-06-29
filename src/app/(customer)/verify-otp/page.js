"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, RefreshCw, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

const FEATURES = [
  "Secure one-time password login",
  "No password to remember",
  "Instant access to your account",
  "Your data is always protected",
];

function OTPVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { verifyOtp, sendOtp, isLoading } = useAuthStore();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);
  const isSubmitting = useRef(false);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleVerify = useCallback(async (code) => {
    const finalCode = code || otp.join("");
    if (finalCode.length < OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");

    try {
      const { isNewUser } = await verifyOtp(email, finalCode);
      toast.success("Login successful!");
      router.push(isNewUser ? "/complete-profile" : "/home");
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
      isSubmitting.current = false;
    }
  }, [otp, email, verifyOtp, router]);

  const handleChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    if (value && idx === OTP_LENGTH - 1) {
      const full = newOtp.join("");
      if (full.length === OTP_LENGTH) handleVerify(full);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      const digits = pasted.split("");
      setOtp(digits);
      inputsRef.current[OTP_LENGTH - 1]?.focus();
      handleVerify(pasted);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(RESEND_TIMER);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    isSubmitting.current = false;
    inputsRef.current[0]?.focus();
    try {
      await sendOtp(email);
      toast.success("New OTP sent to your email!");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "•".repeat(Math.min(b.length, 4)) + c)
    : "your email";

  const filledCount = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ fontFamily: "var(--font-family)" }}>

      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[42%] flex-col justify-between bg-[#1a1a1a] p-10 lg:p-14 relative overflow-hidden">

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
          </span>
        </Link>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Verify Identity
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              One step away<br />from great food.
            </h2>
            <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-xs">
              Enter the code we sent to your email to complete sign-in securely.
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

        <p className="relative z-10 text-xs text-white/20">
          © 2026 Sri Isha Cafe. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — OTP form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 bg-white">

        {/* Mobile logo */}
        <Link href="/" className="mb-10 md:hidden flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image src="/logo.png" alt="Sri Isha Cafe" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-text-primary text-base">
            Sri Isha <span className="text-primary">Cafe</span>
          </span>
        </Link>

        <div className="w-full max-w-[360px]">

          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Back to login
          </Link>

          {/* Mail icon */}
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <Mail size={22} className="text-primary" strokeWidth={1.8} />
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-text-primary">Check your email</h1>
            <p className="text-text-secondary text-sm mt-1.5 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-text-primary">{maskedEmail}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <div className="flex gap-2.5 justify-between mb-5" onPaste={handlePaste}>
            {Array(OTP_LENGTH).fill(0).map((_, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={otp[idx]}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={[
                  "w-12 h-13 text-center text-lg font-bold rounded-lg border-2 outline-none transition-all duration-150",
                  "focus:scale-105",
                  error
                    ? "border-error bg-error-light text-error"
                    : otp[idx]
                    ? "border-primary bg-primary-50 text-primary scale-105"
                    : "border-border-default bg-bg-secondary text-text-primary focus:border-primary focus:bg-white",
                ].join(" ")}
                style={{ height: "52px" }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-0.5 bg-border-light rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / OTP_LENGTH) * 100}%` }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-error-light border border-error/20 text-error text-sm rounded-lg px-3.5 py-3 mb-4">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verify button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || filledCount < OTP_LENGTH}
            className="w-full h-11 bg-primary text-white font-semibold rounded-lg inline-flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Verifying…</>
            ) : (
              "Verify & Sign In"
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-5">
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
              >
                <RefreshCw size={13} /> Resend OTP
              </button>
            ) : (
              <p className="text-xs text-text-tertiary">
                Resend code in{" "}
                <span className="font-bold text-text-secondary tabular-nums">
                  00:{String(timer).padStart(2, "0")}
                </span>
              </p>
            )}
          </div>

          {/* Wrong email */}
          <div className="mt-6 pt-5 border-t border-border-light text-center">
            <p className="text-xs text-text-tertiary">
              Wrong email?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Change it →
              </Link>
            </p>
          </div>

          {/* Spam hint */}
          <p className="text-center text-[11px] text-text-tertiary mt-3">
            Don&apos;t see it? Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OTPVerifyPage() {
  return (
    <Suspense>
      <OTPVerifyContent />
    </Suspense>
  );
}
