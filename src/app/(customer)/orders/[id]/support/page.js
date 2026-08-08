"use client";

import { use, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ChevronRight, CheckCircle2, Loader2, Send,
  Clock, CheckCheck, MessageSquareText,
} from "lucide-react";
import useOrderStore from "@/stores/orderStore";
import useSupportTicketStore from "@/stores/supportTicketStore";
import { connectSocket } from "@/lib/socket";

function Header({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-border-light bg-white sticky top-0 z-10">
      <button onClick={onBack} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-base font-bold text-text-primary truncate">{title}</h1>
    </div>
  );
}

function OptionRow({ label, onClick, hint }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white rounded-[var(--radius-xl)] border border-border-light hover:border-primary hover:bg-primary-50/30 transition-all text-left"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary leading-snug">{label}</p>
        {hint && <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>}
      </div>
      <ChevronRight size={16} className="text-text-tertiary shrink-0" />
    </button>
  );
}

const STATUS_META = {
  open: { label: "Open", color: "text-warning", bg: "bg-warning-light", icon: Clock },
  resolved: { label: "Resolved", color: "text-success", bg: "bg-success-light", icon: CheckCheck },
};

function TicketCard({ ticket, onClick }) {
  const s = STATUS_META[ticket.status] || STATUS_META.open;
  const Icon = s.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3.5 bg-white rounded-[var(--radius-xl)] border border-border-light hover:border-primary/40 transition-all text-left"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
        <Icon size={15} className={s.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{ticket.categoryLabel}</p>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">{ticket.subCategoryLabel}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${s.bg} ${s.color}`}>{s.label}</span>
    </button>
  );
}

function MessageBubble({ msg }) {
  const isCustomer = msg.from === "customer";
  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-[var(--radius-lg)] px-3.5 py-2.5 ${
        isCustomer ? "bg-primary text-white rounded-br-sm" : "bg-bg-secondary border border-border-light text-text-primary rounded-bl-sm"
      }`}>
        <p className={`text-[10px] font-semibold mb-1 ${isCustomer ? "text-white/70" : "text-text-tertiary"}`}>
          {isCustomer ? "You" : "Restaurant"}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] mt-1.5 ${isCustomer ? "text-white/60" : "text-text-tertiary"}`}>
          {new Date(msg.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
        </p>
      </div>
    </div>
  );
}

