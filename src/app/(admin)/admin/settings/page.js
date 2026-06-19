"use client";

import { useState, useCallback, useEffect } from "react";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Eye,
  EyeOff,
  Check,
  Copy,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { Toggle } from "@/components/ui";
import useAuthStore from "@/stores/authStore";
import useAdminSettingsStore from "@/stores/adminSettingsStore";

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

  function changePassword() {
    if (!currentPwd) return showToast("Enter current password", "error");
    if (newPwd.length < 8) return showToast("New password must be 8+ characters", "error");
    if (newPwd !== confirmPwd) return showToast("Passwords do not match", "error");
    setPwdLoading(true);
    setTimeout(() => {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdLoading(false);
      showToast("Password changed successfully");
    }, 700);
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
    }
  }, [settings]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  async function save() {
    setLoading(true);
    try {
      await updateSettings({ category: "platform", ...form });
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

  const [gateway, setGateway] = useState("razorpay");
  const [acceptCOD, setAcceptCOD] = useState(true);
  const [autoPayout, setAutoPayout] = useState(false);
  const [payoutFreq, setPayoutFreq] = useState("weekly");
  const [payoutThreshold, setPayoutThreshold] = useState("500");
  const [commission, setCommission] = useState("18");
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
      if (settings.gateway) setGateway(settings.gateway);
      if (settings.acceptCOD !== undefined) setAcceptCOD(settings.acceptCOD);
      if (settings.autoPayout !== undefined) setAutoPayout(settings.autoPayout);
      if (settings.payoutFreq) setPayoutFreq(settings.payoutFreq);
      if (settings.payoutThreshold) setPayoutThreshold(String(settings.payoutThreshold));
      if (settings.commission) setCommission(String(settings.commission));
    }
  }, [settings]);

  async function save() {
    setLoading(true);
    try {
      await updateSettings({
        category: "payments",
        gateway,
        acceptCOD,
        autoPayout,
        payoutFreq,
        payoutThreshold: Number(payoutThreshold),
        commission: Number(commission),
      });
      showToast("Payment settings saved");
    } catch (err) {
      console.error("Failed to save payment settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  const gateways = [
    { id: "razorpay", label: "Razorpay", desc: "Most popular in India" },
    { id: "stripe", label: "Stripe", desc: "Global coverage" },
    { id: "payu", label: "PayU", desc: "India & MENA" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="Payment Gateway">
        <div className="space-y-3">
          {gateways.map((gw) => (
            <label
              key={gw.id}
              className={`flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
                gateway === gw.id
                  ? "border-[#FF5722] bg-[#FF5722]/5"
                  : "border-border-light hover:border-[#FF5722]/40"
              }`}
            >
              <input
                type="radio"
                name="gateway"
                value={gw.id}
                checked={gateway === gw.id}
                onChange={() => setGateway(gw.id)}
                className="accent-[#FF5722] w-4 h-4"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">{gw.label}</p>
                <p className="text-xs text-text-secondary">{gw.desc}</p>
              </div>
              {gateway === gw.id && (
                <span className="ml-auto text-xs font-semibold text-[#FF5722] bg-[#FF5722]/10 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="COD & Payout Settings">
        <ToggleRow
          label="Accept Cash on Delivery (COD) Platform-wide"
          hint="Allows customers to pay with cash when placing orders"
          checked={acceptCOD}
          onChange={setAcceptCOD}
        />
        <ToggleRow
          label="Auto Payout to Restaurants"
          hint="Automatically transfer restaurant earnings on a schedule"
          checked={autoPayout}
          onChange={setAutoPayout}
        />
        {autoPayout && (
          <div className="mt-4 pl-4 border-l-2 border-[#FF5722]/30 space-y-4">
            <Field label="Payout Frequency">
              <SelectInput
                value={payoutFreq}
                onChange={setPayoutFreq}
                options={[
                  { value: "weekly", label: "Weekly" },
                  { value: "biweekly", label: "Biweekly" },
                  { value: "monthly", label: "Monthly" },
                ]}
              />
            </Field>
            <Field label="Minimum Payout Threshold (₹)" hint="Auto-payout only triggers when balance exceeds this amount">
              <TextInput value={payoutThreshold} onChange={setPayoutThreshold} type="number" placeholder="500" />
            </Field>
          </div>
        )}
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

      <div className="flex justify-end">
        <SaveButton onClick={save} loading={loading} />
      </div>
    </div>
  );
}

// ─── Tab: Notifications ──────────────────────────────────────────────────────

function NotificationsTab({ showToast }) {
  const { settings, fetchSettings, updateSettings } = useAdminSettingsStore();

  const [emailToggles, setEmailToggles] = useState({
    newRestaurant: true,
    largeOrder: true,
    paymentFailure: true,
    dailySummary: false,
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
      if (settings.emailToggles) setEmailToggles((p) => ({ ...p, ...settings.emailToggles }));
      if (settings.smsMode) setSmsMode(settings.smsMode);
      if (settings.webhookUrl) setWebhookUrl(settings.webhookUrl);
    }
  }, [settings]);

  const toggleEmail = (key) => setEmailToggles((p) => ({ ...p, [key]: !p[key] }));

  async function save() {
    setLoading(true);
    try {
      await updateSettings({
        category: "notifications",
        emailToggles,
        smsMode,
        webhookUrl,
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
        <ToggleRow
          label="New Restaurant Registration"
          hint="Notify when a new restaurant submits for approval"
          checked={emailToggles.newRestaurant}
          onChange={() => toggleEmail("newRestaurant")}
        />
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
        <ToggleRow
          label="Daily Summary Report"
          hint="Receive a daily digest of platform activity at 8 AM"
          checked={emailToggles.dailySummary}
          onChange={() => toggleEmail("dailySummary")}
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

// ─── Tab: Security ───────────────────────────────────────────────────────────

const mockLoginActivity = [
  { device: "Chrome / macOS", ip: "103.56.21.9", location: "Mumbai, IN", time: "Today, 09:41 AM" },
  { device: "Safari / iPhone", ip: "103.56.21.9", location: "Mumbai, IN", time: "Yesterday, 11:22 PM" },
  { device: "Chrome / Windows", ip: "45.112.88.3", location: "Delhi, IN", time: "3 Jun 2026, 4:15 PM" },
  { device: "Firefox / macOS", ip: "103.56.21.9", location: "Mumbai, IN", time: "1 Jun 2026, 10:00 AM" },
  { device: "Chrome / Android", ip: "72.31.105.7", location: "Bangalore, IN", time: "28 May 2026, 7:30 PM" },
];

function SecurityTab({ showToast }) {
  const { updateSettings } = useAdminSettingsStore();

  const [twoFA, setTwoFA] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState("1hr");
  const [ipWhitelist, setIpWhitelist] = useState("103.56.21.9\n45.112.88.3");
  const [revokeModal, setRevokeModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await updateSettings({
        category: "security",
        twoFA,
        sessionTimeout,
        ipWhitelist: ipWhitelist.split("\n").map((s) => s.trim()).filter(Boolean),
      });
      showToast("Security settings saved");
    } catch (err) {
      console.error("Failed to save security settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  function revokeAll() {
    setRevokeModal(false);
    showToast("All other sessions revoked");
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Two-Factor Authentication">
        <ToggleRow
          label="Enable Two-Factor Authentication (2FA)"
          hint="Add an extra layer of security with an authenticator app"
          checked={twoFA}
          onChange={setTwoFA}
        />
        {twoFA && (
          <div className="mt-5 p-5 rounded-[var(--radius-lg)] bg-bg-secondary border border-border-light">
            <p className="text-sm font-medium text-text-primary mb-4">Scan this QR code with your authenticator app</p>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-36 h-36 rounded-[var(--radius-md)] border-2 border-dashed border-border-light bg-bg-primary flex flex-col items-center justify-center gap-2 text-text-secondary shrink-0">
                <QrCode size={40} />
                <span className="text-xs text-center leading-tight px-2">QR Code<br />placeholder</span>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-xs text-text-secondary">
                  After scanning, enter the 6-digit code from your app to verify setup.
                </p>
                <Field label="Verification Code">
                  <div className="flex gap-3">
                    <div className="w-44">
                      <TextInput
                        value={verifyCode}
                        onChange={setVerifyCode}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (verifyCode.length === 6) showToast("2FA verified and enabled");
                        else showToast("Enter a valid 6-digit code", "error");
                      }}
                      className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-white"
                      style={{ backgroundColor: "#FF5722" }}
                    >
                      Verify
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Session Management">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Session Timeout" hint="Automatically log out after inactivity">
            <SelectInput
              value={sessionTimeout}
              onChange={setSessionTimeout}
              options={[
                { value: "30min", label: "30 Minutes" },
                { value: "1hr", label: "1 Hour" },
                { value: "4hr", label: "4 Hours" },
                { value: "8hr", label: "8 Hours" },
                { value: "never", label: "Never" },
              ]}
            />
          </Field>
          <Field label="IP Whitelist" hint="One IP address per line. Leave empty to allow all.">
            <textarea
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              rows={4}
              placeholder={"192.168.1.1\n10.0.0.1"}
              className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-border-light bg-bg-secondary text-text-primary text-sm font-mono placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#FF5722]/30 focus:border-[#FF5722] transition-colors resize-none"
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Recent Login Activity">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Device</th>
                <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">IP Address</th>
                <th className="text-left text-xs font-semibold text-text-secondary pb-3 pr-4">Location</th>
                <th className="text-left text-xs font-semibold text-text-secondary pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockLoginActivity.map((row, i) => (
                <tr key={i} className="border-b border-border-light last:border-0">
                  <td className="py-3 pr-4 text-text-primary font-medium">{row.device}</td>
                  <td className="py-3 pr-4 text-text-secondary font-mono text-xs">{row.ip}</td>
                  <td className="py-3 pr-4 text-text-secondary">{row.location}</td>
                  <td className="py-3 text-text-secondary text-xs whitespace-nowrap">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => setRevokeModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={14} />
          Revoke All Sessions
        </button>
        <SaveButton onClick={save} loading={loading} />
      </div>

      {revokeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-text-primary">Revoke All Sessions</h4>
                <p className="text-xs text-text-secondary">This will sign out all active sessions</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              You will be logged out of all devices except the current session. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRevokeModal(false)}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-text-primary border border-border-light hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={revokeAll}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Revoke All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Appearance ─────────────────────────────────────────────────────────

function AppearanceTab({ showToast }) {
  const { updateSettings } = useAdminSettingsStore();

  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("#FF5722");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await updateSettings({ category: "appearance", theme, primaryColor, sidebarCollapsed });
      showToast("Appearance settings saved");
    } catch (err) {
      console.error("Failed to save appearance settings", err);
      showToast("Failed to save settings", "error");
    } finally {
      setLoading(false);
    }
  }

  const colorSwatches = [
    { color: "#FF5722", label: "Orange" },
    { color: "#2563EB", label: "Blue" },
    { color: "#7C3AED", label: "Purple" },
  ];

  const themes = [
    { id: "light", label: "Light", icon: "☀️" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "system", label: "System", icon: "💻" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="Theme">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <label
              key={t.id}
              className={`flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-colors ${
                theme === t.id
                  ? "border-[#FF5722] bg-[#FF5722]/5"
                  : "border-border-light hover:border-[#FF5722]/40"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={t.id}
                checked={theme === t.id}
                onChange={() => setTheme(t.id)}
                className="sr-only"
              />
              <span className="text-2xl">{t.icon}</span>
              <span className="text-sm font-medium text-text-primary">{t.label}</span>
              {theme === t.id && (
                <Check size={14} className="text-[#FF5722]" />
              )}
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Primary Color">
        <p className="text-sm text-text-secondary mb-4">Choose the accent color for the admin panel</p>
        <div className="flex items-center gap-4">
          {colorSwatches.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => setPrimaryColor(color)}
              title={label}
              className={`w-12 h-12 rounded-[var(--radius-md)] border-2 transition-all duration-150 flex items-center justify-center ${
                primaryColor === color ? "border-text-primary scale-110 shadow-md" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
            >
              {primaryColor === color && <Check size={16} className="text-white" />}
            </button>
          ))}
          <div className="ml-2">
            <p className="text-sm font-mono text-text-primary">{primaryColor}</p>
            <p className="text-xs text-text-secondary capitalize">
              {colorSwatches.find((s) => s.color === primaryColor)?.label || "Custom"}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Sidebar">
        <ToggleRow
          label="Collapsed by Default"
          hint="Start the sidebar in icon-only collapsed mode when the page loads"
          checked={sidebarCollapsed}
          onChange={setSidebarCollapsed}
        />
      </SectionCard>

      <div className="p-4 rounded-[var(--radius-lg)] bg-amber-50 border border-amber-200 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Theme customization</span> — coming soon for live preview. Changes saved here will apply on next deployment.
        </p>
      </div>

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
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
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
      case "security": return <SecurityTab showToast={showToast} />;
      case "appearance": return <AppearanceTab showToast={showToast} />;
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
            Manage your platform configuration, security, and preferences
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
                  {activeTab === "security" && "Authentication, sessions, and access control"}
                  {activeTab === "appearance" && "Theme, colors, and layout preferences"}
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
