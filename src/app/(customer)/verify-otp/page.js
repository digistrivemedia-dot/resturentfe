"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

const OTP_LENGTH = 6;
const RESEND_TIMER = 30;

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

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    // auto-submit when all filled
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      inputsRef.current[OTP_LENGTH - 1]?.focus();
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code = otp.join("")) => {
    if (code.length < OTP_LENGTH) { setError("Please enter the complete OTP"); return; }
    setError("");
    try {
      const { isNewUser } = await verifyOtp(email, code);
      toast.success("Login successful!");
      if (isNewUser) {
        router.push("/complete-profile");
      } else {
        router.push("/home");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(RESEND_TIMER);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputsRef.current[0]?.focus();
    try {
      await sendOtp(email);
      toast.success("OTP resent!");
    } catch (err) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  // Mask email: ro***@example.com
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "•".repeat(Math.min(b.length, 4)) + c)
    : "your email";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">

        {/* Back */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mb-4">
            📧
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Verify your email</h1>
          <p className="text-text-secondary text-sm mt-2">
            We sent a 6-digit OTP to <strong className="text-text-primary">{maskedEmail}</strong>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-3 mb-6" onPaste={handlePaste}>
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
              className={`
                flex-1 h-14 text-center text-xl font-bold rounded-[var(--radius-lg)] border-2 transition-colors outline-none
                ${error ? "border-error bg-error-light text-error" :
                  otp[idx] ? "border-primary bg-primary-50 text-primary" :
                  "border-border-light bg-bg-secondary text-text-primary focus:border-primary focus:bg-white"}
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-error mb-4 flex items-center gap-1.5">
            <span>⚠</span> {error}
          </p>
        )}

        {/* Verify button */}
        <button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.join("").length < OTP_LENGTH}
          className="w-full h-12 bg-primary text-white font-semibold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Verifying...</>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              <RefreshCw size={14} /> Resend OTP
            </button>
          ) : (
            <p className="text-sm text-text-tertiary">
              Resend OTP in{" "}
              <span className="font-semibold text-text-primary tabular-nums">
                00:{String(timer).padStart(2, "0")}
              </span>
            </p>
          )}
        </div>

        {/* Wrong email */}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-text-tertiary hover:text-primary transition-colors">
            Wrong email? Change it
          </Link>
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
