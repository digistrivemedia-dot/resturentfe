"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, Mail } from "lucide-react";
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
  const isSubmitting = useRef(false); // prevent double-submit

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
    // prevent double-submit (paste + auto-submit race)
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

    // auto-submit when last digit entered manually
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
    e.preventDefault(); // prevent onChange from also firing
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 px-8 py-10">

          {/* Back */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center">
              <Mail size={28} className="text-orange-500" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We sent a 6-digit code to
              <br />
              <span className="font-semibold text-gray-800">{maskedEmail}</span>
            </p>
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
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
                  "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150",
                  error
                    ? "border-red-400 bg-red-50 text-red-600"
                    : otp[idx]
                    ? "border-orange-400 bg-orange-50 text-orange-600 scale-105"
                    : "border-gray-200 bg-gray-50 text-gray-900 focus:border-orange-400 focus:bg-white focus:scale-105",
                ].join(" ")}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / OTP_LENGTH) * 100}%` }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || filledCount < OTP_LENGTH}
            className="w-full h-13 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200 py-3.5 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-6">
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-gray-400">
                Resend code in{" "}
                <span className="font-bold text-gray-700 tabular-nums">
                  00:{String(timer).padStart(2, "0")}
                </span>
              </p>
            )}
          </div>

          {/* Wrong email */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Wrong email?{" "}
            <Link href="/login" className="text-orange-500 hover:underline font-medium">
              Change it
            </Link>
          </p>
        </div>

        {/* Tip */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Check your spam folder if you don&apos;t see it
        </p>
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
