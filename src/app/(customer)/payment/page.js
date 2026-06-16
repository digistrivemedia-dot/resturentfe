"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, CreditCard, Smartphone, Banknote,
  Wallet, ChevronRight, Loader2, Lock, CheckCircle2,
} from "lucide-react";

const UPI_APPS = [
  { id: "gpay", label: "Google Pay", emoji: "🟢", color: "bg-green-50 border-green-200" },
  { id: "phonepe", label: "PhonePe", emoji: "🟣", color: "bg-purple-50 border-purple-200" },
  { id: "paytm", label: "Paytm", emoji: "🔵", color: "bg-blue-50 border-blue-200" },
  { id: "bhim", label: "BHIM UPI", emoji: "🟠", color: "bg-orange-50 border-orange-200" },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const orderRef = searchParams.get("ref") || "ORD-20260606-042";

  const [method, setMethod] = useState("upi"); // upi | card | netbanking | wallet
  const [upiApp, setUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [stage, setStage] = useState("idle"); // idle | processing | verifying | success | failed

  const handlePay = async () => {
    setStage("processing");
    await new Promise((r) => setTimeout(r, 1200));
    setStage("verifying");
    await new Promise((r) => setTimeout(r, 1000));
    setStage("success");
    await new Promise((r) => setTimeout(r, 800));
    router.push(`/order/confirmed?orderNumber=${orderRef}`);
  };

  if (stage === "processing" || stage === "verifying") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-primary-50 flex items-center justify-center">
            {stage === "verifying" ? (
              <ShieldCheck size={28} className="text-primary" />
            ) : (
              <Smartphone size={28} className="text-primary" />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-1">
            {stage === "processing" ? "Processing Payment…" : "Verifying Transaction…"}
          </h2>
          <p className="text-sm text-text-secondary">
            {stage === "processing"
              ? "Please wait while we connect to your payment app"
              : "Checking payment status with bank"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-tertiary bg-bg-secondary px-4 py-2 rounded-[var(--radius-full)]">
          <Lock size={12} className="text-success" />
          256-bit SSL encrypted
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 max-w-lg mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Payment</h1>
          <p className="text-xs text-text-tertiary">{orderRef}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-success font-semibold bg-success-light px-3 py-1.5 rounded-[var(--radius-full)]">
          <ShieldCheck size={12} /> Secure
        </div>
      </div>

      {/* Amount card */}
      <div className="bg-primary rounded-[var(--radius-xl)] px-5 py-4 text-white flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">Total Amount</p>
          <p className="text-3xl font-black mt-0.5">₹{amount}</p>
        </div>
        <div className="text-right text-xs text-white/60">
          <p>Order ref</p>
          <p className="font-mono font-semibold text-white/90">{orderRef}</p>
        </div>
      </div>

      {/* Method tabs */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-border-light overflow-hidden">
        <div className="grid grid-cols-4 border-b border-border-light">
          {[
            { id: "upi", label: "UPI", icon: Smartphone },
            { id: "card", label: "Card", icon: CreditCard },
            { id: "netbanking", label: "Net Banking", icon: Banknote },
            { id: "wallet", label: "Wallet", icon: Wallet },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMethod(id)}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                method === id
                  ? "text-primary border-primary bg-primary-50"
                  : "text-text-tertiary border-transparent hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <Icon size={16} />
              <span className="leading-none">{label}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {/* UPI */}
          {method === "upi" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                  Choose UPI App
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setUpiApp(app.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-[var(--radius-lg)] border-2 transition-all text-left ${
                        upiApp === app.id
                          ? "border-primary bg-primary-50"
                          : `${app.color} hover:border-border-default`
                      }`}
                    >
                      <span className="text-xl">{app.emoji}</span>
                      <span className="text-sm font-semibold text-text-primary">{app.label}</span>
                      {upiApp === app.id && (
                        <CheckCircle2 size={14} className="text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border-light" />
                <span className="text-xs text-text-tertiary">or enter UPI ID</span>
                <div className="flex-1 h-px bg-border-light" />
              </div>

              <div>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
                <p className="text-xs text-text-tertiary mt-1.5">e.g. 9876543210@ybl or name@oksbi</p>
              </div>
            </div>
          )}

          {/* Card */}
          {method === "card" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Card Number</label>
                <input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Expiry</label>
                  <input
                    placeholder="MM / YY"
                    maxLength={7}
                    className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1.5">CVV</label>
                  <input
                    placeholder="•••"
                    maxLength={4}
                    type="password"
                    className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">Name on Card</label>
                <input
                  placeholder="John Doe"
                  className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                />
              </div>
              <p className="text-[10px] text-text-tertiary flex items-center gap-1">
                <Lock size={10} /> Your card data is encrypted and never stored on our servers
              </p>
            </div>
          )}

          {/* Net Banking */}
          {method === "netbanking" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Popular Banks</p>
              {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra"].map((bank) => (
                <label key={bank} className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-border-light hover:border-primary hover:bg-primary-50 cursor-pointer transition-all">
                  <input type="radio" name="bank" className="text-primary accent-primary" />
                  <span className="text-sm font-medium text-text-primary">{bank}</span>
                </label>
              ))}
              <button className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 mt-1">
                View all banks <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Wallet */}
          {method === "wallet" && (
            <div className="space-y-3">
              <div className="bg-success-light rounded-[var(--radius-lg)] px-4 py-3 flex items-center gap-3">
                <Wallet size={18} className="text-success" />
                <div>
                  <p className="text-sm font-bold text-success">Wallet Balance: ₹150.00</p>
                  <p className="text-xs text-success-dark/70">Available for use</p>
                </div>
              </div>
              {parseFloat(amount) > 150 && (
                <div className="bg-warning-light rounded-[var(--radius-lg)] px-4 py-3 text-xs text-warning-dark">
                  ⚠️ Insufficient wallet balance. Remaining ₹{(parseFloat(amount) - 150).toFixed(0)} will be charged via UPI/Card.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Razorpay note */}
      <div className="bg-bg-secondary rounded-[var(--radius-xl)] border border-border-light px-4 py-3 flex items-start gap-2.5">
        <span className="text-base mt-0.5">ℹ️</span>
        <p className="text-xs text-text-secondary leading-relaxed">
          <span className="font-semibold text-text-primary">Razorpay integration</span> will be connected here.
          This UI is a placeholder — the actual payment gateway will handle all transactions securely.
        </p>
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-5 text-xs text-text-tertiary">
        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-success" /> PCI DSS</span>
        <span className="flex items-center gap-1"><Lock size={12} className="text-success" /> SSL Secured</span>
        <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-success" /> RBI Compliant</span>
      </div>

      {/* Pay CTA */}
      <div className="sticky bottom-[var(--bottom-nav-height)] md:bottom-4 -mx-4 px-4 pb-2 pt-1 bg-bg-primary/80 backdrop-blur-sm">
        <button
          onClick={handlePay}
          disabled={stage !== "idle"}
          className="w-full h-14 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-between px-5 hover:bg-primary-dark transition-colors disabled:opacity-60 shadow-[var(--shadow-lg)]"
        >
          <div className="text-left">
            <div className="text-xs text-white/80">Paying via {method.toUpperCase()}</div>
            <div className="text-base font-extrabold">Pay Now</div>
          </div>
          <div className="flex items-center gap-2">
            {stage !== "idle" ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <span className="text-base font-extrabold">₹{amount}</span>
                <ChevronRight size={20} />
              </>
            )}
          </div>
        </button>
        <p className="text-center text-[11px] text-text-tertiary mt-2">
          By paying, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentContent />
    </Suspense>
  );
}
