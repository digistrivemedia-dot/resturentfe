"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui";
import useOrderStore from "@/stores/orderStore";

const QUICK_TAGS = ["Great taste", "Fast delivery", "Good packaging", "Generous portions", "Hot & fresh", "Value for money"];

function ItemStarRow({ name, value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-text-primary truncate">{name}</p>
      <div className="flex gap-1 shrink-0">
        {[1,2,3,4,5].map((s) => (
          <button key={s} onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} className="transition-transform hover:scale-110">
            <Star size={22} className={`transition-colors ${s <= (hovered || value) ? "text-warning fill-warning" : "text-border-default"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

// Same dish can appear as multiple cart lines (different variants/addons) —
// rating attaches to the menu item itself, so dedupe by menuItem id.
function getRatableItems(order) {
  return order?.items?.reduce((acc, item) => {
    const key = item.menuItem ? String(item.menuItem) : item.name;
    if (!acc.some((i) => i.key === key)) acc.push({ key, menuItem: item.menuItem, name: item.name });
    return acc;
  }, []) || [];
}

export default function RateOrderModal({ order, isOpen, onClose, onRated }) {
  const rateOrderApi = useOrderStore((s) => s.rateOrder);
  const [itemRatings, setItemRatings] = useState({});
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [hoveredDelivery, setHoveredDelivery] = useState(0);
  const [tags, setTags] = useState([]);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rateError, setRateError] = useState("");

  if (!order) return null;

  const isDelivery = order.orderType === "delivery";
  const ratableItems = getRatableItems(order);
  const setItemRating = (key, value) => setItemRatings((prev) => ({ ...prev, [key]: value }));
  const allItemsRated = ratableItems.length > 0 && ratableItems.every((i) => itemRatings[i.key] > 0);
  const toggleTag = (t) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const reset = () => {
    setItemRatings({});
    setDeliveryRating(0);
    setTags([]);
    setReview("");
    setSubmitted(false);
    setRateError("");
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmitRating = async () => {
    if (!allItemsRated) {
      setRateError("Please rate every item");
      return;
    }
    setRateError("");
    try {
      const updated = await rateOrderApi(order._id, {
        itemRatings: ratableItems.map((i) => ({ menuItem: i.menuItem, name: i.name, rating: itemRatings[i.key] })),
        deliveryRating: isDelivery ? deliveryRating : undefined,
        review,
        tags,
      });
      setSubmitted(true);
      onRated?.(updated);
      setTimeout(() => {
        reset();
        onClose?.();
      }, 800);
    } catch (err) {
      setSubmitted(false);
      setRateError(err.response?.data?.message || "Couldn't submit your review, please try again");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rate Your Order">
      <div className="space-y-5">
        {/* Per-dish rating */}
        <div>
          <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><span>🍔</span> Rate each dish</p>
          <div className="space-y-3">
            {ratableItems.map((item) => (
              <ItemStarRow
                key={item.key}
                name={item.name}
                value={itemRatings[item.key] || 0}
                onChange={(v) => setItemRating(item.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Delivery rating */}
        {isDelivery && (
          <div>
            <p className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><span>🛵</span> Rate the delivery?</p>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setDeliveryRating(s)} onMouseEnter={() => setHoveredDelivery(s)} onMouseLeave={() => setHoveredDelivery(0)} className="transition-transform hover:scale-110">
                  <Star size={30} className={`transition-colors ${s <= (hoveredDelivery || deliveryRating) ? "text-warning fill-warning" : "text-border-default"}`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick tags */}
        <div>
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">Quick Tags</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((t) => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`h-8 px-3 text-xs font-semibold rounded-full border-2 transition-all ${tags.includes(t) ? "border-primary bg-primary-50 text-primary" : "border-border-light text-text-secondary hover:border-border-default"}`}
              >
                {tags.includes(t) ? "✓ " : ""}{t}
              </button>
            ))}
          </div>
        </div>

        {/* Review */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Write a review <span className="text-text-tertiary text-xs font-normal">(optional)</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell others about your experience…"
            rows={3}
            className="w-full px-4 py-3 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
        </div>

        {rateError && <p className="text-xs text-error text-center -mt-3">{rateError}</p>}

        <button
          onClick={handleSubmitRating}
          disabled={submitted}
          className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitted ? <><CheckCircle2 size={18} /> Submitted!</> : "Submit Review"}
        </button>
        {!allItemsRated && <p className="text-xs text-text-tertiary text-center -mt-3">Please rate every item to continue</p>}
      </div>
    </Modal>
  );
}
