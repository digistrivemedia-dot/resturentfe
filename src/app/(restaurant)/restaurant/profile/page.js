"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star, MapPin, Clock, Phone, Mail, Globe,
  Camera, Edit2, Check, X, Shield, Leaf,
  ChevronDown, ChevronUp, Save, ImageIcon, UtensilsCrossed,
  BadgeCheck, Bike, Timer, Link,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import useRestaurantProfileStore from "@/stores/restaurantProfileStore";
import useImageUpload from "@/hooks/useImageUpload";

const FEATURED_ITEMS = [
  { name: "Butter Chicken", price: 280, veg: false, gradient: "from-orange-400 to-red-500" },
  { name: "Dal Makhani", price: 220, veg: true, gradient: "from-amber-400 to-orange-500" },
  { name: "Chicken Biryani", price: 320, veg: false, gradient: "from-yellow-400 to-amber-500" },
];

const PHOTO_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
];

// ── Small helpers ─────────────────────────────────────────────────────────────
function CuisineTag({ label }) {
  return (
    <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
      {label}
    </span>
  );
}

function InfoToast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-[var(--radius-lg)] shadow-xl flex items-center gap-2 animate-slide-up">
      <Check size={16} className="text-green-400" />
      {message}
      <button onClick={onClose} className="ml-2 hover:text-gray-300">
        <X size={14} />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function RestaurantProfilePage() {
  const { restaurant, isLoading, isSaving, fetchProfile, updateProfile } = useRestaurantProfileStore();

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState({ phone: "", email: "", website: "" });
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialDraft, setSocialDraft] = useState({ instagram: "", facebook: "" });
  const [isOpenLocal, setIsOpenLocal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const photoInputRef = useRef(null);

  const { upload: uploadPhoto, isUploading: isPhotoUploading, progress: photoProgress, error: photoUploadError } = useImageUpload({
    type: "restaurant",
    onSuccess: async (result) => {
      try {
        await updateProfile({ logo: result.url });
        showToast("Photo uploaded successfully!");
      } catch (err) {
        showToast("Photo uploaded but failed to save to profile");
      }
    },
    onError: (msg) => {
      showToast(`Photo upload failed: ${msg}`);
    },
  });

  async function handlePhotoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = "";
    try {
      await uploadPhoto(file);
    } catch {
      // error handled by onError callback
    }
  }

  useEffect(() => {
    try {
      fetchProfile();
    } catch (err) {
      // error stored in store
    }
  }, []);

  // Sync local draft states when restaurant data loads
  useEffect(() => {
    if (restaurant) {
      setDescDraft(restaurant.description || "");
      setContactDraft({
        phone: restaurant.contact?.phone || "",
        email: restaurant.contact?.email || "",
        website: restaurant.contact?.website || restaurant.website || "",
      });
      setSocialDraft({
        instagram: restaurant.social?.instagram || restaurant.instagram || "",
        facebook: restaurant.social?.facebook || restaurant.facebook || "",
      });
      setIsOpenLocal(restaurant.status === "open");
    }
  }, [restaurant]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        description: descDraft,
        contact: contactDraft,
        social: socialDraft,
        status: isOpenLocal ? "open" : "closed",
      });
      showToast("Profile changes saved successfully!");
    } catch (err) {
      showToast("Failed to save changes");
    }
    setSaving(false);
  };

  const saveDesc = async () => {
    try {
      await updateProfile({ description: descDraft });
      showToast("Description saved");
    } catch (err) {
      showToast("Failed to save description");
    }
    setEditingDesc(false);
  };

  const saveContact = async () => {
    try {
      await updateProfile({ contact: contactDraft });
      showToast("Contact info saved");
    } catch (err) {
      showToast("Failed to save contact");
    }
    setEditingContact(false);
  };

  const saveSocial = async () => {
    try {
      await updateProfile({ social: socialDraft });
      showToast("Social links saved");
    } catch (err) {
      showToast("Failed to save social links");
    }
    setEditingSocial(false);
  };

  // Loading skeleton
  if (isLoading && !restaurant) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#FF5722]" />
      </div>
    );
  }

  // Use restaurant data with fallbacks
  const info = {
    name: restaurant?.name || "My Restaurant",
    initials: restaurant?.name ? restaurant.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "R",
    cuisines: restaurant?.cuisines || [],
    rating: restaurant?.rating || 0,
    reviewCount: restaurant?.reviewCount || 0,
    fssai: restaurant?.fssai || "",
    isPureVeg: restaurant?.isPureVeg || false,
    isOpen: isOpenLocal !== null ? isOpenLocal : restaurant?.status === "open",
    openTime: restaurant?.timing?.open || "10:00 AM",
    closeTime: restaurant?.timing?.close || "11:00 PM",
    description: restaurant?.description || "",
    phone: restaurant?.contact?.phone || "",
    email: restaurant?.contact?.email || "",
    website: restaurant?.contact?.website || restaurant?.website || "",
    instagram: restaurant?.social?.instagram || restaurant?.instagram || "",
    facebook: restaurant?.social?.facebook || restaurant?.facebook || "",
    deliveryTime: restaurant?.deliveryTime || "30-40",
    deliveryFee: restaurant?.deliveryFee || 0,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Restaurant Profile</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage how your restaurant appears to customers
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || isSaving}
          className="flex items-center gap-2 h-10 px-5 bg-[#FF5722] text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-[#e64a19] transition-colors disabled:opacity-60"
        >
          {saving || isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── LEFT COLUMN (col-span-3) ── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Identity card */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
            <div className="flex items-start gap-5">
              {/* Logo / initials */}
              <div
                className="w-20 h-20 rounded-[var(--radius-xl)] flex items-center justify-center text-white text-2xl font-extrabold shrink-0"
                style={{ background: "linear-gradient(135deg, #FF5722, #e64a19)" }}
              >
                {info.initials}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-extrabold text-text-primary">{info.name}</h2>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {info.cuisines.map((c) => (
                    <CuisineTag key={c} label={c} />
                  ))}
                </div>

                {/* Rating + badges */}
                <div className="flex items-center flex-wrap gap-3 mt-3">
                  {info.rating > 0 && (
                    <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      <Star size={11} fill="white" /> {info.rating}
                    </div>
                  )}
                  {info.reviewCount > 0 && (
                    <span className="text-xs text-text-secondary">{info.reviewCount.toLocaleString()} ratings</span>
                  )}

                  {/* FSSAI badge */}
                  {info.fssai && (
                    <div className="flex items-center gap-1 border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                      <Shield size={11} /> FSSAI {info.fssai}
                    </div>
                  )}

                  {/* Pure Veg badge */}
                  {info.isPureVeg && (
                    <div className="flex items-center gap-1 border border-green-200 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                      <Leaf size={11} /> Pure Veg
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Open/Closed toggle */}
            <div className="mt-5 pt-5 border-t border-border-light flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">Restaurant Status</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  <Clock size={11} className="inline mr-1" />
                  {info.openTime} – {info.closeTime}
                </p>
              </div>
              <button
                onClick={() => setIsOpenLocal((prev) => !prev)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                  info.isOpen ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                    info.isOpen ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <p className={`text-xs font-semibold mt-1 ${info.isOpen ? "text-green-600" : "text-red-500"}`}>
              {info.isOpen ? "Currently Open for Orders" : "Currently Closed"}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary">About / Description</h3>
              <button
                onClick={() => {
                  setDescDraft(info.description);
                  setEditingDesc(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>
            {editingDesc ? (
              <div className="space-y-3">
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={4}
                  className="w-full text-sm text-text-primary bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 py-2 resize-none focus:outline-none focus:border-[#FF5722]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDesc}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 h-8 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] hover:bg-[#e64a19] transition-colors disabled:opacity-60"
                  >
                    <Check size={13} /> Save
                  </button>
                  <button
                    onClick={() => setEditingDesc(false)}
                    className="flex items-center gap-1.5 h-8 px-4 border border-border-light text-xs font-semibold text-text-secondary rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors"
                  >
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary leading-relaxed">{info.description || "No description set."}</p>
            )}
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Contact Information</h3>
              <button
                onClick={() => {
                  setContactDraft({ phone: info.phone, email: info.email, website: info.website });
                  setEditingContact(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>
            {editingContact ? (
              <div className="space-y-3">
                {[
                  { key: "phone", label: "Phone", icon: Phone },
                  { key: "email", label: "Email", icon: Mail },
                  { key: "website", label: "Website", icon: Globe },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-text-secondary mb-1 block">{label}</label>
                    <div className="flex items-center gap-2 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 py-2">
                      <Icon size={14} className="text-text-tertiary shrink-0" />
                      <input
                        type="text"
                        value={contactDraft[key]}
                        onChange={(e) => setContactDraft((p) => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 text-sm text-text-primary bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={saveContact} disabled={isSaving} className="flex items-center gap-1.5 h-8 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] hover:bg-[#e64a19] transition-colors disabled:opacity-60">
                    <Check size={13} /> Save
                  </button>
                  <button onClick={() => setEditingContact(false)} className="flex items-center gap-1.5 h-8 px-4 border border-border-light text-xs font-semibold text-text-secondary rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { icon: Phone, value: info.phone },
                  { icon: Mail, value: info.email },
                  { icon: Globe, value: info.website },
                ].filter(({ value }) => value).map(({ icon: Icon, value }) => (
                  <div key={value} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-bg-secondary flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-text-tertiary" />
                    </div>
                    <span className="text-sm text-text-primary">{value}</span>
                  </div>
                ))}
                {!info.phone && !info.email && !info.website && (
                  <p className="text-sm text-text-secondary">No contact info set.</p>
                )}
              </div>
            )}
          </div>

          {/* Social links */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Social Media</h3>
              <button
                onClick={() => {
                  setSocialDraft({ instagram: info.instagram, facebook: info.facebook });
                  setEditingSocial(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>
            {editingSocial ? (
              <div className="space-y-3">
                {[
                  { key: "instagram", label: "Instagram", icon: Link, color: "text-pink-500" },
                  { key: "facebook", label: "Facebook", icon: Link, color: "text-blue-600" },
                ].map(({ key, label, icon: Icon, color }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-text-secondary mb-1 block">{label}</label>
                    <div className={`flex items-center gap-2 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] px-3 py-2`}>
                      <Icon size={14} className={`${color} shrink-0`} />
                      <input
                        type="text"
                        value={socialDraft[key]}
                        onChange={(e) => setSocialDraft((p) => ({ ...p, [key]: e.target.value }))}
                        className="flex-1 text-sm text-text-primary bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button onClick={saveSocial} disabled={isSaving} className="flex items-center gap-1.5 h-8 px-4 bg-[#FF5722] text-white text-xs font-bold rounded-[var(--radius-md)] hover:bg-[#e64a19] transition-colors disabled:opacity-60">
                    <Check size={13} /> Save
                  </button>
                  <button onClick={() => setEditingSocial(false)} className="flex items-center gap-1.5 h-8 px-4 border border-border-light text-xs font-semibold text-text-secondary rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors">
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {info.instagram && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-pink-50 flex items-center justify-center shrink-0">
                      <Link size={14} className="text-pink-500" />
                    </div>
                    <span className="text-sm text-text-primary">{info.instagram}</span>
                  </div>
                )}
                {info.facebook && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 flex items-center justify-center shrink-0">
                      <Link size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-text-primary">{info.facebook}</span>
                  </div>
                )}
                {!info.instagram && !info.facebook && (
                  <p className="text-sm text-text-secondary">No social links set.</p>
                )}
              </div>
            )}
          </div>

          {/* Photos section */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Restaurant Photos</h3>
                <p className="text-xs text-text-tertiary mt-0.5">Showcased on your public listing</p>
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={isPhotoUploading}
                className="flex items-center gap-1.5 h-8 px-3 border border-dashed border-[#FF5722] text-[#FF5722] text-xs font-bold rounded-[var(--radius-md)] hover:bg-[#FF5722]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPhotoUploading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#FF5722]/40 border-t-[#FF5722] rounded-full animate-spin shrink-0" />
                    {photoProgress > 0 ? `${photoProgress}%` : "Uploading…"}
                  </>
                ) : (
                  <>
                    <Camera size={13} /> Add Photo
                  </>
                )}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileChange}
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PHOTO_GRADIENTS.map((grad, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-[var(--radius-lg)] bg-gradient-to-br ${grad} flex items-center justify-center group relative overflow-hidden cursor-pointer`}
                >
                  <ImageIcon size={20} className="text-white/70 group-hover:text-white transition-colors" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">Photo {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (col-span-2) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Preview Card */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Customer Preview</p>
            </div>

            {/* Cover image placeholder */}
            <div className="mx-4 h-32 rounded-[var(--radius-lg)] bg-gradient-to-br from-orange-400 via-[#FF5722] to-red-600 flex items-center justify-center relative overflow-hidden">
              <UtensilsCrossed size={32} className="text-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-2 left-3">
                <p className="text-white text-xs font-semibold opacity-80">Cover Photo</p>
              </div>
            </div>

            <div className="px-4 pt-3 pb-4">
              {/* Name + badges */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold text-text-primary">{info.name}</h3>
                    {info.isPureVeg && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Pure Veg</span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{info.cuisines.join(" · ")}</p>
                </div>
                {info.rating > 0 && (
                  <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
                    <Star size={10} fill="white" /> {info.rating}
                  </div>
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2.5 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Timer size={12} /> {info.deliveryTime} mins
                </span>
                <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                <span className="flex items-center gap-1">
                  <Bike size={12} /> ₹{info.deliveryFee} delivery
                </span>
                <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                <span className={`font-semibold ${info.isOpen ? "text-green-600" : "text-red-500"}`}>
                  {info.isOpen ? "Open" : "Closed"}
                </span>
              </div>

              {/* Featured items */}
              <div className="mt-4">
                <p className="text-xs font-bold text-text-secondary mb-2">Featured Items</p>
                <div className="space-y-2">
                  {FEATURED_ITEMS.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-[var(--radius-md)] bg-gradient-to-br ${item.gradient} shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-sm border-2 ${item.veg ? "border-green-600" : "border-red-600"} flex items-center justify-center`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-green-600" : "bg-red-600"}`} />
                          </span>
                          <p className="text-xs font-semibold text-text-primary truncate">{item.name}</p>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">₹{item.price}</p>
                      </div>
                      <button className="text-[10px] font-bold text-[#FF5722] border border-[#FF5722] px-2 py-0.5 rounded-md hover:bg-[#FF5722]/5 transition-colors">
                        ADD
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile completeness */}
          <div className="bg-white rounded-[var(--radius-xl)] border border-border-light p-5">
            <h3 className="text-sm font-bold text-text-primary mb-3">Profile Completeness</h3>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-[#FF5722] h-2 rounded-full" style={{ width: "78%" }} />
            </div>
            <p className="text-xs text-text-secondary">78% complete — Add cover photo to reach 90%</p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Restaurant info", done: !!restaurant?.name },
                { label: "Contact details", done: !!(restaurant?.contact?.phone || restaurant?.contact?.email) },
                { label: "Description", done: !!restaurant?.description },
                { label: "Cover photo", done: false },
                { label: "Social links", done: !!(restaurant?.social?.instagram || restaurant?.social?.facebook) },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : "bg-gray-200"}`}>
                    {done && <Check size={10} className="text-white" />}
                  </div>
                  <span className={`text-xs ${done ? "text-text-primary" : "text-text-tertiary line-through"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FSSAI + Verification */}
          {info.fssai && (
            <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-xl)] p-4">
              <div className="flex items-start gap-3">
                <BadgeCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-800">FSSAI Verified</p>
                  <p className="text-xs text-blue-600 mt-0.5">License No: {info.fssai}</p>
                  <p className="text-xs text-blue-500 mt-1">Valid until Dec 2026</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Toast */}
      {toast && <InfoToast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
