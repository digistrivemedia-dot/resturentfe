"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Heart, Bell, HelpCircle, LogOut, ChevronRight,
  Pencil, CheckCircle2, Loader2, Wallet, ShoppingBag,
  Star, Shield, Phone, Mail, Camera, X,
} from "lucide-react";
import { Modal } from "@/components/ui";
import useAuthStore from "@/stores/authStore";
import useProfileStore from "@/stores/profileStore";
import useImageUpload from "@/hooks/useImageUpload";
import toast from "react-hot-toast";

const MENU_ITEMS = [
  {
    group: "Account",
    items: [
      { href: "/profile/addresses", label: "Manage Addresses", icon: MapPin, desc: "Add or edit delivery addresses" },
      { href: "/favorites",         label: "Favourites",        icon: Heart,  desc: "Your saved restaurants" },
      { href: "/orders",            label: "Your Orders",       icon: ShoppingBag, desc: "Track and reorder" },
    ],
  },
  {
    group: "Preferences",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell,       desc: "Manage alerts & updates" },
      { href: "/support",       label: "Help & Support", icon: HelpCircle, desc: "FAQs and contact us" },
    ],
  },
  {
    group: "More",
    items: [
      { href: "#", label: "Rate the App", icon: Star,   desc: "Love DigiStrive? Tell us!" },
      { href: "#", label: "Privacy Policy", icon: Shield, desc: "" },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, fetchMe } = useAuthStore();
  const { updateProfile } = useProfileStore();
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const avatarRef = useRef(null);
  const { upload: uploadAvatar, isUploading: isUploadingAvatar, progress: avatarProgress } = useImageUpload({ type: "avatar" });

  const initials = (user?.name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadAvatar(file);
    if (result) {
      try {
        await updateProfile({ avatar: result.url });
        await fetchMe();
        toast.success("Profile photo updated");
      } catch {
        toast.error("Failed to save photo");
      }
    } else {
      toast.error("Upload failed");
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      await fetchMe();
      setSaved(true);
      setTimeout(() => { setSaved(false); setEditOpen(false); }, 800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-text-primary">Profile</h1>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>

        {/* Avatar + info card */}
        <div className="bg-white rounded-[var(--radius-xl)] border border-border-light px-5 py-5 mb-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover shadow-[var(--shadow-md)]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-2xl font-extrabold shadow-[var(--shadow-md)]">
                  {initials}
                </div>
              )}
              <button
                onClick={() => avatarRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-border-light rounded-full flex items-center justify-center shadow-sm hover:bg-bg-hover transition-colors disabled:opacity-60"
              >
                {isUploadingAvatar ? <Loader2 size={12} className="text-primary animate-spin" /> : <Camera size={12} className="text-text-secondary" />}
              </button>
              <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold text-text-primary">{user.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Phone size={12} className="text-text-tertiary" />
                <span className="text-sm text-text-secondary">{user.phone}</span>
                {user.isPhoneVerified && <CheckCircle2 size={12} className="text-success" />}
              </div>
              {user.email && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={12} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary truncate">{user.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border-light">
            {[
              { label: "Orders", value: "12" },
              { label: "Favourites", value: user.favorites?.length || 0 },
              { label: "Wallet", value: `₹${user.wallet?.balance || 0}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-extrabold text-text-primary">{value}</p>
                <p className="text-xs text-text-tertiary">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet quick access */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-[var(--radius-xl)] px-5 py-4 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-[var(--radius-lg)] flex items-center justify-center">
            <Wallet size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/70 font-medium">DigiStrive Wallet</p>
            <p className="text-2xl font-extrabold text-white">₹{user.wallet?.balance || 0}</p>
          </div>
          <button className="h-9 px-4 bg-white text-primary text-sm font-bold rounded-[var(--radius-full)] hover:bg-primary-50 transition-colors">
            Add Money
          </button>
        </div>

        {/* Menu groups */}
        <div className="space-y-4 mb-6">
          {MENU_ITEMS.map(({ group, items }) => (
            <div key={group} className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
              <p className="px-4 pt-3 pb-2 text-xs font-bold text-text-tertiary uppercase tracking-wider">{group}</p>
              <div className="divide-y divide-border-light">
                {items.map(({ href, label, icon: Icon, desc }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-hover transition-colors"
                  >
                    <div className="w-9 h-9 bg-bg-secondary rounded-[var(--radius-lg)] flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{label}</p>
                      {desc && <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>}
                    </div>
                    <ChevronRight size={16} className="text-text-tertiary shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="w-full flex items-center justify-center gap-2 h-12 border-2 border-error/30 text-error font-bold text-sm rounded-[var(--radius-xl)] hover:bg-error-light transition-colors"
        >
          <LogOut size={16} /> Log Out
        </button>

        <p className="text-center text-xs text-text-tertiary mt-4 mb-2">DigiStrive v1.0.0</p>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          {/* Avatar picker */}
          <div className="flex justify-center">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-extrabold">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {isUploadingAvatar ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              type="email"
              className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Phone</label>
            <div className="relative">
              <input
                value={user.phone}
                disabled
                className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-secondary text-text-tertiary cursor-not-allowed"
              />
              <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-success" />
            </div>
            <p className="text-xs text-text-tertiary mt-1">Phone number cannot be changed</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> :
             saved ? <><CheckCircle2 size={18} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </Modal>

      {/* Logout confirm */}
      <Modal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out?"
        size="sm"
        footer={
          <>
            <button onClick={() => setLogoutOpen(false)} className="h-10 px-5 text-sm font-semibold text-text-secondary border border-border-default rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors">
              Cancel
            </button>
            <button onClick={handleLogout} className="h-10 px-5 text-sm font-semibold text-white bg-error rounded-[var(--radius-lg)] hover:bg-error-dark transition-colors">
              Log Out
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">You'll need to log in again to place orders.</p>
      </Modal>
    </>
  );
}
