"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Edit2,
  Award,
  ThumbsUp,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import useRestaurantReviewStore from "@/stores/restaurantReviewStore";

const REVIEWS_PER_PAGE = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function StarRow({ rating, size = "md" }) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sz} ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </span>
  );
}

function SubRatingChip({ label, value }) {
  const color =
    value >= 4 ? "bg-green-50 text-green-700 border-green-200"
    : value >= 3 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      <Star className="w-2.5 h-2.5 fill-current" />
      {value} {label}
    </span>
  );
}

const TAG_COLORS = {
  packaging: "bg-blue-50 text-blue-700 border-blue-200",
  taste: "bg-orange-50 text-orange-700 border-orange-200",
  portion: "bg-purple-50 text-purple-700 border-purple-200",
  spicy: "bg-red-50 text-red-700 border-red-200",
  "fast delivery": "bg-teal-50 text-teal-700 border-teal-200",
};

function TagPill({ tag }) {
  const cls = TAG_COLORS[tag] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${cls} capitalize`}>
      {tag}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ReviewCard
// ─────────────────────────────────────────────────────────────────────────────
function ReviewCard({ review, onToggleHighlight, onSendReply, onEditReply }) {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [replyText, setReplyText] = useState(review.reply?.text || "");
  const [sending, setSending] = useState(false);

  // Adapt backend shape to display fields
  const customerName = review.customer?.name || "Anonymous";
  const customerInitials = review.customer?.name?.charAt(0) || "?";
  const rating = review.foodRating || 0;
  const orderId = review.order?.orderNumber || "";
  const reviewText = review.review || "";
  const replied = !!review.reply?.text;
  const replyTextDisplay = review.reply?.text || "";

  const isLong = reviewText.length > 180;

  async function handleSend() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      if (editMode) {
        await onEditReply(review._id, replyText.trim());
        setEditMode(false);
      } else {
        await onSendReply(review._id, replyText.trim());
        setReplyOpen(false);
      }
    } catch (err) {
      // error handled by store
    }
    setSending(false);
  }

  function openEdit() {
    setReplyText(replyTextDisplay);
    setEditMode(true);
    setReplyOpen(false);
  }

  function cancelEdit() {
    setEditMode(false);
    setReplyText(replyTextDisplay);
  }

  const highlightedBorder = review.isHighlighted
    ? "border-l-4 border-l-amber-400"
    : "border-l-4 border-l-transparent";

  return (
    <div
      className={`bg-bg-primary rounded-[var(--radius-lg)] border border-border-light shadow-sm overflow-hidden transition-all duration-200 ${highlightedBorder}`}
    >
      <div className="p-5">
        {/* Top row: avatar + meta + actions */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FF5722, #FF8A65)" }}>
            {customerInitials}
          </div>

          {/* Name + date + stars */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-semibold text-text-primary text-sm">{customerName}</p>
                <p className="text-xs text-text-secondary mt-0.5">{timeAgo(review.createdAt || review.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Highlight toggle */}
                <button
                  onClick={() => onToggleHighlight(review._id)}
                  className={`p-1.5 rounded-[var(--radius-md)] transition-colors ${
                    review.isHighlighted
                      ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                      : "text-text-secondary hover:text-amber-500 hover:bg-amber-50"
                  }`}
                  title={review.isHighlighted ? "Remove highlight" : "Highlight review"}
                >
                  <Star className={`w-4 h-4 ${review.isHighlighted ? "fill-amber-500" : ""}`} />
                </button>
              </div>
            </div>
            <div className="mt-1.5">
              <StarRow rating={rating} />
            </div>
          </div>
        </div>

        {/* Order info */}
        <div className="mt-3 flex flex-wrap gap-1 items-center">
          <span className="text-xs text-text-secondary font-medium">Order:</span>
          <span className="text-xs text-text-secondary font-mono">{orderId}</span>
        </div>

        {/* Review text */}
        <div className="mt-3">
          <p className={`text-sm text-text-primary leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}>
            {reviewText}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium flex items-center gap-0.5 hover:opacity-80 transition-opacity"
              style={{ color: "#FF5722" }}
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Read less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Read more</>
              )}
            </button>
          )}
        </div>

        {/* Sub-ratings + tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {review.foodRating != null && (
            <SubRatingChip label="Food" value={review.foodRating} />
          )}
          {review.deliveryRating != null && (
            <SubRatingChip label="Delivery" value={review.deliveryRating} />
          )}
          {(review.tags || []).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        {/* Reply button (un-replied) */}
        {!replied && !replyOpen && (
          <button
            onClick={() => setReplyOpen(true)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-md)] border transition-colors hover:bg-opacity-90"
            style={{ color: "#FF5722", borderColor: "#FF5722" }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Reply
          </button>
        )}
      </div>

      {/* Inline reply textarea (new reply) */}
      {replyOpen && !replied && (
        <div className="px-5 pb-5 border-t border-border-light pt-4">
          <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Your Reply</p>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a thoughtful reply to this customer..."
            className="w-full text-sm rounded-[var(--radius-md)] border border-border-light p-3 bg-bg-secondary text-text-primary resize-none focus:outline-none focus:ring-2 placeholder:text-text-secondary"
            style={{ "--tw-ring-color": "#FF5722" }}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSend}
              disabled={sending || !replyText.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-[var(--radius-md)] text-white transition-opacity disabled:opacity-60"
              style={{ background: "#FF5722" }}
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Sending…" : "Send Reply"}
            </button>
            <button
              onClick={() => { setReplyOpen(false); setReplyText(""); }}
              className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-[var(--radius-md)] border border-border-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing reply (already replied) */}
      {replied && !editMode && (
        <div className="mx-5 mb-5 rounded-[var(--radius-md)] border border-border-light bg-bg-secondary p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#FF5722" }}>
              Owner Reply
            </p>
            <button
              onClick={openEdit}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">{replyTextDisplay}</p>
        </div>
      )}

      {/* Edit reply inline */}
      {editMode && (
        <div className="px-5 pb-5 border-t border-border-light pt-4">
          <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Edit Reply</p>
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full text-sm rounded-[var(--radius-md)] border border-border-light p-3 bg-bg-secondary text-text-primary resize-none focus:outline-none focus:ring-2 placeholder:text-text-secondary"
            style={{ "--tw-ring-color": "#FF5722" }}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSend}
              disabled={sending || !replyText.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-[var(--radius-md)] text-white transition-opacity disabled:opacity-60"
              style={{ background: "#FF5722" }}
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Saving…" : "Save Reply"}
            </button>
            <button
              onClick={cancelEdit}
              className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-[var(--radius-md)] border border-border-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const { reviews, pagination, isLoading, fetchReviews, replyToReview } = useRestaurantReviewStore();
  const [starFilter, setStarFilter] = useState("all");
  const [repliedFilter, setRepliedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  // Local highlight state (not backed by API)
  const [highlights, setHighlights] = useState({});

  useEffect(() => {
    try {
      fetchReviews({ rating: starFilter, page });
    } catch (err) {
      // error stored in store
    }
  }, [starFilter, page]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, avg: "0.0", distribution: [], responseRate: 0 };
    const avg = reviews.reduce((s, r) => s + (r.foodRating || 0), 0) / total;
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => (r.foodRating || 0) === star).length,
    }));
    const repliedCount = reviews.filter((r) => !!r.reply?.text).length;
    const responseRate = Math.round((repliedCount / total) * 100);
    return { total, avg: avg.toFixed(1), distribution, responseRate };
  }, [reviews]);

  // ── Filtered + sorted (client-side on current page's data) ────────────────
  const filtered = useMemo(() => {
    let list = [...reviews];
    if (repliedFilter === "replied") list = list.filter((r) => !!r.reply?.text);
    if (repliedFilter === "needs") list = list.filter((r) => !r.reply?.text);
    switch (sortBy) {
      case "oldest":   list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case "highest":  list.sort((a, b) => (b.foodRating || 0) - (a.foodRating || 0)); break;
      case "lowest":   list.sort((a, b) => (a.foodRating || 0) - (b.foodRating || 0)); break;
      default:         list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [reviews, repliedFilter, sortBy]);

  const totalPages = pagination.pages || Math.ceil(filtered.length / REVIEWS_PER_PAGE);
  const paginated = filtered;

  function resetPage() { setPage(1); }

  function handleToggleHighlight(id) {
    setHighlights((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSendReply(id, text) {
    try {
      await replyToReview(id, text);
    } catch (err) {
      // error stored in store
    }
  }

  async function handleEditReply(id, text) {
    try {
      await replyToReview(id, text);
    } catch (err) {
      // error stored in store
    }
  }

  // Merge highlight state into reviews for display
  const reviewsWithHighlight = paginated.map((r) => ({
    ...r,
    isHighlighted: highlights[r._id] || false,
  }));

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Page heading ────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Reviews</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage and respond to customer feedback</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-[#FF5722]" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Summary header ───────────────────────────────────────────────── */}
            <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Big average */}
                <div className="flex flex-col items-center justify-center min-w-[140px] py-2">
                  <span className="text-6xl font-bold text-text-primary leading-none">{stats.avg}</span>
                  <div className="mt-2">
                    <StarRow rating={Math.round(Number(stats.avg))} size="lg" />
                  </div>
                  <p className="text-sm text-text-secondary mt-1.5">{stats.total} reviews</p>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                    {Number(stats.avg) > 4.0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Award className="w-3.5 h-3.5" />
                        Top Rated
                      </span>
                    )}
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {stats.responseRate}% Response
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-border-light self-stretch" />

                {/* Star breakdown */}
                <div className="flex-1 space-y-2.5 w-full">
                  {stats.distribution.map(({ star, count }) => {
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    const barColor =
                      star >= 4 ? "#22c55e" : star === 3 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12 flex-shrink-0">
                          <span className="text-sm font-medium text-text-primary">{star}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <div className="flex items-center gap-1.5 w-16 flex-shrink-0 text-right">
                          <span className="text-xs font-medium text-text-primary w-4 text-right">{count}</span>
                          <span className="text-xs text-text-secondary">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Filter bar ───────────────────────────────────────────────────── */}
            <div className="bg-bg-primary rounded-[var(--radius-lg)] border border-border-light shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Star filter chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
                  {["all", "5", "4", "3", "2", "1"].map((v) => (
                    <button
                      key={v}
                      onClick={() => { setStarFilter(v); resetPage(); }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        starFilter === v
                          ? "text-white border-transparent"
                          : "text-text-secondary border-border-light hover:border-gray-300"
                      }`}
                      style={starFilter === v ? { background: "#FF5722" } : {}}
                    >
                      {v === "all" ? "All" : `${"⭐".repeat(1)} ${v}★`}
                    </button>
                  ))}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Replied filter */}
                  <div className="flex items-center gap-1 border border-border-light rounded-[var(--radius-md)] overflow-hidden">
                    {[
                      { value: "all", label: "All" },
                      { value: "replied", label: "Replied" },
                      { value: "needs", label: "Needs Reply" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setRepliedFilter(value); resetPage(); }}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          repliedFilter === value
                            ? "text-white"
                            : "text-text-secondary hover:bg-gray-50"
                        }`}
                        style={repliedFilter === value ? { background: "#FF5722" } : {}}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary" />
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                      className="text-xs text-text-primary border border-border-light rounded-[var(--radius-md)] px-2 py-1.5 bg-bg-primary focus:outline-none focus:ring-1 cursor-pointer"
                      style={{ "--tw-ring-color": "#FF5722" }}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Result count */}
              <p className="text-xs text-text-secondary mt-3">
                Showing {paginated.length} of {pagination.total || filtered.length} review{(pagination.total || filtered.length) !== 1 ? "s" : ""}
                {starFilter !== "all" && <span> · {starFilter}★ filter active</span>}
                {repliedFilter !== "all" && <span> · {repliedFilter === "replied" ? "Replied" : "Needs Reply"} filter active</span>}
              </p>
            </div>

            {/* ── Review list ──────────────────────────────────────────────────── */}
            {reviewsWithHighlight.length === 0 ? (
              <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-sm p-12 text-center">
                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-text-primary">No reviews found</p>
                <p className="text-sm text-text-secondary mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewsWithHighlight.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onToggleHighlight={handleToggleHighlight}
                    onSendReply={handleSendReply}
                    onEditReply={handleEditReply}
                  />
                ))}
              </div>
            )}

            {/* ── Pagination ───────────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="bg-bg-primary rounded-[var(--radius-lg)] border border-border-light shadow-sm px-5 py-3 flex items-center justify-between">
                <p className="text-xs text-text-secondary">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-border-light text-text-primary disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs font-semibold rounded-[var(--radius-md)] transition-colors ${
                        p === page ? "text-white" : "text-text-secondary hover:bg-gray-50 border border-border-light"
                      }`}
                      style={p === page ? { background: "#FF5722" } : {}}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-border-light text-text-primary disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
