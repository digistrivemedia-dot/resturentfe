"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, MapPin, Home, Briefcase, Navigation, Loader2, CheckCircle2 } from "lucide-react";
import useLocationStore from "@/stores/locationStore";

const LABEL_OPTIONS = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];

function AddAddressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/checkout";
  const { addAddress } = useLocationStore();

  const [form, setForm] = useState({
    flatNo: "",
    area: "",
    landmark: "",
    label: "home",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);

  const detectLocation = () => {
    setDetecting(true);
    navigator.geolocation?.getCurrentPosition(
      () => {
        setForm((f) => ({ ...f, area: "Andheri West, Mumbai" }));
        setDetecting(false);
        setDetected(true);
      },
      () => {
        setDetecting(false);
        alert("Could not detect location.");
      }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.flatNo.trim()) e.flatNo = "House/Flat number is required";
    if (!form.area.trim()) e.area = "Area is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const newAddress = {
      _id: `addr_${Date.now()}`,
      label: form.label,
      fullAddress: `${form.flatNo}, ${form.area}${form.landmark ? ", " + form.landmark : ""}`,
      landmark: form.landmark,
      area: form.area.split(",")[0].trim(),
      city: "Mumbai",
      lat: 19.1197,
      lng: 72.8464,
      isDefault: form.isDefault,
    };
    addAddress(newAddress);
    setLoading(false);
    router.push(redirectTo);
  };

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <div className="py-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-text-primary">Add New Address</h1>
      </div>

      {/* Map placeholder */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-[var(--radius-xl)] h-44 mb-5 overflow-hidden border border-border-light flex items-center justify-center">
        <div className="text-center">
          <MapPin size={32} className="text-primary mx-auto mb-2" />
          <p className="text-sm font-medium text-text-secondary">Map view</p>
          <p className="text-xs text-text-tertiary">(Google Maps integrates here)</p>
        </div>
        {/* Detect GPS button */}
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-2 rounded-[var(--radius-full)] shadow-[var(--shadow-md)] hover:bg-primary-50 transition-colors border border-border-light"
        >
          {detecting
            ? <Loader2 size={13} className="animate-spin" />
            : detected
              ? <CheckCircle2 size={13} className="text-success" />
              : <Navigation size={13} />
          }
          {detecting ? "Detecting…" : detected ? "Located!" : "Use GPS"}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Label selector */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Save as</label>
          <div className="flex gap-2">
            {LABEL_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("label", value)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-sm font-semibold rounded-[var(--radius-lg)] border-2 transition-all ${
                  form.label === value
                    ? "border-primary bg-primary-50 text-primary"
                    : "border-border-light text-text-secondary hover:border-border-default"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Flat/House no */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            House / Flat / Office No. <span className="text-error">*</span>
          </label>
          <input
            value={form.flatNo}
            onChange={(e) => set("flatNo", e.target.value)}
            placeholder="e.g. B-204, 3rd Floor"
            className={`w-full h-11 px-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 transition-colors
              ${errors.flatNo ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"}`}
          />
          {errors.flatNo && <p className="text-xs text-error mt-1">{errors.flatNo}</p>}
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Area / Street <span className="text-error">*</span>
          </label>
          <input
            value={form.area}
            onChange={(e) => set("area", e.target.value)}
            placeholder="e.g. Andheri West, Mumbai"
            className={`w-full h-11 px-4 text-sm border rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 transition-colors
              ${errors.area ? "border-error focus:ring-error/20" : "border-border-light hover:border-border-default focus:border-primary focus:ring-primary/20"}`}
          />
          {errors.area && <p className="text-xs text-error mt-1">{errors.area}</p>}
        </div>

        {/* Landmark */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Landmark <span className="text-text-tertiary text-xs font-normal">(optional)</span>
          </label>
          <input
            value={form.landmark}
            onChange={(e) => set("landmark", e.target.value)}
            placeholder="e.g. Near Metro Station"
            className="w-full h-11 px-4 text-sm border border-border-light rounded-[var(--radius-lg)] bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Default */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set("isDefault", !form.isDefault)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              form.isDefault ? "bg-primary border-primary" : "border-border-default hover:border-primary"
            }`}
          >
            {form.isDefault && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-text-primary">Set as default address</span>
        </label>

        {/* Save */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-white font-bold rounded-[var(--radius-xl)] flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : "Save Address"}
        </button>
      </form>
    </div>
  );
}

export default function AddAddressPage() {
  return <Suspense><AddAddressContent /></Suspense>;
}
