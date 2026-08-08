"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ChevronDown, ChevronUp, Mail, Phone,
  HelpCircle, Package, CreditCard, MapPin, Star,
  Clock, CheckCheck, Loader2, MessageCircle,
} from "lucide-react";
import useSupportTicketStore from "@/stores/supportTicketStore";

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
        a: "Open the order in 'My Orders' and tap 'Get Help' — you can report the exact item(s) affected and the restaurant will follow up directly.",
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
        a: "We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards, Net Banking, and Cash on Delivery.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5–7 business days to your original payment method.",
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

const STATUS_META = {
  open: { label: "Open", color: "text-warning", bg: "bg-warning-light", icon: Clock },
  resolved: { label: "Resolved", color: "text-success", bg: "bg-success-light", icon: CheckCheck },
};

function TicketRow({ ticket }) {
  const s = STATUS_META[ticket.status] || STATUS_META.open;
  const Icon = s.icon;
  return (
    <Link
      href={`/orders/${ticket.order?._id}/support?ticket=${ticket._id}`}
      className="flex items-start gap-3 bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-3.5 hover:border-primary/40 transition-all"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
        <Icon size={15} className={s.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{ticket.categoryLabel}</p>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">{ticket.subCategoryLabel}</p>
        <p className="text-xs text-text-tertiary mt-1">
          Order #{ticket.order?.orderNumber} · {ticket.restaurant?.name}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${s.bg} ${s.color}`}>{s.label}</span>
    </Link>
  );
}

export default function SupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const { myTickets, isLoading, fetchMyTickets } = useSupportTicketStore();

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const toggleFaq = (key) => setOpenFaq((prev) => (prev === key ? null : key));

  const liveIssues = myTickets.filter((t) => t.status === "open");
  const pastIssues = myTickets.filter((t) => t.status === "resolved");

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
          href="mailto:support@Sri Isha Cafe.com"
          className="flex flex-col items-center gap-2 bg-white border border-border-light rounded-[var(--radius-xl)] px-4 py-4 hover:border-primary hover:bg-primary-50/30 transition-all"
        >
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            <Mail size={18} className="text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-text-primary">Email Us</p>
            <p className="text-xs text-text-tertiary">support@Sri Isha Cafe.com</p>
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

      {/* Live + Past issues (real data) */}
      {isLoading && myTickets.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={20} className="text-primary animate-spin" />
        </div>
      ) : (
        <>
          {liveIssues.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-base font-bold text-text-primary px-1">Live Issues</h2>
              {liveIssues.map((t) => <TicketRow key={t._id} ticket={t} />)}
            </div>
          )}

          {pastIssues.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-base font-bold text-text-primary px-1">Past Issues</h2>
              {pastIssues.map((t) => <TicketRow key={t._id} ticket={t} />)}
            </div>
          )}

          {myTickets.length === 0 && (
            <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-6 text-center">
              <MessageCircle size={26} className="text-text-tertiary mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-primary">No issues reported yet</p>
              <p className="text-xs text-text-tertiary mt-1">
                Open an order and tap &quot;Get Help&quot; to report a problem with it.
              </p>
            </div>
          )}

          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 h-11 border-2 border-primary text-primary text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-50 transition-colors"
          >
            <HelpCircle size={15} /> Report an issue with an order
          </Link>
        </>
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

      <div className="h-2" />
    </div>
  );
}
