"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Toggle } from "@/components/ui";
import useAuthStore from "@/stores/authStore";
import useAdminSettingsStore from "@/stores/adminSettingsStore";
import useAdminDashboardStore from "@/stores/adminDashboardStore";
import api from "@/lib/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-[var(--radius-lg)] shadow-lg text-sm font-medium transition-all duration-300 ${
        toast.type === "success"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {toast.type === "success" ? (
        <Check size={16} />
      ) : (
        <AlertTriangle size={16} />
      )}
      {toast.message}
    </div>
  );
}

function SaveButton({ onClick, loading, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white transition-opacity disabled:opacity-70"
      style={{ backgroundColor: "#FF5722" }}
    >
      {loading ? (
        <>
          <RefreshCw size={14} className="animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <Check size={14} />
          {label}
        </>
      )}
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-6">
      {title && (
        <h3 className="text-base font-semibold text-text-primary mb-5">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border-light bg-bg-secondary text-text-primary text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
      {...rest}
    />
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border-light bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border-light last:border-0">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {hint && <p className="text-xs text-text-secondary mt-0.5">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Tab: Profile ────────────────────────────────────────────────────────────

function ProfileTab({ showToast }) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [name, setName] = useState(user?.name || "Super Admin");
  const [email, setEmail] = useState(user?.email || "admin@cafesriisha.com");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  function saveProfile() {
    setProfileLoading(true);
    setTimeout(() => {
      updateProfile({ name, email, phone });
      setProfileLoading(false);
      showToast("Profile updated successfully");
    }, 700);
  }

  async function changePassword() {
    if (!currentPwd) return showToast("Enter current password", "error");
    if (newPwd.length < 8) return showToast("New password must be 8+ characters", "error");
    if (newPwd !== confirmPwd) return showToast("Passwords do not match", "error");
    setPwdLoading(true);
    try {
      await api.put("/admin/change-password", { currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setPwdLoading(false);
    }
  }

  const EyeToggle = ({ field }) => (
    <button
      type="button"
      onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
    >
      {showPwd[field] ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name">
            <TextInput value={name} onChange={setName} placeholder="Your name" />
          </Field>
          <Field label="Email Address">
            <TextInput value={email} onChange={setEmail} placeholder="admin@example.com" type="email" />
          </Field>
          <Field label="Phone Number">
            <TextInput value={phone} onChange={setPhone} placeholder="+91 00000 00000" />
          </Field>
          <Field label="Role">
            <TextInput value="Super Admin" onChange={() => {}} disabled className="opacity-60 cursor-not-allowed" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <SaveButton onClick={saveProfile} loading={profileLoading} />
        </div>
      </SectionCard>

      <SectionCard title="Change Password">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Current Password">
            <div className="relative">
              <TextInput
                value={currentPwd}
                onChange={setCurrentPwd}
                type={showPwd.current ? "text" : "password"}
                placeholder="Enter current password"
              />
              <EyeToggle field="current" />
            </div>
          </Field>
          <div />
          <Field label="New Password">
            <div className="relative">
              <TextInput
                value={newPwd}
                onChange={setNewPwd}
                type={showPwd.new ? "text" : "password"}
                placeholder="Min 8 characters"
              />
              <EyeToggle field="new" />
            </div>
          </Field>
          <Field label="Confirm New Password">
            <div className="relative">
              <TextInput
                value={confirmPwd}
                onChange={setConfirmPwd}
                type={showPwd.confirm ? "text" : "password"}
                placeholder="Repeat new password"
              />
              <EyeToggle field="confirm" />
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <SaveButton onClick={changePassword} loading={pwdLoading} label="Update Password" />
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Platform ───────────────────────────────────────────────────────────

function PlatformTab({ showToast }) {
  const { settings, isLoading: settingsLoading, isSaving: settingsSaving, fetchSettings, updateSettings } =
    useAdminSettingsStore();

  const [form, setForm] = useState({
    platformName: "CafeSriisha Food",
    tagline: "Delivering happiness, one meal at a time",
    supportEmail: "support@cafesriisha.com",
    supportPhone: "+91 1800 123 4567",
    gst: "27AABCU9603R1ZX",
    pan: "AABCU9603R",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
  });
  const [orderTypesEnabled, setOrderTypesEnabled] = useState({
    delivery: true,
    dine_in: true,
    pickup: true,
    self_service: true,
  });
  const [loading, setLoading] = useState(false);

  // Fetch platform settings on mount and merge into form
  useEffect(() => {
    async function load() {
      try {
        await fetchSettings("platform");
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    }
    load();
  }, [fetchSettings]);

  // When store settings load, hydrate form
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setForm((prev) => ({
        ...prev,
        platformName: settings.platformName ?? prev.platformName,
        tagline: settings.tagline ?? prev.tagline,
        supportEmail: settings.supportEmail ?? prev.supportEmail,
        supportPhone: settings.supportPhone ?? prev.supportPhone,
        gst: settings.gst ?? prev.gst,
        pan: settings.pan ?? prev.pan,
        timezone: settings.timezone ?? prev.timezone,
        currency: settings.currency ?? prev.currency,
        language: settings.language ?? prev.language,
      }));
      if (settings.orderTypesEnabled?.value) {
        setOrderTypesEnabled((prev) => ({ ...prev, ...settings.orderTypesEnabled.value }));
      }
    }
  }, [settings]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));
  const toggleOrderType = (key) =>
    setOrderTypesEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const stillHasOneEnabled = Object.values(next).some(Boolean);
      if (!stillHasOneEnabled) {
        showToast("At least one order type must stay enabled — customers need a way to order", "error");
        return prev;
      }
      return next;
    });

  async function save() {
    if (!Object.values(orderTypesEnabled).some(Boolean)) {
      showToast("At least one order type must stay enabled — customers need a way to order", "error");
      return;
    }
    setLoading(true);
    try {
      await updateSettings({
        category: "platform",
        ...form,
        orderTypesEnabled: { value: orderTypesEnabled, category: "platform" },
      });
      showToast("Platform settings saved");
    } catch (err) {
      console.error("Failed to save settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Business Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Platform Name">
            <TextInput value={form.platformName} onChange={set("platformName")} placeholder="Platform name" />
          </Field>
          <Field label="Tagline">
            <TextInput value={form.tagline} onChange={set("tagline")} placeholder="Your tagline" />
          </Field>
          <Field label="Support Email">
            <TextInput value={form.supportEmail} onChange={set("supportEmail")} type="email" placeholder="support@example.com" />
          </Field>
          <Field label="Support Phone">
            <TextInput value={form.supportPhone} onChange={set("supportPhone")} placeholder="+91 1800 000 0000" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Tax & Compliance">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="GST Number">
            <TextInput value={form.gst} onChange={set("gst")} placeholder="22AAAAA0000A1Z5" />
          </Field>
          <Field label="PAN Number">
            <TextInput value={form.pan} onChange={set("pan")} placeholder="AAAAA0000A" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Locale & Region">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Time Zone">
            <SelectInput
              value={form.timezone}
              onChange={set("timezone")}
              options={[
                { value: "Asia/Kolkata", label: "IST — Asia/Kolkata" },
                { value: "America/New_York", label: "EST — America/New_York" },
                { value: "Europe/London", label: "GMT — Europe/London" },
                { value: "Asia/Dubai", label: "GST — Asia/Dubai" },
                { value: "America/Los_Angeles", label: "PST — America/Los_Angeles" },
              ]}
            />
          </Field>
          <Field label="Currency">
            <SelectInput
              value={form.currency}
              onChange={set("currency")}
              options={[
                { value: "INR", label: "INR — Indian Rupee (₹)" },
                { value: "USD", label: "USD — US Dollar ($)" },
                { value: "AED", label: "AED — UAE Dirham (د.إ)" },
              ]}
            />
          </Field>
          <Field label="Default Language">
            <SelectInput
              value={form.language}
              onChange={set("language")}
              options={[
                { value: "en", label: "English" },
                { value: "hi", label: "Hindi" },
                { value: "ar", label: "Arabic" },
                { value: "fr", label: "French" },
              ]}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Order Types">
        <p className="text-sm text-text-secondary -mt-3 mb-1">
          Turn order types off platform-wide to hide them from customers at checkout.
        </p>
        <ToggleRow
          label="Delivery"
          hint="Order gets delivered to the customer's address"
          checked={orderTypesEnabled.delivery}
          onChange={() => toggleOrderType("delivery")}
        />
        <ToggleRow
          label="Dine-in"
          hint="Customer visits and eats at the restaurant"
          checked={orderTypesEnabled.dine_in}
          onChange={() => toggleOrderType("dine_in")}
        />
        <ToggleRow
          label="Takeout / Pickup"
          hint="Customer picks up and takes the order away"
          checked={orderTypesEnabled.pickup}
          onChange={() => toggleOrderType("pickup")}
        />
        <ToggleRow
          label="Self Service"
          hint="Customer is at the restaurant and collects the order themselves"
          checked={orderTypesEnabled.self_service}
          onChange={() => toggleOrderType("self_service")}
        />
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} />
      </div>
    </div>
  );
}

// ─── Tab: Payments ──────────────────────────────────────────────────────────

function PaymentsTab({ showToast }) {
  const { settings, isLoading: settingsLoading, fetchSettings, updateSettings } =
    useAdminSettingsStore();
  const { stats: dashboardStats, fetchDashboardStats } = useAdminDashboardStore();

  useEffect(() => {
    fetchDashboardStats().catch(() => {});
  }, [fetchDashboardStats]);

  const [acceptCOD, setAcceptCOD] = useState(true);
  const [commission, setCommission] = useState("18");
  const [platformFeeEnabled, setPlatformFeeEnabled] = useState(true);
  const [platformFeeAmount, setPlatformFeeAmount] = useState("3");
  const [membershipPrice, setMembershipPrice] = useState("299");
  const [membershipDiscountPercent, setMembershipDiscountPercent] = useState("20");
  const [membershipDurationDays, setMembershipDurationDays] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        await fetchSettings("payments");
      } catch (err) {
        console.error("Failed to fetch payment settings", err);
      }
    }
    load();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      if (settings.acceptCOD?.value !== undefined) setAcceptCOD(!!settings.acceptCOD.value);
      if (settings.commission?.value !== undefined) setCommission(String(settings.commission.value));
      if (settings.platformFeeEnabled?.value !== undefined) setPlatformFeeEnabled(!!settings.platformFeeEnabled.value);
      if (settings.platformFeeAmount?.value !== undefined) setPlatformFeeAmount(String(settings.platformFeeAmount.value));
      if (settings.membershipPrice?.value !== undefined) setMembershipPrice(String(settings.membershipPrice.value));
      if (settings.membershipDiscountPercent?.value !== undefined) setMembershipDiscountPercent(String(settings.membershipDiscountPercent.value));
      if (settings.membershipDurationDays?.value !== undefined) setMembershipDurationDays(String(settings.membershipDurationDays.value));
    }
  }, [settings]);

  async function save() {
    setLoading(true);
    try {
      await updateSettings({
        category: "payments",
        acceptCOD: { value: acceptCOD, category: "payments" },
        commission: { value: Number(commission), category: "payments" },
        platformFeeEnabled: { value: platformFeeEnabled, category: "payments" },
        platformFeeAmount: { value: Number(platformFeeAmount), category: "payments" },
        membershipPrice: { value: Number(membershipPrice), category: "payments" },
        membershipDiscountPercent: { value: Number(membershipDiscountPercent), category: "payments" },
        membershipDurationDays: { value: Number(membershipDurationDays), category: "payments" },
      });
      showToast("Payment settings saved");
    } catch (err) {
      console.error("Failed to save payment settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Payment Gateway">
        <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border border-[#FF5722] bg-[#FF5722]/5">
          <div>
            <p className="text-sm font-semibold text-text-primary">Razorpay</p>
            <p className="text-xs text-text-secondary">The only gateway currently integrated — web and mobile checkout both go through it</p>
          </div>
          <span className="ml-auto text-xs font-semibold text-[#FF5722] bg-[#FF5722]/10 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </SectionCard>

      <SectionCard title="COD Settings">
        <ToggleRow
          label="Accept Cash on Delivery (COD) Platform-wide"
          hint="Allows customers to pay with cash when placing orders"
          checked={acceptCOD}
          onChange={setAcceptCOD}
        />
      </SectionCard>

      <SectionCard title="Commission">
        <Field label="Platform Commission %" hint="Percentage deducted from each order before restaurant payout">
          <div className="flex items-center gap-3">
            <div className="w-40">
              <TextInput value={commission} onChange={setCommission} type="number" placeholder="18" />
            </div>
            <span className="text-sm text-text-secondary">
              % of order value
            </span>
          </div>
        </Field>
      </SectionCard>

      <SectionCard title="Platform Fee">
        <ToggleRow
          label="Charge Platform Fee"
          hint="Flat fee added to every customer order at checkout, across web and mobile"
          checked={platformFeeEnabled}
          onChange={setPlatformFeeEnabled}
        />
        {platformFeeEnabled && (
          <div className="mt-4 pl-4 border-l-2 border-[#FF5722]/30">
            <Field label="Platform Fee Amount (₹)" hint="Flat amount charged to the customer per order">
              <div className="w-40">
                <TextInput value={platformFeeAmount} onChange={setPlatformFeeAmount} type="number" placeholder="3" />
              </div>
            </Field>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Membership">
        <p className="text-sm text-text-secondary -mt-3 mb-4">
          Customers pay to get a flat discount on every order for a fixed period.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-[var(--radius-lg)] border border-border-light bg-bg-secondary px-4 py-3">
            <p className="text-xs text-text-tertiary">Customers who&apos;ve ever purchased membership</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {dashboardStats?.totalMembersEverPurchased ?? "—"}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border-light bg-bg-secondary px-4 py-3">
            <p className="text-xs text-text-tertiary">Currently active members</p>
            <p className="text-2xl font-bold text-text-primary mt-1">
              {dashboardStats?.activeMembers ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Price (₹)" hint="Charged per purchase/renewal">
            <TextInput value={membershipPrice} onChange={setMembershipPrice} type="number" placeholder="299" />
          </Field>
          <Field label="Discount %" hint="Applied to every order's item total">
            <TextInput value={membershipDiscountPercent} onChange={setMembershipDiscountPercent} type="number" placeholder="20" />
          </Field>
          <Field label="Duration (days)" hint="How long each purchase/renewal lasts">
            <TextInput value={membershipDurationDays} onChange={setMembershipDurationDays} type="number" placeholder="30" />
          </Field>
        </div>

        <p className="text-xs text-text-tertiary mt-4">
          To actually offer membership to a customer, use the &quot;Send Popup&quot; action on the{" "}
          <Link href="/admin/customers" className="text-primary hover:underline">Customers</Link> page.
        </p>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} />
      </div>
    </div>
  );
}

// ─── Tab: Notifications ──────────────────────────────────────────────────────

function NotificationsTab({ showToast }) {
  const { settings, fetchSettings, updateSettings } = useAdminSettingsStore();

  const [notificationEmail, setNotificationEmail] = useState("");
  const [emailToggles, setEmailToggles] = useState({
    largeOrder: true,
    paymentFailure: true,
  });
  const [smsMode, setSmsMode] = useState("otp"); // otp | otp_marketing
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.cafesriisha.com/orders");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        await fetchSettings("notifications");
      } catch (err) {
        console.error("Failed to fetch notification settings", err);
      }
    }
    load();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      if (settings.notificationEmail?.value !== undefined) setNotificationEmail(settings.notificationEmail.value);
      if (settings.emailToggles?.value) setEmailToggles((p) => ({ ...p, ...settings.emailToggles.value }));
      if (settings.smsMode?.value) setSmsMode(settings.smsMode.value);
      if (settings.webhookUrl?.value) setWebhookUrl(settings.webhookUrl.value);
    }
  }, [settings]);

  const toggleEmail = (key) => setEmailToggles((p) => ({ ...p, [key]: !p[key] }));

  async function save() {
    if (notificationEmail && !/^\S+@\S+\.\S+$/.test(notificationEmail)) {
      return showToast("Enter a valid notification email address", "error");
    }
    setLoading(true);
    try {
      await updateSettings({
        notificationEmail: { value: notificationEmail, category: "notifications" },
        emailToggles: { value: emailToggles, category: "notifications" },
        smsMode: { value: smsMode, category: "notifications" },
        webhookUrl: { value: webhookUrl, category: "notifications" },
      });
      showToast("Notification preferences saved");
    } catch (err) {
      console.error("Failed to save notification settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Email Notifications">
        <div className="pb-4 mb-1 border-b border-border-light">
          <Field label="Notification Email" hint="Admin alerts (large orders, payment failures) are sent to this address">
            <TextInput
              value={notificationEmail}
              onChange={setNotificationEmail}
              placeholder="you@example.com"
              type="email"
            />
          </Field>
        </div>
        <ToggleRow
          label="Large Order Alerts"
          hint="Get notified for orders above ₹5,000"
          checked={emailToggles.largeOrder}
          onChange={() => toggleEmail("largeOrder")}
        />
        <ToggleRow
          label="Payment Failures"
          hint="Immediate alerts for failed transactions"
          checked={emailToggles.paymentFailure}
          onChange={() => toggleEmail("paymentFailure")}
        />
      </SectionCard>

      <SectionCard title="SMS Notifications">
        <div className="space-y-3">
          {[
            { id: "otp", label: "OTP Only", desc: "Send SMS for authentication OTPs only" },
            { id: "otp_marketing", label: "OTP + Marketing", desc: "OTPs and promotional messages to users" },
          ].map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
                smsMode === option.id
                  ? "border-[#FF5722] bg-[#FF5722]/5"
                  : "border-border-light hover:border-[#FF5722]/40"
              }`}
            >
              <input
                type="radio"
                name="smsMode"
                value={option.id}
                checked={smsMode === option.id}
                onChange={() => setSmsMode(option.id)}
                className="accent-[#FF5722] w-4 h-4"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">{option.label}</p>
                <p className="text-xs text-text-secondary">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Webhook">
        <Field label="Webhook URL" hint="We'll POST order lifecycle events to this endpoint">
          <TextInput value={webhookUrl} onChange={setWebhookUrl} placeholder="https://your-server.com/webhook" />
        </Field>
        <p className="mt-3 text-xs text-text-secondary">
          Events sent: <span className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-light">order.placed</span>{" "}
          <span className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-light">order.delivered</span>{" "}
          <span className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-light">order.cancelled</span>{" "}
          <span className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded border border-border-light">payment.failed</span>
        </p>
      </SectionCard>

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "platform", label: "Platform", icon: Building2 },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast, show: showToast } = useToast();

  function renderTab() {
    switch (activeTab) {
      case "profile": return <ProfileTab showToast={showToast} />;
      case "platform": return <PlatformTab showToast={showToast} />;
      case "payments": return <PaymentsTab showToast={showToast} />;
      case "notifications": return <NotificationsTab showToast={showToast} />;
      default: return null;
    }
  }

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your platform configuration and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Sidebar Nav (desktop) / Horizontal scroll (mobile) ── */}
          <nav className="w-full lg:w-56 shrink-0">
            {/* Mobile: horizontal scroll */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-none">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-primary border border-border-light"
                    }`}
                    style={isActive ? { backgroundColor: "#FF5722" } : {}}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical list */}
            <div className="hidden lg:flex flex-col gap-1 bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-medium transition-colors w-full text-left group ${
                      isActive
                        ? "text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary"
                    }`}
                    style={isActive ? { backgroundColor: "#FF5722" } : {}}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{tab.label}</span>
                    {isActive && <ChevronRight size={14} className="opacity-70" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── Content Area ── */}
          <div className="flex-1 min-w-0">
            {/* Section heading */}
            <div className="flex items-center gap-3 mb-6">
              {activeTabData && (
                <div
                  className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#FF5722" + "1A" }}
                >
                  <activeTabData.icon size={18} style={{ color: "#FF5722" }} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{activeTabData?.label}</h2>
                <p className="text-xs text-text-secondary">
                  {activeTab === "profile" && "Manage your account information and credentials"}
                  {activeTab === "platform" && "Configure business identity, locale, and compliance"}
                  {activeTab === "payments" && "Payment gateways, COD, commissions, and payouts"}
                  {activeTab === "notifications" && "Email, SMS, and webhook notification preferences"}
                </p>
              </div>
            </div>

            {renderTab()}
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
