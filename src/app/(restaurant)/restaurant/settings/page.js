"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  MapPin,
  Truck,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Building2,
  Clock,
  Phone,
  Mail,
  User,
  Lock,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  X,
  IndianRupee,
} from "lucide-react";
import { Toggle } from "@/components/ui";
import useRestaurantProfileStore from "@/stores/restaurantProfileStore";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 bg-white border border-border-light shadow-[var(--shadow-modal)] rounded-[var(--radius-lg)] px-4 py-3 min-w-[260px] max-w-sm animate-slide-up"
        >
          <CheckCircle2 size={18} className="text-success shrink-0" />
          <p className="text-sm font-semibold text-text-primary flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-text-tertiary hover:text-text-primary transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

// ── Shared field components ───────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, readOnly, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full h-10 px-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${readOnly ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    />
  );
}

function SelectInput({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full h-10 px-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SaveButton({ loading, onClick, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="h-10 px-6 bg-[#FF5722] hover:bg-[#e64a19] text-white text-sm font-bold rounded-[var(--radius-lg)] flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Saving…
        </>
      ) : (
        <>
          <Save size={15} />
          {label}
        </>
      )}
    </button>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-bg-primary border border-border-light rounded-[var(--radius-xl)] overflow-hidden">
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-border-light">
          {title && <h3 className="text-sm font-bold text-text-primary">{title}</h3>}
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-overlay)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-bg-primary rounded-[var(--radius-xl)] w-full max-w-md shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-hover transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "general",      label: "General",           icon: Settings },
  { id: "location",     label: "Location & Hours",  icon: MapPin },
  { id: "delivery",     label: "Delivery Settings", icon: Truck },
  { id: "notifications",label: "Notifications",     icon: Bell },
  { id: "account",      label: "Account & Security",icon: Shield },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_HOURS = {
  Monday:    { open: true,  openTime: "10:00", closeTime: "23:00" },
  Tuesday:   { open: true,  openTime: "10:00", closeTime: "23:00" },
  Wednesday: { open: true,  openTime: "10:00", closeTime: "23:00" },
  Thursday:  { open: true,  openTime: "10:00", closeTime: "23:00" },
  Friday:    { open: true,  openTime: "10:00", closeTime: "23:30" },
  Saturday:  { open: true,  openTime: "09:30", closeTime: "23:30" },
  Sunday:    { open: true,  openTime: "09:30", closeTime: "22:30" },
};

