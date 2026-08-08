"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle, Clock, CheckCircle2, Send, Loader2, Check, X,
  ChevronDown, ChevronUp, ShoppingBag, User, Phone, Mail,
} from "lucide-react";
import useRestaurantSupportStore from "@/stores/restaurantSupportStore";
import { connectSocket } from "@/lib/socket";
import { timeAgo } from "@/lib/utils";

const STATUS_STYLES = {
  open: { label: "Open", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
};

function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-xl flex items-center gap-2 animate-slide-up">
      <Check size={16} className="text-green-400" />
      {message}
      <button onClick={onClose} className="ml-2 hover:text-gray-300"><X size={14} /></button>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isRestaurant = msg.from === "restaurant";
  return (
    <div className={`flex ${isRestaurant ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-[var(--radius-lg)] px-3 py-2.5 ${
        isRestaurant ? "bg-[#FF5722] text-white rounded-br-sm" : "bg-bg-secondary border border-border-light text-text-primary rounded-bl-sm"
      }`}>
        <p className={`text-xs font-semibold mb-1 ${isRestaurant ? "text-white/80" : "text-text-tertiary"}`}>
          {isRestaurant ? "You" : "Customer"}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] mt-1.5 ${isRestaurant ? "text-white/60" : "text-text-tertiary"}`}>
          {timeAgo(msg.at)}
        </p>
      </div>
    </div>
  );
}

export default function CustomerIssuesPage() {
  const { tickets, isLoading, fetchTickets, upsertTicket, sendMessage, resolveTicket } = useRestaurantSupportStore();
  const [statusFilter, setStatusFilter] = useState("open");
  const [expandedId, setExpandedId] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [sending, setSending] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch the full list once — the tab filter below is purely client-side so it
  // doesn't fight the Sidebar's badge count over the same shared store slice
  // (see Sidebar.jsx for why both sides always fetch "all", never a status filter).
  useEffect(() => {
    fetchTickets("all");
  }, [fetchTickets]);

  // Real-time — new tickets and updates from customers. Deliberately does NOT call
  // disconnectSocket() on unmount: the Sidebar shares this same socket connection
  // and only wires its listeners once, so tearing it down here would silently kill
  // the Sidebar's live badge for the rest of the session.
  useEffect(() => {
    const socket = connectSocket();

    const onNew = ({ ticket }) => {
      upsertTicket(ticket);
      showToast(`New issue reported: ${ticket.categoryLabel}`);
    };
    const onUpdated = ({ ticket }) => {
      upsertTicket(ticket);
    };

    socket.on("new_support_ticket", onNew);
    socket.on("support_ticket_updated", onUpdated);

    return () => {
      socket.off("new_support_ticket", onNew);
      socket.off("support_ticket_updated", onUpdated);
    };
  }, [upsertTicket]);

  const toggleExpand = (id) => setExpandedId((p) => (p === id ? null : id));

  const handleReply = async (ticketId) => {
    const text = replyTexts[ticketId]?.trim();
    if (!text) return;
    setSending(ticketId);
    try {
      await sendMessage(ticketId, text);
      setReplyTexts((p) => ({ ...p, [ticketId]: "" }));
      showToast("Reply sent!");
    } catch {
      showToast("Failed to send reply");
    } finally {
      setSending(null);
    }
  };

  const handleResolve = async (ticketId) => {
    setResolving(ticketId);
    try {
      await resolveTicket(ticketId);
      showToast("Marked as resolved");
    } catch {
      showToast("Failed to resolve");
    } finally {
      setResolving(null);
    }
  };

  const visibleTickets = statusFilter === "all" ? tickets : tickets.filter((t) => t.status === statusFilter);
  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Customer Issues</h1>
        <p className="text-sm text-text-secondary mt-0.5">Complaints reported by customers on their orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: "open", label: "Open", count: openCount },
          { key: "resolved", label: "Resolved", count: resolvedCount },
          { key: "all", label: "All", count: tickets.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-semibold transition-colors ${
              statusFilter === tab.key
                ? "bg-[#FF5722] text-white"
                : "bg-white border border-border-light text-text-secondary hover:bg-bg-hover"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? "bg-white/20" : "bg-bg-secondary"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading && tickets.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="text-[#FF5722] animate-spin" />
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className="text-center py-16 border border-border-light rounded-[var(--radius-xl)] bg-white">
          <MessageCircle size={32} className="text-text-tertiary mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-primary">No {statusFilter !== "all" ? statusFilter : ""} issues</p>
          <p className="text-xs text-text-tertiary mt-1">Customer-reported issues will show up here in real time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTickets.map((ticket) => {
            const s = STATUS_STYLES[ticket.status];
            const StatusIcon = s.icon;
            const isExpanded = expandedId === ticket._id;

            return (
              <div key={ticket._id} className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-start gap-3 hover:bg-bg-secondary/50 transition-colors text-left"
                  onClick={() => toggleExpand(ticket._id)}
                >
                  <StatusIcon size={18} className={ticket.status === "open" ? "text-yellow-500" : "text-green-500"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                      <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShoppingBag size={10} /> #{ticket.order?.orderNumber}
                      </span>
                      {ticket.customer?.name && (
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <User size={10} /> {ticket.customer.name}
                        </span>
                      )}
                      {ticket.customer?.phone && (
                        <span className="text-xs text-text-tertiary flex items-center gap-1">
                          <Phone size={10} /> {ticket.customer.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-text-primary mt-1">{ticket.categoryLabel}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{ticket.subCategoryLabel}</p>
                    {ticket.affectedItems?.length > 0 && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Items: {ticket.affectedItems.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-text-tertiary mt-1">
                      Reported {timeAgo(ticket.createdAt)} · {ticket.messages.length} message{ticket.messages.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-text-tertiary mt-0.5">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border-light">
                    {/* Contact the customer — phone/email may vary depending on how they signed up */}
                    <div className="px-5 py-3 bg-bg-secondary/40 border-b border-border-light flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">Contact customer</span>
                      {ticket.customer?.name && (
                        <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
                          <User size={12} /> {ticket.customer.name}
                        </span>
                      )}
                      {ticket.customer?.phone && (
                        <a
                          href={`tel:${ticket.customer.phone}`}
                          className="text-xs font-semibold text-[#FF5722] flex items-center gap-1 hover:underline"
                        >
                          <Phone size={12} /> {ticket.customer.phone}
                        </a>
                      )}
                      {ticket.customer?.email && (
                        <a
                          href={`mailto:${ticket.customer.email}`}
                          className="text-xs font-semibold text-[#FF5722] flex items-center gap-1 hover:underline"
                        >
                          <Mail size={12} /> {ticket.customer.email}
                        </a>
                      )}
                      {!ticket.customer?.phone && !ticket.customer?.email && (
                        <span className="text-xs text-text-tertiary">No contact details on file</span>
                      )}
                    </div>

                    <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                      {ticket.messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                      ))}
                    </div>

                    {ticket.status !== "resolved" && (
                      <div className="px-5 py-3 border-t border-border-light bg-bg-secondary/30 space-y-3">
                        <div className="flex gap-2">
                          <textarea
                            value={replyTexts[ticket._id] || ""}
                            onChange={(e) => setReplyTexts((p) => ({ ...p, [ticket._id]: e.target.value }))}
                            placeholder="Message the customer…"
                            rows={2}
                            className="flex-1 text-sm bg-white border border-border-light rounded-[var(--radius-md)] px-3 py-2 resize-none focus:outline-none focus:border-[#FF5722] text-text-primary"
                          />
                          <button
                            onClick={() => handleReply(ticket._id)}
                            disabled={sending === ticket._id || !replyTexts[ticket._id]?.trim()}
                            className="self-end h-9 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] flex items-center gap-1.5 hover:bg-[#e64a19] transition-colors disabled:opacity-50"
                          >
                            {sending === ticket._id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            Send
                          </button>
                        </div>
                        <button
                          onClick={() => handleResolve(ticket._id)}
                          disabled={resolving === ticket._id}
                          className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-[var(--radius-md)] hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {resolving === ticket._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                    {ticket.status === "resolved" && (
                      <div className="px-5 py-3 border-t border-border-light">
                        <p className="text-xs text-text-tertiary text-center">This issue is resolved.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