function OrderSupportContent({ orderId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get("ticket");
  const { currentOrder: order, fetchOrderById } = useOrderStore();
  const {
    categories, fetchCategories,
    ticketsByOrder, fetchTicketsForOrder,
    currentTicket, setCurrentTicket, fetchTicketById,
    createTicket, sendMessage, isSubmitting,
  } = useSupportTicketStore();

  const [loading, setLoading] = useState(true);
  // view: hub | category | subcategory | items | freetext | success | thread
  const [view, setView] = useState("hub");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedItemIdx, setSelectedItemIdx] = useState(new Set());
  const [customText, setCustomText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const tickets = ticketsByOrder[orderId] || [];

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([
        fetchOrderById(orderId),
        fetchCategories(),
        fetchTicketsForOrder(orderId),
      ]);
      // Deep link from /support ("?ticket=<id>") — jump straight to that thread
      if (ticketParam) {
        try {
          await fetchTicketById(ticketParam);
          setView("thread");
        } catch {
          // fall back to the hub if the ticket link is stale/invalid
        }
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, ticketParam]);

  // Real-time: keep the open thread in sync when the restaurant replies/resolves
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;
    const handler = ({ ticket }) => {
      if (currentTicket && ticket._id === currentTicket._id) {
        setCurrentTicket(ticket);
      }
    };
    socket.on("support_ticket_updated", handler);
    return () => socket.off("support_ticket_updated", handler);
  }, [currentTicket, setCurrentTicket]);

  const resetFlow = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedItemIdx(new Set());
    setCustomText("");
    setSubmitError("");
  };

  const goHub = () => {
    resetFlow();
    setView("hub");
  };

  const openTicket = async (ticket) => {
    setCurrentTicket(ticket);
    setView("thread");
    try {
      await fetchTicketById(ticket._id);
    } catch {
      // keep the already-known ticket data if refetch fails
    }
  };

  const availableCategories = categories.filter((c) => !c.deliveryOnly || order?.orderType === "delivery");

  const handlePickCategory = (cat) => {
    setSelectedCategory(cat);
    setView("subcategory");
  };

  const submitTicket = useCallback(async (overrides = {}) => {
    setSubmitError("");
    try {
      const subCategory = overrides.subCategory ?? selectedSubCategory;
      const affectedItems = [...selectedItemIdx].map((idx) => ({
        menuItem: order.items[idx].menuItem,
      }));
      const ticket = await createTicket({
        orderId,
        category: selectedCategory.key,
        subCategory: subCategory.key,
        affectedItems,
        customMessage: overrides.customMessage ?? customText,
      });
      setCurrentTicket(ticket);
      setView("success");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Couldn't submit your issue. Please try again.");
    }
  }, [selectedItemIdx, order, orderId, selectedCategory, selectedSubCategory, customText, createTicket, setCurrentTicket]);

  const handlePickSubCategory = (sub) => {
    setSelectedSubCategory(sub);
    setSubmitError(""); // clear any error left over from a previous failed attempt
    if (sub.isOther) {
      setView("freetext");
    } else if (sub.requiresItems) {
      setView("items");
    } else {
      // Nothing more to collect — submit right away. Pass sub explicitly rather
      // than relying on the selectedSubCategory state landing before this runs.
      setView("submitting");
      submitTicket({ subCategory: sub });
    }
  };

  const toggleItem = (idx) => {
    setSelectedItemIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !currentTicket) return;
    setSendingReply(true);
    try {
      await sendMessage(currentTicket._id, replyText.trim());
      setReplyText("");
    } catch {
      // toast-less inline failure is fine here — reply box keeps the typed text
    } finally {
      setSendingReply(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  // ── HUB ──────────────────────────────────────────────────────────────────
  if (view === "hub") {
    return (
      <div className="min-h-screen bg-bg-secondary pb-8">
        <Header title="Help with this order" onBack={() => router.back()} />
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-4 py-3.5">
            <p className="text-xs text-text-tertiary">Order</p>
            <p className="text-sm font-bold text-text-primary">#{order.orderNumber}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{order.restaurant?.name}</p>
          </div>

          {tickets.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-text-primary px-1">Your reported issues</h2>
              {tickets.map((t) => (
                <TicketCard key={t._id} ticket={t} onClick={() => openTicket(t)} />
              ))}
            </div>
          )}

          <button
            onClick={() => setView("category")}
            className="w-full h-12 bg-primary text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors"
          >
            {tickets.length > 0 ? "Report another issue" : "Report an issue"}
          </button>
        </div>
      </div>
    );
  }

  // ── CATEGORY PICKER ─────────────────────────────────────────────────────
  if (view === "category") {
    return (
      <div className="min-h-screen bg-bg-secondary pb-8">
        <Header title="What's the issue about?" onBack={goHub} />
        <div className="max-w-lg mx-auto px-4 py-5 space-y-2.5">
          {availableCategories.map((cat) => (
            <OptionRow key={cat.key} label={cat.label} onClick={() => handlePickCategory(cat)} />
          ))}
        </div>
      </div>
    );
  }

  // ── SUBCATEGORY PICKER ──────────────────────────────────────────────────
  if (view === "subcategory") {
    return (
      <div className="min-h-screen bg-bg-secondary pb-8">
        <Header title={selectedCategory.label} onBack={() => setView("category")} />
        <div className="max-w-lg mx-auto px-4 py-5 space-y-2.5">
          {selectedCategory.subCategories.map((sub) => (
            <OptionRow key={sub.key} label={sub.label} onClick={() => handlePickSubCategory(sub)} />
          ))}
        </div>
      </div>
    );
  }

  // ── ITEM PICKER (for item-specific issues) ──────────────────────────────
  if (view === "items") {
    const canContinue = selectedItemIdx.size > 0;
    return (
      <div className="min-h-screen bg-bg-secondary pb-28">
        <Header title={selectedSubCategory.label} onBack={() => setView("subcategory")} />
        <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
          <p className="text-xs text-text-secondary px-1">Select the item(s) this applies to</p>
          {order.items.map((item, idx) => {
            const checked = selectedItemIdx.has(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleItem(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[var(--radius-xl)] border-2 transition-all text-left ${
                  checked ? "border-primary bg-primary-50" : "border-border-light bg-white hover:border-primary/40"
                }`}
              >
                <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 ${
                  checked ? "bg-primary border-primary" : "border-border-default"
                }`}>
                  {checked && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-tertiary">Qty {item.quantity}</p>
                </div>
              </button>
            );
          })}
        </div>
        {submitError && (
          <div className="max-w-lg mx-auto px-4">
            <p className="text-xs text-error">{submitError}</p>
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 py-3">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => submitTicket()}
              disabled={!canContinue || isSubmitting}
              className="w-full h-12 bg-primary text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FREE TEXT (only reachable via "None of these") ──────────────────────
  if (view === "freetext") {
    return (
      <div className="min-h-screen bg-bg-secondary pb-28">
        <Header title="Describe your issue" onBack={() => setView("subcategory")} />
        <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Tell us what happened…"
            rows={6}
            autoFocus
            className="w-full px-4 py-3 text-sm border border-border-light rounded-[var(--radius-lg)] bg-white placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
          {submitError && <p className="text-xs text-error">{submitError}</p>}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 py-3">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => submitTicket({ customMessage: customText })}
              disabled={!customText.trim() || isSubmitting}
              className="w-full h-12 bg-primary text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUBMITTING (brief transition for zero-input sub-categories) ─────────
  // On failure this stays on "submitting" and swaps the spinner for a retry —
  // it must NOT jump to another view, since zero-input categories have no
  // items/text step to land on.
  if (view === "submitting") {
    if (submitError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm text-error">{submitError}</p>
          <button
            onClick={() => submitTicket()}
            className="h-11 px-6 bg-primary text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
          <button onClick={() => setView("subcategory")} className="text-xs text-text-tertiary hover:underline">
            Go back
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="text-primary animate-spin" />
        <p className="text-sm text-text-secondary">Submitting your issue…</p>
      </div>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (view === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
        <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">Your issue has been noted</h2>
          <p className="text-sm text-text-secondary mt-1.5 max-w-xs">
            {order.restaurant?.name} will get back to you within 24 hours.
          </p>
        </div>
        <button
          onClick={() => setView("thread")}
          className="mt-2 h-11 px-6 bg-primary text-white text-sm font-bold rounded-[var(--radius-xl)] hover:bg-primary-dark transition-colors"
        >
          View my issue
        </button>
        <button onClick={goHub} className="text-xs text-text-tertiary hover:underline">
          Back to help
        </button>
      </div>
    );
  }

  // ── THREAD ───────────────────────────────────────────────────────────────
  if (view === "thread" && currentTicket) {
    const isResolved = currentTicket.status === "resolved";
    return (
      <div className="min-h-screen bg-bg-secondary flex flex-col">
        <Header title={currentTicket.categoryLabel} onBack={goHub} />
        <div className="max-w-lg w-full mx-auto px-4 py-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              isResolved ? "bg-success-light text-success" : "bg-warning-light text-warning"
            }`}>
              {isResolved ? "Resolved" : "Open"}
            </span>
            <p className="text-xs text-text-tertiary">{currentTicket.subCategoryLabel}</p>
          </div>

          <div className="flex-1 space-y-3 mb-4">
            {currentTicket.messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
          </div>

          {isResolved ? (
            <div className="flex items-center gap-2 justify-center text-xs text-text-tertiary bg-white border border-border-light rounded-[var(--radius-lg)] px-4 py-3">
              <MessageSquareText size={14} /> This issue has been marked resolved
            </div>
          ) : (
            <div className="flex gap-2 sticky bottom-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 text-sm bg-white border border-border-light rounded-[var(--radius-lg)] px-3.5 py-3 resize-none focus:outline-none focus:border-primary text-text-primary"
              />
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className="w-11 h-11 shrink-0 bg-primary text-white rounded-[var(--radius-lg)] flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function OrderSupportPage({ params }) {
  const { id: orderId } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    }>
      <OrderSupportContent orderId={orderId} />
    </Suspense>
  );
}
