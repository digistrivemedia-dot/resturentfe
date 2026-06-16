"use client";

import { useState } from "react";
import {
  MessageCircle, ChevronDown, ChevronUp, Plus, Send,
  Clock, CheckCircle2, AlertCircle, Phone, Mail,
  HelpCircle, X, Check, Loader2, Tag, ArrowUpRight,
} from "lucide-react";
import { Modal } from "@/components/ui";
import { timeAgo, formatDate } from "@/lib/utils";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const TICKETS = [
  {
    id: "TKT-1041",
    subject: "Wrong item delivered in order #ORD-20260603-088",
    category: "order_issue",
    status: "open",
    priority: "high",
    createdAt: "2026-06-05T09:30:00Z",
    lastUpdate: "2026-06-05T11:45:00Z",
    messages: [
      { from: "restaurant", text: "A customer received the wrong item. Order #ORD-20260603-088 had Dal Makhani but Paneer Butter Masala was delivered. Please help resolve.", time: "2026-06-05T09:30:00Z" },
      { from: "support", text: "Thank you for reporting. We've flagged the order for review. Our team will investigate and update you within 4 hours.", time: "2026-06-05T11:45:00Z" },
    ],
  },
  {
    id: "TKT-1038",
    subject: "Menu item 'Chicken Korma' not showing on app",
    category: "menu",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-06-04T14:20:00Z",
    lastUpdate: "2026-06-05T08:10:00Z",
    messages: [
      { from: "restaurant", text: "Chicken Korma was added 2 days ago but it's still not visible on the customer app. Can you check?", time: "2026-06-04T14:20:00Z" },
      { from: "support", text: "We're looking into this. It could be a cache issue on our end. Please give us 24 hours.", time: "2026-06-04T16:00:00Z" },
      { from: "restaurant", text: "It's been 36 hours and still not visible. This is affecting my sales.", time: "2026-06-05T08:00:00Z" },
      { from: "support", text: "Escalating to our technical team. You'll hear back within 2 hours.", time: "2026-06-05T08:10:00Z" },
    ],
  },
  {
    id: "TKT-1031",
    subject: "Payout for week of 27 Apr not received",
    category: "payments",
    status: "resolved",
    priority: "high",
    createdAt: "2026-05-06T10:00:00Z",
    lastUpdate: "2026-05-08T15:30:00Z",
    messages: [
      { from: "restaurant", text: "Expected payout of ₹16,456 for the week of April 21–27 hasn't been credited.", time: "2026-05-06T10:00:00Z" },
      { from: "support", text: "We've verified the payout. There was a bank processing delay. Funds should reflect within 1 business day.", time: "2026-05-07T09:00:00Z" },
      { from: "restaurant", text: "Confirmed received. Thank you!", time: "2026-05-08T15:30:00Z" },
    ],
  },
  {
    id: "TKT-1025",
    subject: "Unable to log in after password reset",
    category: "technical",
    status: "resolved",
    priority: "low",
    createdAt: "2026-04-28T18:00:00Z",
    lastUpdate: "2026-04-29T09:45:00Z",
    messages: [
      { from: "restaurant", text: "After resetting my password, the new one isn't working. I'm locked out.", time: "2026-04-28T18:00:00Z" },
      { from: "support", text: "We've manually reset your credentials and sent a temporary password to your registered email.", time: "2026-04-29T09:45:00Z" },
    ],
  },
  {
    id: "TKT-1019",
    subject: "Request to update restaurant operating hours",
    category: "other",
    status: "resolved",
    priority: "low",
    createdAt: "2026-04-20T11:30:00Z",
    lastUpdate: "2026-04-21T10:00:00Z",
    messages: [
      { from: "restaurant", text: "Please update our hours. We're now open until midnight (12:00 AM) instead of 11 PM.", time: "2026-04-20T11:30:00Z" },
      { from: "support", text: "Done! Your operating hours have been updated to 10:00 AM – 12:00 AM.", time: "2026-04-21T10:00:00Z" },
    ],
  },
];

const CATEGORY_LABELS = {
  order_issue: "Order Issue",
  menu: "Menu & Items",
  payments: "Payments",
  technical: "Technical",
  other: "Other",
};

