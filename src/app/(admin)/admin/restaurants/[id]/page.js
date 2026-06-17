"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  FileText,
  Percent,
  Activity,
  ShoppingBag,
  IndianRupee,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Ban,
  RefreshCcw,
  Key,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogIn,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatPrice, formatDate } from "@/lib/utils";
import useAdminRestaurantStore from "@/stores/adminRestaurantStore";
import api from "@/lib/api";

const MENU_OVERVIEW = [
  { category: "Starters", items: 8 },
  { category: "Main Course", items: 14 },
  { category: "Breads", items: 6 },
  { category: "Rice & Biryani", items: 5 },
  { category: "Desserts", items: 4 },
];

const ACTIVITY_LOG = [
  { id: 1, action: "Restaurant approved by Admin", user: "Admin User", time: "2 days ago" },
  { id: 2, action: "Menu item 'Butter Chicken' added", user: "Owner", time: "3 days ago" },
  { id: 3, action: "Order #ORD-4412 delivered", user: "System", time: "4 days ago" },
  { id: 4, action: "Commission rate updated to 15%", user: "Admin User", time: "5 days ago" },
  { id: 5, action: "Restaurant profile verified", user: "Admin User", time: "1 week ago" },
];

const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-success-light", text: "text-success-dark" },
  pending: { label: "Pending", bg: "bg-warning-light", text: "text-warning" },
  suspended: { label: "Suspended", bg: "bg-error-light", text: "text-error" },
};

