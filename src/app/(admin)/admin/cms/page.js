"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import useImageUpload from "@/hooks/useImageUpload";
import {
  Image,
  Megaphone,
  Settings2,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Info,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Check,
  Globe,
  UtensilsCrossed,
  Link2,
  ChevronDown,
} from "lucide-react";
import { Modal } from "@/components/ui";
import useAdminBannerStore from "@/stores/adminBannerStore";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const BANNER_GRADIENTS = [
  "from-orange-400 to-red-500",
  "from-purple-400 to-pink-500",
  "from-blue-400 to-cyan-500",
  "from-green-400 to-teal-500",
  "from-yellow-400 to-orange-500",
  "from-rose-400 to-pink-600",
];


const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Platform Maintenance Scheduled",
    message:
      "We will be performing scheduled maintenance on June 10, 2026 from 2 AM to 4 AM IST. Services may be briefly unavailable.",
    type: "warning",
    targetAudience: "all",
    scheduledAt: "2026-06-08T10:00",
    expiresAt: "2026-06-10T04:00",
    isActive: true,
  },
  {
    id: 2,
    title: "New Partner Benefits Launched",
    message:
      "Restaurants with 4.5+ ratings now qualify for zero-commission weekends. Check your dashboard for details.",
    type: "promo",
    targetAudience: "restaurants",
    scheduledAt: "2026-06-05T09:00",
    expiresAt: "2026-06-30T23:59",
    isActive: true,
  },
  {
    id: 3,
    title: "App Update v4.2 Available",
    message:
      "Version 4.2 is live with faster checkout, live order tracking improvements, and a new dark mode option.",
    type: "info",
    targetAudience: "customers",
    scheduledAt: "2026-06-04T08:00",
    expiresAt: "2026-06-20T23:59",
    isActive: true,
  },
  {
    id: 4,
    title: "Referral Program — Earn ₹200",
    message:
      "Refer a friend and earn ₹200 credit on your next order. Your friend gets ₹100 off their first order.",
    type: "promo",
    targetAudience: "customers",
    scheduledAt: "2026-06-01T00:00",
    expiresAt: "2026-06-30T23:59",
    isActive: true,
  },
  {
    id: 5,
    title: "Partner Onboarding Webinar",
    message:
      "Join our live session on June 12 at 3 PM IST to learn about restaurant tools, analytics, and menu management.",
    type: "info",
    targetAudience: "partners",
    scheduledAt: "2026-06-06T12:00",
    expiresAt: "2026-06-12T15:00",
    isActive: false,
  },
];

