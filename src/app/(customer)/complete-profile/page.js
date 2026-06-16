"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Camera, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import useAuthStore from "@/stores/authStore";
import toast from "react-hot-toast";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { completeProfile, isLoading, user } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await completeProfile({
        name: form.name.trim(),
        ...(form.email && { email: form.email.trim() }),
      });
      toast.success("Profile updated!");
      router.push("/home");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-secondary px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[var(--shadow-lg)] p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 mb-4">
            <CheckCircle2 size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Almost there! 🎉</h1>
          <p className="text-text-secondary text-sm mt-1">Tell us a bit about yourself to get started</p>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700 border-4 border-white shadow-[var(--shadow-md)] overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary-dark transition-colors">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAvatar(URL.createObjectURL(file));
                }}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                placeholder="e.g. Rohan Malo"
                className={`w-full h-12 pl-10 pr-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors
                  ${errors.name ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"}`}
              />
            </div>
            {errors.name && <p className="text-xs text-error mt-1.5">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Email Address <span className="text-text-tertiary text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                placeholder="you@example.com"
                className={`w-full h-12 pl-10 pr-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors
                  ${errors.email ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"}`}
              />
            </div>
            {errors.email && <p className="text-xs text-error mt-1.5">{errors.email}</p>}
            <p className="text-xs text-text-tertiary mt-1.5">We'll send your order receipts here</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary text-white font-semibold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /> Saving...</>
            ) : (
              <>Let's Go <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-text-tertiary mt-4">
          You can always update these details later in your profile
        </p>
      </div>
    </div>
  );
}