// ── TAB: General ─────────────────────────────────────────────────────────────
function GeneralTab({ showToast }) {
  const { restaurant, updateProfile, isSaving } = useRestaurantProfileStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    cuisines: "",
    fssai: "",
    gst: "",
    year: "",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (restaurant && !hydrated) {
      setForm({
        name: restaurant.name || "",
        tagline: restaurant.tagline || "",
        description: restaurant.description || "",
        cuisines: Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : (restaurant.cuisines || ""),
        fssai: restaurant.fssai || "",
        gst: restaurant.gst || "",
        year: restaurant.yearEstablished ? String(restaurant.yearEstablished) : "",
      });
      setHydrated(true);
    }
  }, [restaurant]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        cuisines: form.cuisines.split(",").map((c) => c.trim()).filter(Boolean),
        fssai: form.fssai,
        gst: form.gst,
        yearEstablished: form.year ? Number(form.year) : undefined,
      });
      showToast("Restaurant details saved successfully");
    } catch (err) {
      showToast("Failed to save details");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <SectionCard title="Restaurant Identity">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Restaurant Name</FieldLabel>
            <TextInput value={form.name} onChange={set("name")} placeholder="e.g. Spice Garden" />
          </div>
          <div>
            <FieldLabel>Tagline</FieldLabel>
            <TextInput value={form.tagline} onChange={set("tagline")} placeholder="Short catchy description" />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Tell customers about your restaurant…"
              className="w-full px-3 py-2.5 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
            />
          </div>
          <div>
            <FieldLabel>Cuisines</FieldLabel>
            <TextInput value={form.cuisines} onChange={set("cuisines")} placeholder="e.g. North Indian, Chinese (comma-separated)" />
            <p className="text-[11px] text-text-tertiary mt-1">Separate multiple cuisines with commas</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Legal & Compliance">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>FSSAI License Number</FieldLabel>
            <TextInput value={form.fssai} onChange={set("fssai")} placeholder="14-digit FSSAI number" />
          </div>
          <div>
            <FieldLabel>GST Number</FieldLabel>
            <TextInput value={form.gst} onChange={set("gst")} placeholder="15-character GST number" />
          </div>
          <div>
            <FieldLabel>Year Established</FieldLabel>
            <TextInput value={form.year} onChange={set("year")} placeholder="e.g. 2015" type="number" />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving || isSaving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── TAB: Location & Hours ────────────────────────────────────────────────────
function LocationTab({ showToast }) {
  const { restaurant, updateProfile, isSaving } = useRestaurantProfileStore();
  const [saving, setSaving] = useState(false);
  const [addr, setAddr] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (restaurant && !hydrated) {
      if (restaurant.address) {
        setAddr({
          street: restaurant.address.street || "",
          city: restaurant.address.city || "",
          state: restaurant.address.state || "",
          pincode: restaurant.address.pincode || "",
          landmark: restaurant.address.landmark || "",
        });
      }
      if (restaurant.operatingHours) {
        setHours((prev) => ({ ...prev, ...restaurant.operatingHours }));
      }
      setHydrated(true);
    }
  }, [restaurant]);

  const setAddr_ = (key) => (e) => setAddr((p) => ({ ...p, [key]: e.target.value }));

  const setDay = (day, field, val) =>
    setHours((p) => ({ ...p, [day]: { ...p[day], [field]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        address: addr,
        operatingHours: hours,
      });
      showToast("Location & hours saved");
    } catch (err) {
      showToast("Failed to save location");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <SectionCard title="Restaurant Address">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Street Address</FieldLabel>
            <TextInput value={addr.street} onChange={setAddr_("street")} placeholder="House/shop no, street name" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>City</FieldLabel>
              <TextInput value={addr.city} onChange={setAddr_("city")} placeholder="City" />
            </div>
            <div>
              <FieldLabel required>State</FieldLabel>
              <TextInput value={addr.state} onChange={setAddr_("state")} placeholder="State" />
            </div>
            <div>
              <FieldLabel required>Pincode</FieldLabel>
              <TextInput value={addr.pincode} onChange={setAddr_("pincode")} placeholder="6-digit pincode" />
            </div>
            <div>
              <FieldLabel>Landmark</FieldLabel>
              <TextInput value={addr.landmark} onChange={setAddr_("landmark")} placeholder="Near / opposite…" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Operating Hours" subtitle="Set open/close times for each day of the week">
        <div className="space-y-3">
          {DAYS.map((day) => {
            const d = hours[day];
            return (
              <div key={day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="w-24 shrink-0">
                  <span className="text-sm font-semibold text-text-primary">{day.slice(0, 3)}</span>
                </div>
                <Toggle
                  checked={d.open}
                  onChange={(v) => setDay(day, "open", v)}
                  size="sm"
                />
                {d.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={d.openTime}
                      onChange={(e) => setDay(day, "openTime", e.target.value)}
                      className="h-9 px-2 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-text-tertiary text-xs">to</span>
                    <input
                      type="time"
                      value={d.closeTime}
                      onChange={(e) => setDay(day, "closeTime", e.target.value)}
                      className="h-9 px-2 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-text-tertiary bg-bg-secondary px-3 py-1.5 rounded-[var(--radius-md)]">
                    Closed
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving || isSaving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── TAB: Delivery Settings ───────────────────────────────────────────────────
function DeliveryTab({ showToast }) {
  const { restaurant, updateSettings, isSaving } = useRestaurantProfileStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    radius: 8,
    minOrder: 150,
    deliveryFee: 30,
    freeDeliveryEnabled: true,
    freeDeliveryAbove: 499,
    prepTime: "25",
    maxConcurrent: "10",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (restaurant && !hydrated) {
      setForm({
        radius: restaurant.deliveryRadius || 8,
        minOrder: restaurant.minOrderAmount || restaurant.minOrder || 150,
        deliveryFee: restaurant.deliveryFee || 30,
        freeDeliveryEnabled: restaurant.freeDelivery?.enabled ?? true,
        freeDeliveryAbove: restaurant.freeDelivery?.above || 499,
        prepTime: String(restaurant.prepTime || "25"),
        maxConcurrent: String(restaurant.maxConcurrentOrders || "10"),
      });
      setHydrated(true);
    }
  }, [restaurant]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        deliveryRadius: form.radius,
        minOrderAmount: Number(form.minOrder),
        deliveryFee: Number(form.deliveryFee),
        freeDelivery: {
          enabled: form.freeDeliveryEnabled,
          above: Number(form.freeDeliveryAbove),
        },
        prepTime: Number(form.prepTime),
        maxConcurrentOrders: form.maxConcurrent === "unlimited" ? null : Number(form.maxConcurrent),
      });
      showToast("Delivery settings saved");
    } catch (err) {
      showToast("Failed to save delivery settings");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <SectionCard title="Delivery Zone">
        <div className="space-y-5">
          <div>
            <FieldLabel>Delivery Radius</FieldLabel>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                value={form.radius}
                onChange={(e) => set("radius", Number(e.target.value))}
                className="flex-1 accent-[#FF5722]"
              />
              <span className="text-sm font-bold text-text-primary w-16 text-right">
                {form.radius} km
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-text-tertiary mt-1">
              <span>1 km</span>
              <span>20 km</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pricing">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Minimum Order Amount</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">₹</span>
              <input
                type="number"
                value={form.minOrder}
                onChange={(e) => set("minOrder", e.target.value)}
                className="w-full h-10 pl-7 pr-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Delivery Fee</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">₹</span>
              <input
                type="number"
                value={form.deliveryFee}
                onChange={(e) => set("deliveryFee", e.target.value)}
                className="w-full h-10 pl-7 pr-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-bg-secondary rounded-[var(--radius-lg)] flex items-start gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3 shrink-0">
            <Toggle
              checked={form.freeDeliveryEnabled}
              onChange={(v) => set("freeDeliveryEnabled", v)}
              size="sm"
            />
            <span className="text-sm font-semibold text-text-primary">Free delivery above</span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-text-tertiary text-sm">₹</span>
            <input
              type="number"
              value={form.freeDeliveryAbove}
              onChange={(e) => set("freeDeliveryAbove", e.target.value)}
              disabled={!form.freeDeliveryEnabled}
              className="w-full h-9 px-3 bg-bg-primary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Order Capacity">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>Estimated Prep Time</FieldLabel>
            <SelectInput
              value={form.prepTime}
              onChange={(e) => set("prepTime", e.target.value)}
              options={[
                { value: "15", label: "15 minutes" },
                { value: "20", label: "20 minutes" },
                { value: "25", label: "25 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "45", label: "45 minutes" },
                { value: "60", label: "60 minutes" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Max Concurrent Orders</FieldLabel>
            <SelectInput
              value={form.maxConcurrent}
              onChange={(e) => set("maxConcurrent", e.target.value)}
              options={[
                { value: "5",  label: "5 orders" },
                { value: "10", label: "10 orders" },
                { value: "15", label: "15 orders" },
                { value: "20", label: "20 orders" },
                { value: "unlimited", label: "Unlimited" },
              ]}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving || isSaving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── TAB: Notifications ───────────────────────────────────────────────────────
function NotificationsTab({ showToast }) {
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({
    newOrderSound: true,
    newOrderEmail: true,
    newOrderWhatsApp: false,
    whatsAppPhone: "",
    dailySummary: true,
    weeklyReport: false,
    lowStock: true,
  });

  const toggle = (key) => setNotifs((p) => ({ ...p, [key]: !p[key] }));
  const set = (key) => (e) => setNotifs((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    showToast("Notification preferences saved");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <SectionCard title="New Order Alerts" subtitle="Choose how you want to be notified when a new order arrives">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Sound Alert</p>
              <p className="text-xs text-text-secondary mt-0.5">Play a chime when a new order arrives</p>
            </div>
            <Toggle checked={notifs.newOrderSound} onChange={() => toggle("newOrderSound")} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Email Notification</p>
              <p className="text-xs text-text-secondary mt-0.5">Send email for every new order</p>
            </div>
            <Toggle checked={notifs.newOrderEmail} onChange={() => toggle("newOrderEmail")} />
          </div>

          <div className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">WhatsApp Alert</p>
                <p className="text-xs text-text-secondary mt-0.5">Receive WhatsApp message for new orders</p>
              </div>
              <Toggle checked={notifs.newOrderWhatsApp} onChange={() => toggle("newOrderWhatsApp")} />
            </div>
            {notifs.newOrderWhatsApp && (
              <div className="mt-3 flex items-center gap-2">
                <Phone size={15} className="text-text-tertiary shrink-0" />
                <input
                  type="tel"
                  value={notifs.whatsAppPhone}
                  onChange={set("whatsAppPhone")}
                  placeholder="+91 98765 43210"
                  className="flex-1 h-9 px-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Reports & Alerts">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Daily Summary Email</p>
              <p className="text-xs text-text-secondary mt-0.5">End-of-day orders and revenue summary</p>
            </div>
            <Toggle checked={notifs.dailySummary} onChange={() => toggle("dailySummary")} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <div>
              <p className="text-sm font-semibold text-text-primary">Weekly Report</p>
              <p className="text-xs text-text-secondary mt-0.5">Weekly performance report every Monday</p>
            </div>
            <Toggle checked={notifs.weeklyReport} onChange={() => toggle("weeklyReport")} />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">Low Stock Alerts</p>
              <p className="text-xs text-text-secondary mt-0.5">Notify when menu items are running low</p>
            </div>
            <Toggle checked={notifs.lowStock} onChange={() => toggle("lowStock")} />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton loading={saving} onClick={handleSave} />
      </div>
    </div>
  );
}

// ── TAB: Account & Security ──────────────────────────────────────────────────
function AccountTab({ showToast }) {
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profile, setProfile] = useState({
    ownerName: "Vikram Malhotra",
    email: "vikram@spicegarden.in",
    phone: "+91 98765 43210",
  });

  const [password, setPassword] = useState({
    current: "",
    newPwd: "",
    confirm: "",
  });

  const [bankModal, setBankModal] = useState(false);
  const [bank, setBank] = useState({ ifsc: "HDFC0001234", account: "", name: "Vikram Malhotra" });
  const [closeModal, setCloseModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const setP = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setPwd = (key) => (e) => setPassword((p) => ({ ...p, [key]: e.target.value }));
  const setB = (key) => (e) => setBank((p) => ({ ...p, [key]: e.target.value }));

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    showToast("Profile updated successfully");
  };

  const handleChangePassword = async () => {
    if (!password.current || !password.newPwd || !password.confirm) {
      showToast("Please fill in all password fields");
      return;
    }
    if (password.newPwd !== password.confirm) {
      showToast("New passwords do not match");
      return;
    }
    setSavingPwd(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavingPwd(false);
    setPassword({ current: "", newPwd: "", confirm: "" });
    showToast("Password changed successfully");
  };

  const handleSaveBank = () => {
    setBankModal(false);
    showToast("Bank details updated");
  };

  const handleCloseRestaurant = () => {
    setCloseModal(false);
    showToast("Restaurant temporarily closed");
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Profile */}
      <SectionCard title="Owner Information">
        <div className="space-y-4">
          <div>
            <FieldLabel>Owner Name</FieldLabel>
            <TextInput value={profile.ownerName} onChange={setP("ownerName")} placeholder="Full name" />
          </div>
          <div>
            <FieldLabel>Email Address</FieldLabel>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full h-10 pl-8 pr-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-text-tertiary mt-1">Contact support to change your email address</p>
          </div>
          <div>
            <FieldLabel>Phone Number</FieldLabel>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="tel"
                value={profile.phone}
                onChange={setP("phone")}
                className="w-full h-10 pl-8 pr-3 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton loading={saving} onClick={handleSaveProfile} label="Update Profile" />
        </div>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password">
        <div className="space-y-4">
          {[
            { key: "current", label: "Current Password", show: showCurrent, setShow: setShowCurrent },
            { key: "newPwd",  label: "New Password",     show: showNew,     setShow: setShowNew },
            { key: "confirm", label: "Confirm New Password", show: showConfirm, setShow: setShowConfirm },
          ].map(({ key, label, show, setShow }) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={show ? "text" : "password"}
                  value={password[key]}
                  onChange={setPwd(key)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-8 pr-10 bg-bg-secondary border border-border-light rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <SaveButton loading={savingPwd} onClick={handleChangePassword} label="Change Password" />
        </div>
      </SectionCard>

      {/* Bank Account */}
      <SectionCard title="Linked Bank Account" subtitle="Payouts will be sent to this account">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-[var(--radius-lg)] flex items-center justify-center">
              <CreditCard size={18} className="text-[#FF5722]" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">HDFC ****4521</p>
              <p className="text-xs text-text-secondary">Savings Account · Vikram Malhotra</p>
            </div>
          </div>
          <button
            onClick={() => setBankModal(true)}
            className="h-9 px-4 border border-border-light rounded-[var(--radius-lg)] text-xs font-semibold text-text-secondary hover:bg-bg-hover transition-colors flex items-center gap-1.5"
          >
            Update <ChevronRight size={13} />
          </button>
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-error-light border border-error/20 rounded-[var(--radius-xl)] overflow-hidden">
        <div className="px-6 py-4 border-b border-error/15">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-error" />
            <h3 className="text-sm font-bold text-error">Danger Zone</h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">These actions can affect your restaurant's availability</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div>
              <p className="text-sm font-semibold text-text-primary">Temporarily Close Restaurant</p>
              <p className="text-xs text-text-secondary mt-0.5">Stop accepting orders until you reopen manually</p>
            </div>
            <button
              onClick={() => setCloseModal(true)}
              className="shrink-0 h-9 px-4 bg-warning text-white text-xs font-bold rounded-[var(--radius-lg)] hover:bg-warning/90 transition-colors"
            >
              Close Restaurant
            </button>
          </div>
          <div className="h-px bg-error/10" />
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div>
              <p className="text-sm font-semibold text-text-primary">Request Account Deletion</p>
              <p className="text-xs text-text-secondary mt-0.5">Permanently remove your restaurant and all data</p>
            </div>
            <button
              onClick={() => setDeleteModal(true)}
              className="shrink-0 h-9 px-4 bg-error text-white text-xs font-bold rounded-[var(--radius-lg)] hover:bg-error/90 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      <Modal
        isOpen={bankModal}
        onClose={() => setBankModal(false)}
        title="Update Bank Details"
        footer={
          <>
            <button
              onClick={() => setBankModal(false)}
              className="h-9 px-4 border border-border-light rounded-[var(--radius-lg)] text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBank}
              className="h-9 px-5 bg-[#FF5722] text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-[#e64a19] transition-colors"
            >
              Save Bank Details
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary bg-warning-light border border-warning/20 rounded-[var(--radius-md)] px-3 py-2">
            Bank details are encrypted and used only for payouts. Changes take 2–3 business days to verify.
          </p>
          <div>
            <FieldLabel required>IFSC Code</FieldLabel>
            <TextInput value={bank.ifsc} onChange={setB("ifsc")} placeholder="e.g. HDFC0001234" />
          </div>
          <div>
            <FieldLabel required>Account Number</FieldLabel>
            <TextInput value={bank.account} onChange={setB("account")} placeholder="Enter account number" type="password" />
          </div>
          <div>
            <FieldLabel required>Account Holder Name</FieldLabel>
            <TextInput value={bank.name} onChange={setB("name")} placeholder="As per bank records" />
          </div>
        </div>
      </Modal>

      {/* Close Restaurant Confirm Modal */}
      <Modal
        isOpen={closeModal}
        onClose={() => setCloseModal(false)}
        title="Temporarily Close Restaurant?"
        footer={
          <>
            <button
              onClick={() => setCloseModal(false)}
              className="h-9 px-4 border border-border-light rounded-[var(--radius-lg)] text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseRestaurant}
              className="h-9 px-5 bg-warning text-white text-sm font-bold rounded-[var(--radius-lg)] hover:bg-warning/90 transition-colors"
            >
              Yes, Close Now
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center justify-center w-14 h-14 bg-warning-light rounded-full mx-auto">
            <AlertTriangle size={28} className="text-warning" />
          </div>
          <p className="text-sm text-text-primary text-center">
            Your restaurant will be marked as <strong>Closed</strong> and customers won't be able to place new orders.
          </p>
          <p className="text-xs text-text-secondary text-center">
            You can reopen anytime from your dashboard. Pending orders will not be affected.
          </p>
        </div>
      </Modal>

      {/* Delete Account Info Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Request Account Deletion"
        footer={
          <button
            onClick={() => setDeleteModal(false)}
            className="h-9 px-5 border border-border-light rounded-[var(--radius-lg)] text-sm font-semibold text-text-secondary hover:bg-bg-hover transition-colors"
          >
            I Understand, Close
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center w-14 h-14 bg-error-light rounded-full mx-auto">
            <AlertTriangle size={28} className="text-error" />
          </div>
          <div className="space-y-3 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary text-center">What happens when you request deletion?</p>
            {[
              "Your account enters a 30-day review period",
              "All incoming orders will be paused immediately",
              "Your menu, reviews, and data will be archived",
              "After 30 days, all data is permanently deleted",
              "Pending payouts will be processed within 7–10 business days",
              "This action cannot be undone after the 30-day window",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-error-light text-error text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-tertiary bg-bg-secondary rounded-[var(--radius-md)] px-3 py-2">
            To proceed, email <strong>support@digistrive.in</strong> with subject "Account Deletion Request" from your registered email.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toasts, show: showToast, dismiss } = useToast();
  const { fetchProfile } = useRestaurantProfileStore();

  useEffect(() => {
    try {
      fetchProfile();
    } catch (err) {
      // error stored in store
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "general":       return <GeneralTab       showToast={showToast} />;
      case "location":      return <LocationTab      showToast={showToast} />;
      case "delivery":      return <DeliveryTab      showToast={showToast} />;
      case "notifications": return <NotificationsTab showToast={showToast} />;
      case "account":       return <AccountTab       showToast={showToast} />;
      default:              return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage your restaurant profile, hours, delivery options, and account
          </p>
        </div>

        <div className="flex gap-6 lg:items-start flex-col lg:flex-row">
          {/* Left tab nav — vertical on desktop, horizontal scroll on mobile */}
          <nav className="lg:w-52 shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-1 overflow-x-auto pb-1 lg:hidden scrollbar-none">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-lg)] text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === id
                      ? "bg-[#FF5722] text-white"
                      : "bg-bg-primary border border-border-light text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical */}
            <div className="hidden lg:flex flex-col gap-1 bg-bg-primary border border-border-light rounded-[var(--radius-xl)] p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold transition-colors text-left w-full ${
                    activeTab === id
                      ? "bg-[#FF5722] text-white"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  }`}
                >
                  <Icon size={15} className="shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0">{renderTab()}</div>
        </div>
      </div>

      <Toast toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