const INITIAL_CONFIG = {
  general: {
    appName: "FoodRush",
    tagline: "Delivering Joy, One Bite at a Time",
    supportEmail: "support@foodrush.in",
    supportPhone: "+91 98765 43210",
  },
  delivery: {
    minOrderAmount: 99,
    defaultDeliveryRadiusKm: 5,
    maxDeliveryRadiusKm: 15,
    surgeMultiplier: 1.5,
  },
  commission: {
    defaultPlatformCommissionPct: 18,
    paymentGatewayFeePct: 2,
  },
  featureFlags: {
    maintenanceMode: false,
    newUserRegistration: true,
    restaurantSelfOnboarding: true,
    referralProgram: true,
    darkMode: false,
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const POSITION_LABELS = {
  home_top: "Home Top",
  home_mid: "Home Mid",
  category: "Category",
};

const POSITION_COLORS = {
  home_top: "bg-primary/10 text-primary",
  home_mid: "bg-blue-100 text-blue-700",
  category: "bg-purple-100 text-purple-700",
};

const TYPE_META = {
  info: {
    label: "Info",
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-700",
  },
  promo: {
    label: "Promo",
    icon: Tag,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "bg-orange-100 text-orange-700",
  },
};

const AUDIENCE_LABELS = {
  all: "All Users",
  customers: "Customers",
  restaurants: "Restaurants",
  partners: "Partners",
};

const AUDIENCE_COLORS = {
  all: "bg-gray-100 text-gray-700",
  customers: "bg-green-100 text-green-700",
  restaurants: "bg-orange-100 text-orange-700",
  partners: "bg-purple-100 text-purple-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function blankBanner() {
  return {
    id: null,
    title: "",
    subtitle: "",
    imageUrl: "",
    linkType: "url",
    linkValue: "",
    position: "home_top",
    isActive: true,
    order: 1,
  };
}

function blankAnnouncement() {
  return {
    id: null,
    title: "",
    message: "",
    type: "info",
    targetAudience: "all",
    scheduledAt: "",
    expiresAt: "",
    isActive: true,
  };
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      {children}
    </label>
  );
}

function BannerImageUpload({ imageUrl, onUrlChange }) {
  const fileRef = useRef(null);
  const { upload, isUploading, progress } = useImageUpload({ type: "banner" });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file);
    if (result) onUrlChange(result.url);
    e.target.value = "";
  };

  return (
    <div>
      <SectionLabel>Banner Image</SectionLabel>
      <div className="flex gap-2">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://... or upload a file"
          className="flex-1 px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-2 text-sm font-medium border border-border-light rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {isUploading ? `${progress}%` : "Upload"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </div>
      {isUploading && (
        <div className="mt-1.5 w-full bg-bg-secondary rounded-full h-1">
          <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-3 py-2 pr-8 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        />
      </div>
    </div>
  );
}

function FormToggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? "bg-primary" : "bg-border-default"}`}
      >
        <span
          className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

// ─── Tab: Banners ─────────────────────────────────────────────────────────────

function BannersTab() {
  const { banners, isLoading, isSaving, fetchBanners, createBanner, updateBanner, deleteBanner } =
    useAdminBannerStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(blankBanner());

  useEffect(() => {
    try {
      fetchBanners({});
    } catch (err) {
      console.error("Failed to fetch banners", err);
    }
  }, [fetchBanners]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankBanner());
    setModalOpen(true);
  };

  const openEdit = (banner) => {
    setEditing(banner._id);
    setForm({
      title: banner.title,
      subtitle: banner.description ?? "",
      imageUrl: banner.image ?? "",
      linkType: banner.linkType ?? "url",
      linkValue: banner.linkValue ?? "",
      position: banner.position ?? "home_top",
      isActive: banner.isActive,
      order: banner.sortOrder ?? 1,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      description: form.subtitle,
      image: form.imageUrl,
      linkType: form.linkType,
      linkValue: form.linkValue,
      position: form.position,
      isActive: form.isActive,
      sortOrder: form.order,
    };
    try {
      if (editing) {
        await updateBanner(editing, payload);
      } else {
        await createBanner(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save banner", err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBanner(deleteTarget);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete banner", err);
    }
  };

  const toggleActive = async (banner) => {
    try {
      await updateBanner(banner._id, { isActive: !banner.isActive });
    } catch (err) {
      console.error("Failed to toggle banner", err);
    }
  };

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-text-primary">Banners</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {banners.length} banners · drag handle to reorder
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Add Banner
        </button>
      </div>

      {/* Drag hint */}
      <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-[var(--radius-md)] bg-blue-50 border border-blue-100">
        <GripVertical size={14} className="text-blue-500" />
        <p className="text-xs text-blue-600">
          Use the drag handles on each card to reorder banners. Changes save automatically.
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-text-secondary text-sm gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-border-light border-t-primary animate-spin" />
          Loading banners…
        </div>
      ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {banners.map((banner, idx) => (
          <div
            key={banner._id}
            className={`bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden transition-opacity ${banner.isActive ? "opacity-100" : "opacity-60"}`}
          >
            {/* Colored placeholder image */}
            <div
              className={`h-28 bg-gradient-to-r ${BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length]} flex items-center justify-center relative`}
            >
              <Image size={28} className="text-white/60" />
              <span className="absolute top-2 left-2 bg-black/30 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                #{banner.sortOrder ?? idx + 1}
              </span>
              <button
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white p-1 rounded cursor-grab active:cursor-grabbing transition-colors"
                title="Drag to reorder"
              >
                <GripVertical size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{banner.title}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{banner.description}</p>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${POSITION_COLORS[banner.position]}`}
                >
                  {POSITION_LABELS[banner.position]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-3">
                {banner.linkType === "url" ? (
                  <Globe size={12} className="text-text-tertiary" />
                ) : banner.linkType === "restaurant" ? (
                  <UtensilsCrossed size={12} className="text-text-tertiary" />
                ) : (
                  <Link2 size={12} className="text-text-tertiary" />
                )}
                <span className="text-[11px] text-text-tertiary truncate max-w-[160px]">
                  {banner.linkType}: {banner.linkValue}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* Active toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={banner.isActive}
                  onClick={() => toggleActive(banner)}
                  className={`relative inline-flex shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${banner.isActive ? "bg-primary" : "bg-border-default"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${banner.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
                <span className="text-[11px] text-text-secondary">
                  {banner.isActive ? "Active" : "Inactive"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(banner)}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner._id)}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Banner" : "Create Banner"}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isSaving ? "Saving…" : editing ? "Save Changes" : "Create Banner"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Title" value={form.title} onChange={(v) => setField("title", v)} placeholder="e.g. Weekend Feast Offers" />
          <FormInput label="Subtitle" value={form.subtitle} onChange={(v) => setField("subtitle", v)} placeholder="Short supporting text" />
          <BannerImageUpload imageUrl={form.imageUrl} onUrlChange={(v) => setField("imageUrl", v)} />

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Link Type"
              value={form.linkType}
              onChange={(v) => setField("linkType", v)}
              options={[
                { value: "url", label: "URL" },
                { value: "restaurant", label: "Restaurant" },
                { value: "category", label: "Category" },
              ]}
            />
            <FormInput label="Link Value" value={form.linkValue} onChange={(v) => setField("linkValue", v)} placeholder="Slug or URL path" />
          </div>

          <FormSelect
            label="Position"
            value={form.position}
            onChange={(v) => setField("position", v)}
            options={[
              { value: "home_top", label: "Home Top" },
              { value: "home_mid", label: "Home Mid" },
              { value: "category", label: "Category" },
            ]}
          />

          <FormInput label="Display Order" type="number" value={form.order} onChange={(v) => setField("order", Number(v))} />

          <FormToggle label="Active" checked={form.isActive} onChange={(v) => setField("isActive", v)} />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Banner"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-semibold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-[var(--radius-md)] hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">
            {banners.find((b) => b._id === deleteTarget)?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}

// ─── Tab: Announcements ───────────────────────────────────────────────────────

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(blankAnnouncement());

  const openCreate = () => {
    setEditing(null);
    setForm(blankAnnouncement());
    setModalOpen(true);
  };

  const openEdit = (ann) => {
    setEditing(ann.id);
    setForm({ ...ann });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editing) {
      setAnnouncements((prev) => prev.map((a) => (a.id === editing ? { ...form, id: editing } : a)));
    } else {
      const newId = Math.max(0, ...announcements.map((a) => a.id)) + 1;
      setAnnouncements((prev) => [...prev, { ...form, id: newId }]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const toggleActive = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-text-primary">Announcements</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {announcements.length} announcements across audiences
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Announcement
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann) => {
          const meta = TYPE_META[ann.type];
          const Icon = meta.icon;
          return (
            <div
              key={ann.id}
              className={`bg-white rounded-[var(--radius-xl)] border border-border-light p-4 transition-opacity ${ann.isActive ? "opacity-100" : "opacity-60"}`}
            >
              <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${meta.bg}`}>
                  <Icon size={17} className={meta.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-text-primary truncate">{ann.title}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${AUDIENCE_COLORS[ann.targetAudience]}`}>
                      {AUDIENCE_LABELS[ann.targetAudience]}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">{ann.message}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-tertiary">
                    <span>Scheduled: {formatDateTime(ann.scheduledAt)}</span>
                    <span>Expires: {formatDateTime(ann.expiresAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ann.isActive}
                    onClick={() => toggleActive(ann.id)}
                    title={ann.isActive ? "Deactivate" : "Activate"}
                    className={`relative inline-flex shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${ann.isActive ? "bg-primary" : "bg-border-default"}`}
                  >
                    <span
                      className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${ann.isActive ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(ann.id)}
                    className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Announcement" : "New Announcement"}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors"
            >
              {editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Title" value={form.title} onChange={(v) => setField("title", v)} placeholder="Announcement title" />

          <div>
            <SectionLabel>Message</SectionLabel>
            <textarea
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              rows={3}
              placeholder="Full announcement text..."
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              value={form.type}
              onChange={(v) => setField("type", v)}
              options={[
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "promo", label: "Promo" },
              ]}
            />
            <FormSelect
              label="Target Audience"
              value={form.targetAudience}
              onChange={(v) => setField("targetAudience", v)}
              options={[
                { value: "all", label: "All Users" },
                { value: "customers", label: "Customers" },
                { value: "restaurants", label: "Restaurants" },
                { value: "partners", label: "Partners" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Scheduled At" type="datetime-local" value={form.scheduledAt} onChange={(v) => setField("scheduledAt", v)} />
            <FormInput label="Expires At" type="datetime-local" value={form.expiresAt} onChange={(v) => setField("expiresAt", v)} />
          </div>

          <FormToggle label="Active" checked={form.isActive} onChange={(v) => setField("isActive", v)} />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Announcement"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-semibold text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold bg-red-500 text-white rounded-[var(--radius-md)] hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text-primary">
            {announcements.find((a) => a.id === deleteTarget)?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}

// ─── Tab: App Config ──────────────────────────────────────────────────────────

function useSectionSave() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const triggerSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  }, []);

  return { saving, saved, triggerSave };
}

function ConfigSection({ title, description, icon: Icon, children, onSave, saving, saved }) {
  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{title}</h3>
            <p className="text-xs text-text-secondary mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-[var(--radius-lg)] shrink-0 transition-all ${
            saved
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-primary text-white hover:bg-primary/90"
          } disabled:opacity-70`}
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <Check size={15} />
          ) : null}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
      {children}
    </div>
  );
}

function AppConfigTab() {
  const [config, setConfig] = useState(INITIAL_CONFIG);

  const generalSave = useSectionSave();
  const deliverySave = useSectionSave();
  const commissionSave = useSectionSave();
  const featureSave = useSectionSave();

  const setNested = (section, key, val) =>
    setConfig((prev) => ({ ...prev, [section]: { ...prev[section], [key]: val } }));

  const { Settings, DollarSign, Truck, Zap } = {
    Settings: Settings2,
    DollarSign: CheckCircle2,
    Truck: Settings2,
    Zap: Settings2,
  };

  return (
    <div className="space-y-5">
      {/* General */}
      <ConfigSection
        title="General"
        description="App identity and support contact details"
        icon={Settings2}
        onSave={generalSave.triggerSave}
        saving={generalSave.saving}
        saved={generalSave.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="App Name" value={config.general.appName} onChange={(v) => setNested("general", "appName", v)} />
          <FormInput label="Tagline" value={config.general.tagline} onChange={(v) => setNested("general", "tagline", v)} />
          <FormInput label="Support Email" type="email" value={config.general.supportEmail} onChange={(v) => setNested("general", "supportEmail", v)} />
          <FormInput label="Support Phone" value={config.general.supportPhone} onChange={(v) => setNested("general", "supportPhone", v)} />
        </div>
      </ConfigSection>

      {/* Delivery */}
      <ConfigSection
        title="Delivery"
        description="Order minimums, delivery radius, and surge pricing"
        icon={Settings2}
        onSave={deliverySave.triggerSave}
        saving={deliverySave.saving}
        saved={deliverySave.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionLabel>Min Order Amount (₹)</SectionLabel>
            <input
              type="number"
              value={config.delivery.minOrderAmount}
              onChange={(e) => setNested("delivery", "minOrderAmount", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <SectionLabel>Default Delivery Radius (km)</SectionLabel>
            <input
              type="number"
              value={config.delivery.defaultDeliveryRadiusKm}
              onChange={(e) => setNested("delivery", "defaultDeliveryRadiusKm", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <SectionLabel>Max Delivery Radius (km)</SectionLabel>
            <input
              type="number"
              value={config.delivery.maxDeliveryRadiusKm}
              onChange={(e) => setNested("delivery", "maxDeliveryRadiusKm", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <SectionLabel>Surge Multiplier (×)</SectionLabel>
            <input
              type="number"
              step="0.1"
              value={config.delivery.surgeMultiplier}
              onChange={(e) => setNested("delivery", "surgeMultiplier", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </ConfigSection>

      {/* Commission */}
      <ConfigSection
        title="Commission"
        description="Platform revenue share and gateway fees"
        icon={CheckCircle2}
        onSave={commissionSave.triggerSave}
        saving={commissionSave.saving}
        saved={commissionSave.saved}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionLabel>Default Platform Commission (%)</SectionLabel>
            <input
              type="number"
              step="0.5"
              value={config.commission.defaultPlatformCommissionPct}
              onChange={(e) => setNested("commission", "defaultPlatformCommissionPct", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <SectionLabel>Payment Gateway Fee (%)</SectionLabel>
            <input
              type="number"
              step="0.1"
              value={config.commission.paymentGatewayFeePct}
              onChange={(e) => setNested("commission", "paymentGatewayFeePct", Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border border-border-light bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </ConfigSection>

      {/* Feature Flags */}
      <ConfigSection
        title="Feature Flags"
        description="Toggle platform features on or off in real time"
        icon={Settings2}
        onSave={featureSave.triggerSave}
        saving={featureSave.saving}
        saved={featureSave.saved}
      >
        <div className="space-y-1 divide-y divide-border-light">
          {[
            {
              key: "maintenanceMode",
              label: "Maintenance Mode",
              sub: "Takes the platform offline for all users",
              danger: true,
            },
            {
              key: "newUserRegistration",
              label: "New User Registration",
              sub: "Allow new customers to sign up",
            },
            {
              key: "restaurantSelfOnboarding",
              label: "Restaurant Self-Onboarding",
              sub: "Let restaurants apply and list without manual admin intervention",
            },
            {
              key: "referralProgram",
              label: "Referral Program",
              sub: "Enable earn-and-redeem referral credits",
            },
            {
              key: "darkMode",
              label: "Dark Mode",
              sub: "Expose dark mode toggle to end users in the app",
            },
          ].map(({ key, label, sub, danger }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className={`text-sm font-semibold ${danger && config.featureFlags[key] ? "text-red-600" : "text-text-primary"}`}>
                  {label}
                  {danger && config.featureFlags[key] && (
                    <span className="ml-2 text-[11px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.featureFlags[key]}
                onClick={() => setNested("featureFlags", key, !config.featureFlags[key])}
                className={`relative inline-flex shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  config.featureFlags[key]
                    ? danger
                      ? "bg-red-500"
                      : "bg-primary"
                    : "bg-border-default"
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${config.featureFlags[key] ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "banners", label: "Banners", icon: Image },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "config", label: "App Config", icon: Settings2 },
];

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary">Content Management</h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage banners, announcements, and global app configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-border-light rounded-[var(--radius-xl)] p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "banners" && <BannersTab />}
        {activeTab === "announcements" && <AnnouncementsTab />}
        {activeTab === "config" && <AppConfigTab />}
      </div>
    </div>
  );
}
