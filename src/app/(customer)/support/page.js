"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, ChevronUp, Mail, Phone,
  MessageCircle, Send, CheckCircle2, Loader2,
  HelpCircle, Package, CreditCard, MapPin, Star, AlertCircle,
} from "lucide-react";

const FAQ_SECTIONS = [
  {
    icon: Package,
    title: "Orders & Delivery",
    color: "text-primary",
    bg: "bg-primary-50",
    faqs: [
      {
        q: "How do I track my order?",
        a: "Go to 'My Orders' from the bottom navigation, then tap 'Track Order' on your active order. You can see live location of the delivery partner.",
      },
      {
        q: "Can I cancel my order?",
        a: "You can cancel an order within 2 minutes of placing it. After that, if the restaurant has already accepted and started preparing your order, cancellation may not be possible.",
      },
      {
        q: "What if my order is delayed?",
        a: "Delivery times may vary due to traffic or high demand. You can track the real-time status in 'My Orders'. If it's significantly delayed, contact our support.",
      },
      {
        q: "What if items are missing from my order?",
        a: "If any items are missing, go to the order in 'My Orders', tap 'Get Help', and report the issue. We'll investigate and offer a refund or re-delivery.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Refunds",
    color: "text-success",
    bg: "bg-success-light",
    faqs: [
      {
        q: "What payment methods are accepted?",
        a: "We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards, Net Banking, and DigiStrive Wallet.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5–7 business days to your original payment method. Wallet refunds are instant.",
      },
      {
        q: "What is DigiStrive Wallet?",
        a: "DigiStrive Wallet is a prepaid wallet for faster, seamless payments. Cashback and refunds can be credited here instantly.",
      },
    ],
  },
  {
    icon: MapPin,
    title: "Address & Location",
    color: "text-warning",
    bg: "bg-warning-light",
    faqs: [
      {
        q: "How do I add a new delivery address?",
        a: "Go to Profile → Manage Addresses → Add New Address. You can save multiple addresses (Home, Work, Other).",
      },
      {
        q: "Can I change my delivery address after placing an order?",
        a: "Address changes are only possible before the restaurant accepts your order. Contact support immediately if you need to change it.",
      },
    ],
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    color: "text-error",
    bg: "bg-error-light",
    faqs: [
      {
        q: "How do I rate my order?",
        a: "After your order is delivered, go to 'My Orders' and tap the 'Rate' button on your past order. You can rate both the food and delivery experience.",
      },
      {
        q: "Can I edit my review?",
        a: "Currently, reviews cannot be edited after submission. Please make sure your rating and review are accurate before submitting.",
      },
    ],
  },
];

const ACTIVE_TICKETS = [
  {
    _id: "ticket_001",
    issue: "Missing item in order ORD-20260606-001",
    status: "in_progress",
    updatedAt: "2 hours ago",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null); // "sectionIdx-faqIdx"
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleFaq = (key) => setOpenFaq((prev) => (prev === key ? null : key));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setForm({ subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="py-4 max-w-lg mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Help & Support</h1>
      </div>

      {/* Quick contact */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="mailto:support@digistrive.com"
          className="flex flex-col items-center gap-2 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-4 hover:border-primary hover:bg-primary-50/30 transition-all"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <Mail size={18} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-primary">Email Us</p>
            <p className="text-xs text-text-tertiary">support@digistrive.com</p>
          </div>
        </a>
        <a
          href="tel:18001234567"
          className="flex flex-col items-center gap-2 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-4 hover:border-primary hover:bg-primary-50/30 transition-all"
        >
          <div className="w-10 h-10 bg-success-light rounded-full flex items-center justify-center">
            <Phone size={18} className="text-success" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-primary">Call Us</p>
            <p className="text-xs text-text-tertiary">1800-123-4567 (Free)</p>
          </div>
        </a>
      </div>

      {/* Active tickets */}
      {ACTIVE_TICKETS.length > 0 && (
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <AlertCircle size={15} className="text-warning" />
            <p className="text-sm font-bold text-text-primary">Active Issues</p>
          </div>
          {ACTIVE_TICKETS.map((t) => (
            <div key={t._id} className="px-4 pb-4">
              <div className="bg-warning-light rounded-[var(--radius-lg)] px-3 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{t.issue}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">Updated {t.updatedAt}</p>
                </div>
                <span className="text-xs font-bold text-warning bg-white px-2 py-1 rounded-full">In Progress</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQs */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-text-primary px-1">Frequently Asked Questions</h2>
        {FAQ_SECTIONS.map((section, sIdx) => {
          const Icon = section.icon;
          return (
            <div key={sIdx} className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
              {/* Section header */}
              <div className="px-4 py-3 flex items-center gap-2.5 border-b border-border-light">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${section.bg}`}>
                  <Icon size={15} className={section.color} />
                </div>
                <p className="text-sm font-bold text-text-primary">{section.title}</p>
              </div>

              {/* FAQs */}
              <div className="divide-y divide-border-light">
                {section.faqs.map((faq, fIdx) => {
                  const key = `${sIdx}-${fIdx}`;
                  const isOpen = openFaq === key;
                  return (
                    <div key={fIdx}>
                      <button
                        onClick={() => toggleFaq(key)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-bg-hover transition-colors"
                      >
                        <span className={`text-sm font-medium pr-3 ${isOpen ? "text-primary" : "text-text-primary"}`}>
                          {faq.q}
                        </span>
                        {isOpen
                          ? <ChevronUp size={15} className="text-primary shrink-0" />
                          : <ChevronDown size={15} className="text-text-tertiary shrink-0" />
                        }
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-text-secondary leading-relaxed bg-bg-secondary rounded-[var(--radius-lg)] px-3 py-3">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact form */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle size={16} className="text-primary" />
          <h2 className="text-sm font-bold text-text-primary">Send us a message</h2>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <div className="w-14 h-14 bg-success-light rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} className="text-success" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Message sent!</p>
              <p className="text-xs text-text-secondary mt-1">We'll reply within 24 hours.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors appearance-none"
              >
                <option value="">Select a topic</option>
                <option value="order">Order issue</option>
                <option value="payment">Payment / Refund</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Describe your issue in detail…"
                rows={4}
                className="w-full px-4 py-3 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !form.subject || !form.message.trim()}
              className="w-full h-11 bg-primary text-white font-bold text-sm rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send Message</>}
            </button>
          </form>
        )}
      </div>

      <div className="h-2" />
    </div>
  );
}