const STATUS_STYLES = {
  open:        { label: "Open",        cls: "bg-blue-100 text-blue-700 border-blue-200",   icon: MessageCircle },
  in_progress: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  resolved:    { label: "Resolved",    cls: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle2 },
};

const PRIORITY_STYLES = {
  high:   "bg-red-100 text-red-600 border-red-200",
  medium: "bg-orange-100 text-orange-600 border-orange-200",
  low:    "bg-gray-100 text-gray-500 border-gray-200",
};

const FAQ_CATEGORIES = [
  {
    title: "Orders & Cancellations",
    faqs: [
      { q: "How do I accept or reject incoming orders?", a: "Go to the Live Orders section on your Dashboard. New orders appear there in real-time with Accept and Reject buttons. You have 3 minutes to respond before the order auto-cancels." },
      { q: "Can I cancel an order after accepting it?", a: "Once accepted, you can cancel from the Orders page within 5 minutes. After 5 minutes, contact support for assisted cancellation. Frequent cancellations may affect your restaurant rating." },
      { q: "What happens if I miss too many orders?", a: "Missing 3+ orders in a day triggers a warning. Repeated misses can temporarily suspend your listing. We recommend marking yourself offline if you're unable to take orders." },
    ],
  },
  {
    title: "Menu & Items",
    faqs: [
      { q: "How long does it take for menu changes to appear?", a: "Menu updates are usually reflected within 15–30 minutes. During peak hours, it may take up to 2 hours. If changes don't appear after 24 hours, raise a support ticket." },
      { q: "Can I set items as temporarily unavailable?", a: "Yes! On the Menu page, click the toggle next to any item to mark it as unavailable. Customers won't be able to order that item until you re-enable it." },
      { q: "How do I add combo deals or offers?", a: "Go to the Coupons section to create discount codes or combo offers. You can also create special pricing directly in the Menu section using the 'Add Variant' feature." },
    ],
  },
  {
    title: "Payments & Payouts",
    faqs: [
      { q: "When will I receive my payout?", a: "Payouts are processed every Monday for the previous week (Mon–Sun). Funds typically take 1–2 business days to reflect in your bank account depending on your bank." },
      { q: "Why was my payout amount less than expected?", a: "Payouts = Gross Sales – 10% Platform Fee – 2% TDS. You can see a detailed breakdown in the Payments section. Reach out to support if numbers still don't match." },
      { q: "How do I download my invoice or tax report?", a: "In the Payments section, click 'Invoice' next to any paid payout row. For annual tax reports, scroll to the Tax & Compliance section and select the financial year." },
    ],
  },
  {
    title: "Account & Settings",
    faqs: [
      { q: "How do I update my restaurant address?", a: "Address changes require document verification. Contact support with your new address proof (electricity bill or lease agreement). Changes are processed within 3–5 business days." },
      { q: "Can I have multiple users for the same restaurant?", a: "Multi-user access is coming soon. Currently, one account per restaurant is supported. You can share your login credentials with your manager in the meantime." },
      { q: "How do I temporarily close my restaurant?", a: "Toggle the Open/Closed switch on your Profile page or Dashboard. You can also schedule automatic offline periods in Settings → Operating Hours." },
    ],
  },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-xl flex items-center gap-2 animate-slide-up">
      <Check size={16} className="text-green-400" />
      {message}
      <button onClick={onClose} className="ml-2 hover:text-gray-300"><X size={14} /></button>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isRestaurant = msg.from === "restaurant";
  return (
    <div className={`flex ${isRestaurant ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-[var(--radius-lg)] px-3 py-2.5 ${
        isRestaurant
          ? "bg-[#FF5722] text-white rounded-br-sm"
          : "bg-bg-secondary border border-border-light text-text-primary rounded-bl-sm"
      }`}>
        <p className={`text-xs font-semibold mb-1 ${isRestaurant ? "text-white/80" : "text-text-tertiary"}`}>
          {isRestaurant ? "You" : "Support Agent"}
        </p>
        <p className="text-sm leading-relaxed">{msg.text}</p>
        <p className={`text-[10px] mt-1.5 ${isRestaurant ? "text-white/60" : "text-text-tertiary"}`}>
          {timeAgo(msg.time)}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [tickets, setTickets] = useState(TICKETS);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [sending, setSending] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    category: "order_issue",
    priority: "medium",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleTicket = (id) => setExpandedTicket((p) => (p === id ? null : id));

  const handleReply = async (ticketId) => {
    const text = replyTexts[ticketId]?.trim();
    if (!text) return;
    setSending(ticketId);
    await new Promise((r) => setTimeout(r, 600));
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [...t.messages, { from: "restaurant", text, time: new Date().toISOString() }],
              lastUpdate: new Date().toISOString(),
            }
          : t
      )
    );
    setReplyTexts((p) => ({ ...p, [ticketId]: "" }));
    setSending(null);
    showToast("Reply sent!");
  };

  const handleNewTicket = async () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const newId = `TKT-${1042 + tickets.length}`;
    const newTicket = {
      id: newId,
      subject: newTicketForm.subject,
      category: newTicketForm.category,
      status: "open",
      priority: newTicketForm.priority,
      createdAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      messages: [{ from: "restaurant", text: newTicketForm.description, time: new Date().toISOString() }],
    };
    setTickets((p) => [newTicket, ...p]);
    setSubmitting(false);
    setNewTicketOpen(false);
    setNewTicketForm({ subject: "", category: "order_issue", priority: "medium", description: "" });
    showToast(`Ticket ${newId} created! Our team will respond within 4 hours.`);
  };

  const toggleFaq = (key) => setOpenFaq((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Help & Support</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage tickets, get help, and find quick answers</p>
        </div>
        <button
          onClick={() => setNewTicketOpen(true)}
          className="flex items-center gap-2 h-10 px-5 bg-[#FF5722] text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-[#e64a19] transition-colors"
        >
          <Plus size={16} /> Open New Ticket
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT: Tickets (2/3) ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Status summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Open", count: tickets.filter((t) => t.status === "open").length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "In Progress", count: tickets.filter((t) => t.status === "in_progress").length, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length, color: "text-green-600", bg: "bg-green-50" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className={`${bg} rounded-[var(--radius-lg)] px-4 py-3 text-center`}>
                <p className={`text-xl font-extrabold ${color}`}>{count}</p>
                <p className={`text-xs font-semibold ${color} opacity-80`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Tickets list */}
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const s = STATUS_STYLES[ticket.status];
              const StatusIcon = s.icon;
              const isExpanded = expandedTicket === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden"
                >
                  {/* Ticket header row */}
                  <button
                    className="w-full px-5 py-4 flex items-start gap-3 hover:bg-bg-secondary/50 transition-colors text-left"
                    onClick={() => toggleTicket(ticket.id)}
                  >
                    <StatusIcon size={18} className={ticket.status === "open" ? "text-blue-500" : ticket.status === "in_progress" ? "text-yellow-500" : "text-green-500"} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-text-tertiary">{ticket.id}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[ticket.priority]}`}>
                          {ticket.priority} priority
                        </span>
                        <span className="text-xs text-text-tertiary bg-bg-secondary px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[ticket.category]}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary mt-1 truncate">{ticket.subject}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Opened {timeAgo(ticket.createdAt)} · Last update {timeAgo(ticket.lastUpdate)} · {ticket.messages.length} message{ticket.messages.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-text-tertiary mt-0.5">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded thread */}
                  {isExpanded && (
                    <div className="border-t border-border-light">
                      {/* Message thread */}
                      <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
                        {ticket.messages.map((msg, i) => (
                          <MessageBubble key={i} msg={msg} />
                        ))}
                      </div>

                      {/* Reply box */}
                      {ticket.status !== "resolved" && (
                        <div className="px-5 py-3 border-t border-border-light bg-bg-secondary/30">
                          <div className="flex gap-2">
                            <textarea
                              value={replyTexts[ticket.id] || ""}
                              onChange={(e) => setReplyTexts((p) => ({ ...p, [ticket.id]: e.target.value }))}
                              placeholder="Type your reply…"
                              rows={2}
                              className="flex-1 text-sm bg-white border border-border-light rounded-[var(--radius-md)] px-3 py-2 resize-none focus:outline-none focus:border-[#FF5722] text-text-primary"
                            />
                            <button
                              onClick={() => handleReply(ticket.id)}
                              disabled={sending === ticket.id || !replyTexts[ticket.id]?.trim()}
                              className="self-end h-9 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] flex items-center gap-1.5 hover:bg-[#e64a19] transition-colors disabled:opacity-50"
                            >
                              {sending === ticket.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Send size={13} />
                              )}
                              Send
                            </button>
                          </div>
                        </div>
                      )}
                      {ticket.status === "resolved" && (
                        <div className="px-5 py-3 border-t border-border-light">
                          <p className="text-xs text-text-tertiary text-center">This ticket is resolved. Open a new ticket if you need further assistance.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: FAQ + Quick Contact (1/3, sticky) ── */}
        <div className="space-y-5 lg:sticky lg:top-6 self-start">

          {/* FAQ accordion */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light">
              <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <HelpCircle size={15} className="text-[#FF5722]" /> Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-border-light">
              {FAQ_CATEGORIES.map((cat, catIdx) => (
                <div key={catIdx}>
                  {/* Category header */}
                  <div className="px-5 py-3 bg-bg-secondary">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">{cat.title}</p>
                  </div>
                  {/* FAQs */}
                  {cat.faqs.map((faq, faqIdx) => {
                    const key = `${catIdx}-${faqIdx}`;
                    const isOpen = openFaq[key];
                    return (
                      <div key={key} className="border-t border-border-light">
                        <button
                          onClick={() => toggleFaq(key)}
                          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-bg-secondary/50 transition-colors"
                        >
                          <span className="text-xs font-semibold text-text-primary pr-3 leading-snug">{faq.q}</span>
                          {isOpen ? (
                            <ChevronUp size={14} className="text-text-tertiary shrink-0" />
                          ) : (
                            <ChevronDown size={14} className="text-text-tertiary shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-3">
                            <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Quick contact */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h2 className="text-sm font-bold text-text-primary mb-4">Quick Contact</h2>
            <div className="space-y-2.5">
              <a
                href="https://wa.me/918001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-[var(--radius-lg)] hover:bg-green-100 transition-colors group"
              >
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-green-800">WhatsApp Business</p>
                  <p className="text-[11px] text-green-600">+91 80012 34567</p>
                </div>
                <ArrowUpRight size={13} className="text-green-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="mailto:restaurant-support@digistrive.in"
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-[var(--radius-lg)] hover:bg-blue-100 transition-colors group"
              >
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-800">Email Support</p>
                  <p className="text-[11px] text-blue-600">restaurant-support@digistrive.in</p>
                </div>
                <ArrowUpRight size={13} className="text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-lg)]">
                <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-800">Emergency Hotline</p>
                  <p className="text-[11px] text-red-600 font-semibold">1800-XXX-XXXX · 24/7</p>
                </div>
                <span className="text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">FREE</span>
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary mt-3 leading-relaxed">
              For urgent order-related issues, use the emergency hotline. For all other queries, email or WhatsApp is preferred with a response time of &lt;4 hours.
            </p>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      <Modal
        isOpen={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        title="Open New Support Ticket"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Subject *</label>
            <input
              type="text"
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              className="w-full h-10 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 text-sm text-text-primary focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Category *</label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-10 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 text-sm text-text-primary focus:outline-none focus:border-[#FF5722]"
              >
                <option value="order_issue">Order Issue</option>
                <option value="menu">Menu & Items</option>
                <option value="payments">Payments</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Priority</label>
              <select
                value={newTicketForm.priority}
                onChange={(e) => setNewTicketForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full h-10 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 text-sm text-text-primary focus:outline-none focus:border-[#FF5722]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Description *</label>
            <textarea
              value={newTicketForm.description}
              onChange={(e) => setNewTicketForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Please describe your issue in detail. Include order IDs, item names, or any relevant information."
              rows={5}
              className="w-full bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary resize-none focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-md)]">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">Our team typically responds within 4 hours during business hours (9 AM – 10 PM).</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setNewTicketOpen(false)}
              className="flex-1 h-10 border border-border-light text-sm font-semibold text-text-secondary rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNewTicket}
              disabled={submitting || !newTicketForm.subject.trim() || !newTicketForm.description.trim()}
              className="flex-1 h-10 bg-[#FF5722] text-white text-sm font-bold rounded-[var(--radius-lg)] flex items-center justify-center gap-2 hover:bg-[#e64a19] transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
