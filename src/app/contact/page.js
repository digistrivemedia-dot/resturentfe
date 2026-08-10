"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import { Input, Textarea, Button } from "@/components/ui";
import api from "@/lib/api";

const CONTACT_INFO = [
  {
    Icon: Mail,
    label: "Email",
    value: "support@sriishacafe.com",
    href: "mailto:support@sriishacafe.com",
  },
  {
    Icon: Phone,
    label: "Phone",
    value: "+91 80000 00000",
    href: "tel:+918000000000",
  },
  {
    Icon: MapPin,
    label: "Address",
    value: "Sri Isha Cafe, Tamil Nadu, India",
    href: null,
  },
];

const INITIAL_FORM = { name: "", email: "", phone: "", subject: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: true } | { success: false, message }

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setResult(null);
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });
      setResult({ success: true });
      setForm(INITIAL_FORM);
    } catch (err) {
      setResult({ success: false, message: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "var(--font-family)" }}>
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#FFF8F5] hidden lg:block" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary leading-[1.15] tracking-tight mb-5">
            Get in <span className="text-primary">touch.</span>
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Questions, feedback, or a partnership idea? Send us a message and our team will get
            back to you shortly.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="px-6 md:px-10 pb-16 md:pb-24 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10">

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="bg-white border border-border-light rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                label="Your Name"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                label="Phone"
                type="tel"
                placeholder="+91 98765 43210"
                helperText="Optional"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <Input
                label="Subject"
                placeholder="How can we help?"
                helperText="Optional"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
            </div>

            <Textarea
              label="Message"
              rows={5}
              placeholder="Tell us more..."
              required
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              error={errors.message}
            />

            <Button type="submit" size="lg" loading={loading} rightIcon={!loading && <Send size={16} />}>
              {loading ? "Sending…" : "Send Message"}
            </Button>

            {result?.success && (
              <div className="flex items-center gap-2.5 p-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg">
                <CheckCircle2 size={18} className="text-[#2E7D32] shrink-0" />
                <p className="text-sm font-semibold text-[#1B5E20]">
                  Thanks for reaching out — we&apos;ll get back to you soon.
                </p>
              </div>
            )}
            {result && !result.success && (
              <div className="flex items-center gap-2.5 p-3 bg-[#FFEBEE] border border-[#EF9A9A] rounded-lg">
                <AlertTriangle size={18} className="text-[#C62828] shrink-0" />
                <p className="text-sm font-semibold text-[#B71C1C]">{result.message}</p>
              </div>
            )}
          </form>

          {/* Direct contact info */}
          <div className="space-y-4">
            {CONTACT_INFO.map(({ Icon, label, value, href }) => {
              const content = (
                <div className="flex items-start gap-3 p-5 bg-bg-secondary border border-border-light rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-medium text-text-primary break-words">{value}</p>
                  </div>
                </div>
              );
              return href ? (
                <a key={label} href={href} className="block hover:border-primary/30 transition-colors rounded-2xl">
                  {content}
                </a>
              ) : (
                <div key={label}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
