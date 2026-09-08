"use client";

import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui";
import useOrderStore from "@/stores/orderStore";

// Mirrors backend SELF_CANCELLABLE_STATUSES (order.controller.js) — past this,
// food/kitchen or a rider may already be committed, so cancellation needs the
// restaurant's sign-off instead of happening instantly.
const SELF_CANCELLABLE = ["pending_payment", "placed", "confirmed"];
const TERMINAL = ["delivered", "cancelled"];

// Drop-in cancel control for the order details and tracking pages — same
// component so the two surfaces can never drift out of sync on this logic.
export default function OrderCancelAction({ order, onUpdated, className = "" }) {
  const { cancelOrder, requestCancelOrder } = useOrderStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!order || TERMINAL.includes(order.status)) return null;

  const request = order.cancellationRequest;

  if (request?.status === "pending") {
    return (
      <div className={`flex items-start gap-2.5 bg-warning-light border border-warning/30 rounded-[var(--radius-lg)] px-4 py-3 ${className}`}>
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-warning-dark">Cancellation requested — waiting for the restaurant to respond.</p>
      </div>
    );
  }

  if (request?.status === "denied") {
    return (
      <div className={`bg-error-light border border-error/20 rounded-[var(--radius-lg)] px-4 py-3 ${className}`}>
        <p className="text-sm font-semibold text-error-dark">Cancellation request declined</p>
        {request.restaurantResponse && (
          <p className="text-sm text-error-dark/80 mt-1">&quot;{request.restaurantResponse}&quot;</p>
        )}
      </div>
    );
  }

  const canSelfCancel = SELF_CANCELLABLE.includes(order.status);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const updated = canSelfCancel
        ? await cancelOrder(order._id, reason)
        : await requestCancelOrder(order._id, reason);
      toast.success(canSelfCancel ? "Order cancelled" : "Cancellation request sent to the restaurant");
      setModalOpen(false);
      setReason("");
      onUpdated?.(updated);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center justify-center gap-2 h-11 px-4 border border-error/30 text-error text-sm font-semibold rounded-[var(--radius-lg)] hover:bg-error-light transition-colors ${className}`}
      >
        <XCircle size={16} />
        {canSelfCancel ? "Cancel Order" : "Request Cancellation"}
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        title={canSelfCancel ? "Cancel this order?" : "Request cancellation?"}
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              disabled={loading}
              className="h-10 px-4 border border-border-light rounded-[var(--radius-lg)] text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-60"
            >
              Never mind
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="h-10 px-5 bg-error text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-error/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait…" : canSelfCancel ? "Yes, cancel" : "Send request"}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary mb-3">
          {canSelfCancel
            ? "This order hasn't been accepted yet, so it can be cancelled right away."
            : "The restaurant may already be preparing this order or a rider may be on the way — they'll need to confirm before it's cancelled."}
        </p>
        <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Let them know why…"
          className="w-full text-sm border border-border-light rounded-[var(--radius-md)] px-3 py-2 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </Modal>
    </>
  );
}
