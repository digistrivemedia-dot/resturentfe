"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  AlertCircle,
} from "lucide-react";
import { APP_NAME } from "@/constants";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginWithPassword, isLoading: authLoading } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
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
      const { user } = await loginWithPassword(form.email, form.password);
      if (user.role !== "super_admin") {
        toast.error("This portal is for administrators only");
        setLoading(false);
        return;
      }
      toast.success("Welcome, Admin!");
      router.push("/admin/dashboard");
    } catch (err) {
      setApiError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-8">

          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-xl font-extrabold text-primary">{APP_NAME}</span>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tracking-wide">
                Super Admin
              </span>
            </div>
          </div>

          {/* Shield icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 bg-primary/10 rounded-[var(--radius-xl)] flex items-center justify-center">
              <Shield size={28} className="text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-2xl font-extrabold text-gray-900 mb-1">
            Admin Sign In
          </h1>
          <p className="text-center text-sm text-gray-400 mb-7">
            Restricted to authorized administrators only
          </p>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="admin@digistrive.com"
                  className={`w-full h-11 pl-10 pr-4 text-sm border rounded-[var(--radius-lg)] bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary/15"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full h-11 pl-10 pr-11 text-sm border rounded-[var(--radius-lg)] bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 hover:border-gray-300 focus:border-primary focus:ring-primary/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-[var(--radius-lg)]">
                <AlertCircle size={15} className="shrink-0" />
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-[var(--radius-lg)] px-4 py-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Demo Credentials
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Email:</span>{" "}
              admin@digistrive.com
            </p>
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Password:</span>{" "}
              any password
            </p>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center text-xs text-white/40 mt-6">
          <Link href="/" className="hover:text-white/70 transition-colors">
            ← Back to customer app
          </Link>
        </p>
      </div>
    </div>
  );
}