const ORDER_STATUS_CONFIG = {
  delivered: { label: "Delivered", bg: "bg-success-light", text: "text-success-dark" },
  cancelled: { label: "Cancelled", bg: "bg-error-light", text: "text-error" },
  preparing: { label: "Preparing", bg: "bg-warning-light", text: "text-warning" },
  placed: { label: "Placed", bg: "bg-primary-50", text: "text-primary" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.placed;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-full)] text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function Card({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-text-tertiary" />}
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatItem({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-text-tertiary uppercase tracking-wide font-medium">{label}</p>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      {sub && <p className="text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

function DocRow({ label, value, verified }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0">
      <div>
        <p className="text-xs text-text-tertiary font-medium">{label}</p>
        <p className="text-sm text-text-primary font-mono mt-0.5">
          {value || <span className="text-text-tertiary italic font-sans">Not provided</span>}
        </p>
      </div>
      {value && (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-full)] ${
            verified
              ? "bg-success-light text-success-dark"
              : "bg-warning-light text-warning"
          }`}
        >
          {verified ? "Verified" : "Pending"}
        </span>
      )}
    </div>
  );
}

export default function RestaurantDetailPage({ params }) {
  const { id } = use(params);

  const {
    currentRestaurant,
    orderCount,
    recentOrders,
    isLoading,
    fetchRestaurantDetail,
    verifyRestaurant,
    suspendRestaurant,
  } = useAdminRestaurantStore();

  const [status, setStatus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [logins, setLogins] = useState([]);
  const [loginsLoading, setLoginsLoading] = useState(false);
  const [addLoginOpen, setAddLoginOpen] = useState(false);
  const [addLoginForm, setAddLoginForm] = useState({ name: "", email: "", phone: "" });
  const [addLoginLoading, setAddLoginLoading] = useState(false);
  const [addLoginError, setAddLoginError] = useState("");
  const [resetResult, setResetResult] = useState({}); // { [userId]: newPassword }
  const [resettingId, setResettingId] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        await fetchRestaurantDetail(id);
      } catch (err) {
        console.error("Failed to fetch restaurant detail:", err);
      }
    }
    load();
  }, [id, fetchRestaurantDetail]);

  // Sync local status state when currentRestaurant loads
  useEffect(() => {
    if (currentRestaurant) {
      setStatus(currentRestaurant.status);
    }
  }, [currentRestaurant]);

  const fetchLogins = async () => {
    if (!id) return;
    setLoginsLoading(true);
    try {
      const res = await api.get(`/admin/restaurants/${id}/logins`);
      setLogins(res.data?.logins || []);
    } catch {}
    setLoginsLoading(false);
  };

  useEffect(() => {
    if (id) fetchLogins();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 size={40} className="text-primary animate-spin mb-4 opacity-60" />
        <p className="text-text-secondary text-sm">Loading restaurant details...</p>
      </div>
    );
  }

  if (!currentRestaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle size={48} className="text-warning mb-4 opacity-60" />
        <h2 className="text-xl font-bold text-text-primary">Restaurant Not Found</h2>
        <p className="text-text-secondary mt-2 text-sm">
          The restaurant you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/admin/restaurants"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const restaurant = currentRestaurant;
  const orders = recentOrders || [];
  const totalOrders = orderCount || 0;
  const revenue = restaurant.revenue || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
  const totalMenuItems = MENU_OVERVIEW.reduce((s, c) => s + c.items, 0);

  // Normalise nested owner fields
  const ownerName = restaurant.owner?.name || "—";
  const ownerEmail = restaurant.owner?.email || "";
  const ownerPhone = restaurant.owner?.phone || restaurant.contact?.phone || "";
  const area = restaurant.address?.area || "";
  const city = restaurant.address?.city || "";
  const cuisines = restaurant.cuisines || [];
  const categories = restaurant.categories || [];
  const fssai = restaurant.documents?.fssai || restaurant.fssai || "";
  const gst = restaurant.documents?.gst || restaurant.gst || "";
  const pan = restaurant.documents?.pan || restaurant.pan || "";

  function openActionModal(action) {
    setPendingAction(action);
    setModalOpen(true);
  }

  async function confirmAction() {
    setActionLoading(true);
    try {
      if (pendingAction === "approve" || pendingAction === "reactivate") {
        await verifyRestaurant(restaurant._id);
        setStatus("active");
      } else if (pendingAction === "suspend") {
        await suspendRestaurant(restaurant._id, "");
        setStatus("suspended");
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
    setActionLoading(false);
    setModalOpen(false);
    setPendingAction(null);
  }

  const ACTION_LABELS = {
    approve: { label: "Approve Restaurant", desc: "This will activate the restaurant and allow it to receive orders.", icon: CheckCircle, color: "bg-success text-white hover:bg-success-dark" },
    suspend: { label: "Suspend Restaurant", desc: "This will temporarily disable the restaurant. It will not appear to customers.", icon: Ban, color: "bg-error text-white hover:bg-error" },
    reactivate: { label: "Reactivate Restaurant", desc: "This will restore the restaurant's active status.", icon: RefreshCcw, color: "bg-primary text-white hover:bg-primary-dark" },
  };

  const actionMeta = ACTION_LABELS[pendingAction] || {};

  const togglePasswordVisible = (userId) =>
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));

  const copyToClipboard = (text, userId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = async (userId) => {
    setResettingId(userId);
    try {
      const res = await api.put(`/admin/restaurants/${id}/logins/${userId}/reset-password`);
      const newPwd = res.data?.newPassword;
      setResetResult((prev) => ({ ...prev, [userId]: newPwd }));
      setVisiblePasswords((prev) => ({ ...prev, [userId]: true }));
    } catch {}
    setResettingId(null);
  };

  const handleImpersonate = async (login) => {
    setImpersonatingId(login._id);
    try {
      const res = await api.get(`/admin/restaurants/${id}/logins/${login._id}/impersonate-token`);
      const { impersonateToken } = res.data;
      window.open(`/restaurant/impersonate?t=${impersonateToken}`, "_blank");
    } catch {}
    setImpersonatingId(null);
  };

  const handleAddLogin = async () => {
    setAddLoginLoading(true);
    setAddLoginError("");
    try {
      const res = await api.post(`/admin/restaurants/${id}/logins`, addLoginForm);
      const { user, tempPassword } = res.data;
      setLogins((prev) => [...prev, {
        _id: user._id, name: user.name, email: user.email,
        phone: user.phone, isOwner: false, initialPassword: tempPassword,
      }]);
      setResetResult((prev) => ({ ...prev, [user._id]: tempPassword }));
      setVisiblePasswords((prev) => ({ ...prev, [user._id]: true }));
      setAddLoginOpen(false);
      setAddLoginForm({ name: "", email: "", phone: "" });
    } catch (err) {
      setAddLoginError(err.message || "Failed to create login");
    }
    setAddLoginLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/admin/restaurants"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Back
        </Link>
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-xl font-bold text-text-primary">{restaurant.name}</h1>
            <StatusBadge status={status || restaurant.status} />
          </div>
          <div className="flex items-center gap-2">
            {(status || restaurant.status) === "pending" && (
              <button
                onClick={() => openActionModal("approve")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-lg)] bg-success text-white text-sm font-semibold hover:bg-success-dark transition-colors cursor-pointer"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            )}
            {(status || restaurant.status) === "active" && (
              <button
                onClick={() => openActionModal("suspend")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-lg)] bg-error text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Ban size={14} />
                Suspend
              </button>
            )}
            {(status || restaurant.status) === "suspended" && (
              <button
                onClick={() => openActionModal("reactivate")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <RefreshCcw size={14} />
                Reactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Restaurant Info */}
          <Card title="Restaurant Info" icon={FileText}>
            <div className="space-y-4">
              {restaurant.description && (
                <p className="text-sm text-text-secondary leading-relaxed">{restaurant.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-2">Cuisines</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cuisines.map((c) => (
                      <span key={c} className="px-2.5 py-1 bg-primary-50 text-primary text-xs font-medium rounded-[var(--radius-full)]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <span key={c} className="px-2.5 py-1 bg-bg-secondary text-text-secondary text-xs font-medium rounded-[var(--radius-full)] border border-border-default">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-1">Location</p>
                  <p className="text-text-primary">{area ? `${area}, ` : ""}{city}</p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mb-1">Timing</p>
                  <p className="text-text-primary">11:00 – 23:00</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance */}
          <Card title="Performance" icon={Activity}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <StatItem
                label="Rating"
                value={
                  restaurant.rating > 0 ? (
                    <span className="flex items-center gap-1">
                      <Star size={16} className="text-warning fill-warning" />
                      {restaurant.rating}
                    </span>
                  ) : (
                    "New"
                  )
                }
              />
              <StatItem label="Total Orders" value={totalOrders.toLocaleString("en-IN")} />
              <StatItem label="Revenue" value={formatPrice(revenue)} />
              <StatItem
                label="Avg Order Value"
                value={avgOrderValue > 0 ? formatPrice(avgOrderValue) : "—"}
                sub={restaurant.createdAt ? `Since ${formatDate(restaurant.createdAt)}` : undefined}
              />
            </div>
          </Card>

          {/* Menu Overview */}
          <Card
            title="Menu Overview"
            icon={FileText}
            action={
              <Link
                href="#"
                className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
              >
                View full menu <ExternalLink size={11} />
              </Link>
            }
          >
            <p className="text-sm text-text-secondary mb-4">
              {totalMenuItems} items across {MENU_OVERVIEW.length} categories
            </p>
            <div className="space-y-2">
              {MENU_OVERVIEW.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(cat.items / totalMenuItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary w-14 text-right">
                      {cat.items} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card title="Recent Orders" icon={ShoppingBag}>
            <div className="space-y-0 divide-y divide-border-light">
              {orders.length === 0 ? (
                <p className="text-sm text-text-tertiary py-2">No recent orders</p>
              ) : (
                orders.map((order) => (
                  <div key={order._id || order.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{order._id || order.id}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.customer?.name || order.customer || "Customer"} · {formatDate(order.createdAt || order.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-primary">{formatPrice(order.total || order.totalAmount || 0)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Login Credentials */}
          <Card
            title="Login Credentials"
            icon={Key}
            action={
              <button
                onClick={() => setAddLoginOpen(true)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-[var(--radius-md)] bg-primary text-white hover:bg-primary-dark transition-colors font-medium cursor-pointer"
              >
                <Plus size={12} /> Add Login
              </button>
            }
          >
            {loginsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-text-tertiary" />
              </div>
            ) : logins.length === 0 ? (
              <p className="text-sm text-text-tertiary">No logins found</p>
            ) : (
              <div className="space-y-4">
                {logins.map((login) => {
                  const displayPwd = resetResult[login._id] || login.initialPassword;
                  const isVisible = visiblePasswords[login._id];
                  const isCopied = copiedId === login._id;
                  const isResetting = resettingId === login._id;
                  return (
                    <div key={login._id} className="p-3 rounded-[var(--radius-lg)] bg-bg-secondary border border-border-light space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{login.name || "—"}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--radius-full)] ${login.isOwner ? "bg-primary-50 text-primary" : "bg-bg-primary text-text-tertiary border border-border-default"}`}>
                            {login.isOwner ? "Primary Owner" : "Manager"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleImpersonate(login)}
                            disabled={impersonatingId === login._id}
                            title="Login as this user"
                            className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {impersonatingId === login._id ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
                          </button>
                          <button
                            onClick={() => handleResetPassword(login._id)}
                            disabled={isResetting}
                            title="Reset password"
                            className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:text-warning hover:bg-warning-light transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isResetting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} className="text-text-tertiary shrink-0" />
                          <span className="text-text-primary font-mono truncate">{login.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Key size={11} className="text-text-tertiary shrink-0" />
                          <span className="text-text-primary font-mono flex-1">
                            {isVisible ? displayPwd : "••••••••••"}
                          </span>
                          <button onClick={() => togglePasswordVisible(login._id)} className="text-text-tertiary hover:text-text-primary cursor-pointer">
                            {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button onClick={() => copyToClipboard(displayPwd, login._id)} className="text-text-tertiary hover:text-primary cursor-pointer">
                            {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                      {resetResult[login._id] && (
                        <p className="text-[10px] text-warning font-medium">⚠ New password — share with owner</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Owner Details */}
          <Card title="Owner Details" icon={null}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[var(--radius-full)] bg-primary-50 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {ownerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{ownerName}</p>
                  <span className="text-xs px-2 py-0.5 bg-bg-secondary text-text-secondary border border-border-default rounded-[var(--radius-full)] font-medium">
                    Restaurant Owner
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                {ownerEmail && (
                  <a
                    href={`mailto:${ownerEmail}`}
                    className="flex items-center gap-2.5 text-sm text-primary hover:underline"
                  >
                    <Mail size={14} className="text-text-tertiary shrink-0" />
                    {ownerEmail}
                  </a>
                )}
                {ownerPhone && (
                  <a
                    href={`tel:${ownerPhone}`}
                    className="flex items-center gap-2.5 text-sm text-text-primary hover:text-primary transition-colors"
                  >
                    <Phone size={14} className="text-text-tertiary shrink-0" />
                    {ownerPhone}
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card title="Documents" icon={FileText}>
            <DocRow label="FSSAI License" value={fssai} verified={restaurant.isVerified} />
            <DocRow label="GST Number" value={gst} verified={restaurant.isVerified} />
            <DocRow label="PAN Number" value={pan} verified={restaurant.isVerified} />
          </Card>

          {/* Commission */}
          <Card
            title="Commission & Payouts"
            icon={Percent}
            action={
              <button className="text-xs px-2.5 py-1 rounded-[var(--radius-md)] border border-border-default text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer font-medium">
                Edit
              </button>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Commission Rate</span>
                <span className="text-2xl font-bold text-primary">{restaurant.commission ?? "—"}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Payout Frequency</span>
                <span className="text-text-primary font-medium">Weekly</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border-light">
                <span className="text-text-secondary">Total Payout History</span>
                <span className="text-text-primary font-semibold">
                  {restaurant.commission != null && revenue > 0
                    ? formatPrice(Math.round(revenue * (1 - restaurant.commission / 100)))
                    : "—"}
                </span>
              </div>
            </div>
          </Card>

          {/* Activity Log */}
          <Card title="Activity Log" icon={Clock}>
            <div className="space-y-0 divide-y divide-border-light">
              {ACTIVITY_LOG.map((entry) => (
                <div key={entry.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-xs text-text-primary leading-relaxed">{entry.action}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-text-tertiary">{entry.user}</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-xs text-text-tertiary">{entry.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Login Modal */}
      <Modal
        isOpen={addLoginOpen}
        onClose={() => { setAddLoginOpen(false); setAddLoginError(""); }}
        title="Add New Login"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setAddLoginOpen(false); setAddLoginError(""); }}
              disabled={addLoginLoading}
              className="px-4 py-2 rounded-[var(--radius-lg)] border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-hover disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLogin}
              disabled={addLoginLoading || !addLoginForm.name || !addLoginForm.email}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
            >
              {addLoginLoading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : "Create Login"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Full Name *</label>
            <input
              type="text"
              value={addLoginForm.name}
              onChange={(e) => setAddLoginForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Manager name"
              className="w-full h-9 px-3 text-sm border border-border-light rounded-[var(--radius-lg)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email *</label>
            <input
              type="email"
              value={addLoginForm.email}
              onChange={(e) => setAddLoginForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="manager@restaurant.com"
              className="w-full h-9 px-3 text-sm border border-border-light rounded-[var(--radius-lg)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={addLoginForm.phone}
              onChange={(e) => setAddLoginForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit phone"
              className="w-full h-9 px-3 text-sm border border-border-light rounded-[var(--radius-lg)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <p className="text-[10px] text-text-tertiary mt-1">Password = last 4 digits + @Digi. No phone = random password.</p>
          </div>
          {addLoginError && (
            <p className="text-xs text-error bg-error-light px-3 py-2 rounded-[var(--radius-lg)]">{addLoginError}</p>
          )}
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !actionLoading && setModalOpen(false)}
        title={actionMeta.label}
        size="md"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-[var(--radius-lg)] border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-hover disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={actionLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-sm font-semibold disabled:opacity-70 transition-colors cursor-pointer shadow-[var(--shadow-sm)] ${actionMeta.color}`}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionMeta.icon && <actionMeta.icon size={14} />}
                  Confirm
                </>
              )}
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">{actionMeta.desc}</p>
        <div className="mt-3 p-3 bg-bg-secondary rounded-[var(--radius-lg)] border border-border-light">
          <p className="text-sm font-semibold text-text-primary">{restaurant.name}</p>
          <p className="text-xs text-text-secondary mt-0.5">{area ? `${area}, ` : ""}{city}</p>
        </div>
      </Modal>
    </div>
  );
}
