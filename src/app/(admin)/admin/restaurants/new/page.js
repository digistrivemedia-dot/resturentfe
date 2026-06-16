"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Loader2, MapPin, Save } from "lucide-react";
import useAdminRestaurantStore from "@/stores/adminRestaurantStore";

const CUISINES = [
  "North Indian", "South Indian", "Chinese", "Italian", "Pizza",
  "Burgers", "Biryani", "Seafood", "Continental", "Desserts",
];

const CITIES = ["Mumbai", "Pune", "Delhi", "Bengaluru", "Chennai", "Hyderabad"];

const STEPS = [
  { id: 1, label: "Owner Details" },
  { id: 2, label: "Restaurant Basics" },
  { id: 3, label: "Location" },
  { id: 4, label: "Documents" },
  { id: 5, label: "Bank Details" },
  { id: 6, label: "Commission" },
  { id: 7, label: "Review" },
];

const INITIAL_FORM = {
  // Step 1
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerRole: "restaurant_owner",
  // Step 2
  restaurantName: "",
  description: "",
  cuisines: [],
  categories: [],
  // Step 3
  addressLine: "",
  area: "",
  city: "",
  pincode: "",
  state: "",
  // Step 4
  fssai: "",
  fssaiExpiry: "",
  gst: "",
  pan: "",
  // Step 5
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  accountType: "Savings",
  // Step 6
  commission: 15,
  minOrder: 149,
  deliveryFee: 30,
  freeDeliveryAbove: 499,
  avgDeliveryTime: 35,
  deliveryRadius: 7,
};

function StepIndicator({ currentStep, completedSteps }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center min-w-max gap-0">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isLast = idx === STEPS.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-[var(--radius-full)] flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-success text-white"
                      : isActive
                      ? "bg-primary text-white shadow-[var(--shadow-sm)]"
                      : "bg-bg-secondary text-text-tertiary border border-border-default"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : step.id}
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-success-dark"
                      : "text-text-tertiary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 w-12 mx-1 mt-[-18px] transition-colors ${
                    isCompleted ? "bg-success" : "bg-border-default"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      {...rest}
    />
  );
}

function SelectInput({ value, onChange, children, ...rest }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-[var(--radius-lg)] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
      {...rest}
    >
      {children}
    </select>
  );
}

function UploadBox({ label }) {
  return (
    <div className="border-2 border-dashed border-border-default rounded-[var(--radius-lg)] p-4 text-center hover:border-primary transition-colors cursor-pointer">
      <p className="text-xs text-text-tertiary">
        Click to upload {label} (PDF, JPG, PNG)
      </p>
      <p className="text-xs text-text-tertiary mt-0.5 opacity-60">Max 5MB</p>
    </div>
  );
}

// ---- STEP CONTENT COMPONENTS ----

function Step1({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Owner Details</h2>
        <p className="text-sm text-text-secondary mt-0.5">Enter the restaurant owner's personal information</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Full Name" required>
          <TextInput value={form.ownerName} onChange={set("ownerName")} placeholder="e.g. Vikram Singh" />
        </FieldRow>
        <FieldRow label="Email Address" required>
          <TextInput type="email" value={form.ownerEmail} onChange={set("ownerEmail")} placeholder="owner@restaurant.com" />
        </FieldRow>
        <FieldRow label="Phone Number" required>
          <TextInput type="tel" value={form.ownerPhone} onChange={set("ownerPhone")} placeholder="10-digit mobile number" />
        </FieldRow>
        <FieldRow label="Role">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-bg-secondary border border-border-light rounded-[var(--radius-lg)]">
            <span className="text-sm text-text-secondary">Restaurant Owner</span>
            <span className="ml-auto text-xs px-2 py-0.5 bg-primary-50 text-primary rounded-[var(--radius-full)] font-medium">Auto-assigned</span>
          </div>
        </FieldRow>
      </div>
    </div>
  );
}

function Step2({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function toggleCuisine(c) {
    setForm((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c)
        ? f.cuisines.filter((x) => x !== c)
        : [...f.cuisines, c],
    }));
  }

  function toggleCategory(c) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter((x) => x !== c)
        : [...f.categories, c],
    }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Restaurant Basics</h2>
        <p className="text-sm text-text-secondary mt-0.5">Core information about the restaurant</p>
      </div>
      <FieldRow label="Restaurant Name" required>
        <TextInput value={form.restaurantName} onChange={set("restaurantName")} placeholder="e.g. Tandoori Nights" />
      </FieldRow>
      <FieldRow label="Description">
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Brief description of the restaurant..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm bg-bg-secondary border border-border-default rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
        />
      </FieldRow>
      <FieldRow label="Cuisines" required>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCuisine(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-full)] border transition-all cursor-pointer ${
                form.cuisines.includes(c)
                  ? "bg-primary text-white border-primary"
                  : "bg-bg-secondary text-text-secondary border-border-default hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {form.cuisines.length > 0 && (
          <p className="text-xs text-text-tertiary mt-1">{form.cuisines.length} selected</p>
        )}
      </FieldRow>
      <FieldRow label="Categories">
        <div className="flex flex-wrap gap-3">
          {["Veg", "Non-Veg", "Vegan"].map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.categories.includes(c)}
                onChange={() => toggleCategory(c)}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <span className="text-sm text-text-primary">{c}</span>
            </label>
          ))}
        </div>
      </FieldRow>
    </div>
  );
}

function Step3({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Location</h2>
        <p className="text-sm text-text-secondary mt-0.5">Restaurant address and delivery area</p>
      </div>
      <FieldRow label="Address Line" required>
        <TextInput value={form.addressLine} onChange={set("addressLine")} placeholder="Street address, building name..." />
      </FieldRow>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Area / Locality" required>
          <TextInput value={form.area} onChange={set("area")} placeholder="e.g. Andheri West" />
        </FieldRow>
        <FieldRow label="City" required>
          <SelectInput value={form.city} onChange={set("city")}>
            <option value="">Select city</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </SelectInput>
        </FieldRow>
        <FieldRow label="Pincode" required>
          <TextInput value={form.pincode} onChange={set("pincode")} placeholder="6-digit pincode" maxLength={6} />
        </FieldRow>
        <FieldRow label="State" required>
          <TextInput value={form.state} onChange={set("state")} placeholder="e.g. Maharashtra" />
        </FieldRow>
      </div>

      {/* Map placeholder */}
      <div className="rounded-[var(--radius-xl)] border border-border-default bg-bg-secondary overflow-hidden">
        <div className="h-48 flex items-center justify-center">
          <div className="text-center text-text-tertiary">
            <MapPin size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Map Preview</p>
            <p className="text-xs mt-0.5 opacity-70">Enter address above to see location on map</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
        <p className="text-sm text-text-secondary mt-0.5">Upload required regulatory documents</p>
      </div>

      {/* FSSAI */}
      <div className="p-4 bg-bg-secondary rounded-[var(--radius-xl)] border border-border-light space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">FSSAI License</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="FSSAI License Number" required>
            <TextInput value={form.fssai} onChange={set("fssai")} placeholder="14-digit license number" maxLength={14} />
          </FieldRow>
          <FieldRow label="Expiry Date" required>
            <TextInput type="date" value={form.fssaiExpiry} onChange={set("fssaiExpiry")} />
          </FieldRow>
        </div>
        <UploadBox label="FSSAI Certificate" />
      </div>

      {/* GST */}
      <div className="p-4 bg-bg-secondary rounded-[var(--radius-xl)] border border-border-light space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">GST Registration</h3>
        <FieldRow label="GST Number">
          <TextInput value={form.gst} onChange={set("gst")} placeholder="e.g. 27AABCT1332L1ZM" maxLength={15} />
        </FieldRow>
        <UploadBox label="GST Certificate" />
      </div>

      {/* PAN */}
      <div className="p-4 bg-bg-secondary rounded-[var(--radius-xl)] border border-border-light space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">PAN Card</h3>
        <FieldRow label="PAN Number" required>
          <TextInput value={form.pan} onChange={set("pan")} placeholder="e.g. AABCT1332L" maxLength={10} />
        </FieldRow>
        <UploadBox label="PAN Card" />
      </div>
    </div>
  );
}

function Step5({ form, setForm }) {
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Bank Details</h2>
        <p className="text-sm text-text-secondary mt-0.5">For commission payouts and settlements</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Account Holder Name" required>
          <TextInput value={form.accountHolder} onChange={set("accountHolder")} placeholder="As per bank records" />
        </FieldRow>
        <FieldRow label="Bank Name" required>
          <TextInput value={form.bankName} onChange={set("bankName")} placeholder="e.g. HDFC Bank" />
        </FieldRow>
        <FieldRow label="Account Number" required>
          <TextInput value={form.accountNumber} onChange={set("accountNumber")} placeholder="Bank account number" />
        </FieldRow>
        <FieldRow label="IFSC Code" required>
          <TextInput value={form.ifsc} onChange={set("ifsc")} placeholder="e.g. HDFC0001234" maxLength={11} />
        </FieldRow>
        <FieldRow label="Account Type" required>
          <SelectInput value={form.accountType} onChange={set("accountType")}>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
          </SelectInput>
        </FieldRow>
      </div>
    </div>
  );
}

function Step6({ form, setForm }) {
  const setNum = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setInput = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  function Stepper({ label, value, onChange, min, max, unit = "" }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="w-9 h-9 rounded-[var(--radius-md)] border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover transition-colors font-bold text-lg flex items-center justify-center cursor-pointer"
          >
            −
          </button>
          <span className="w-16 text-center text-sm font-semibold text-text-primary">
            {unit}{value}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            className="w-9 h-9 rounded-[var(--radius-md)] border border-border-default bg-bg-secondary text-text-primary hover:bg-bg-hover transition-colors font-bold text-lg flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Commission & Settings</h2>
        <p className="text-sm text-text-secondary mt-0.5">Platform fee and delivery configuration</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Stepper label="Commission Rate (%)" value={form.commission} onChange={setNum("commission")} min={5} max={30} />
        <Stepper label="Avg Delivery Time (mins)" value={form.avgDeliveryTime} onChange={setNum("avgDeliveryTime")} min={10} max={120} />
        <Stepper label="Delivery Radius (km)" value={form.deliveryRadius} onChange={setNum("deliveryRadius")} min={1} max={50} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Minimum Order (₹)">
          <TextInput type="number" value={form.minOrder} onChange={setInput("minOrder")} placeholder="e.g. 149" min={0} />
        </FieldRow>
        <FieldRow label="Delivery Fee (₹)">
          <TextInput type="number" value={form.deliveryFee} onChange={setInput("deliveryFee")} placeholder="e.g. 30" min={0} />
        </FieldRow>
        <FieldRow label="Free Delivery Above (₹)">
          <TextInput type="number" value={form.freeDeliveryAbove} onChange={setInput("freeDeliveryAbove")} placeholder="e.g. 499" min={0} />
        </FieldRow>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-border-light last:border-0">
      <span className="text-sm text-text-secondary shrink-0 w-36">{label}</span>
      <span className="text-sm text-text-primary font-medium text-right">{value || <span className="text-text-tertiary italic">Not provided</span>}</span>
    </div>
  );
}

function Step7({ form }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Review & Submit</h2>
        <p className="text-sm text-text-secondary mt-0.5">Verify all details before submitting for review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Owner Details</h3>
          <ReviewRow label="Full Name" value={form.ownerName} />
          <ReviewRow label="Email" value={form.ownerEmail} />
          <ReviewRow label="Phone" value={form.ownerPhone} />
          <ReviewRow label="Role" value="Restaurant Owner" />
        </div>

        {/* Restaurant */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Restaurant Basics</h3>
          <ReviewRow label="Name" value={form.restaurantName} />
          <ReviewRow label="Description" value={form.description} />
          <ReviewRow label="Cuisines" value={form.cuisines.join(", ")} />
          <ReviewRow label="Categories" value={form.categories.join(", ")} />
        </div>

        {/* Location */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Location</h3>
          <ReviewRow label="Address" value={form.addressLine} />
          <ReviewRow label="Area" value={form.area} />
          <ReviewRow label="City" value={form.city} />
          <ReviewRow label="Pincode" value={form.pincode} />
          <ReviewRow label="State" value={form.state} />
        </div>

        {/* Documents */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Documents</h3>
          <ReviewRow label="FSSAI" value={form.fssai} />
          <ReviewRow label="FSSAI Expiry" value={form.fssaiExpiry} />
          <ReviewRow label="GST" value={form.gst} />
          <ReviewRow label="PAN" value={form.pan} />
        </div>

        {/* Bank */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Bank Details</h3>
          <ReviewRow label="Account Holder" value={form.accountHolder} />
          <ReviewRow label="Bank" value={form.bankName} />
          <ReviewRow label="Account No." value={form.accountNumber} />
          <ReviewRow label="IFSC" value={form.ifsc} />
          <ReviewRow label="Account Type" value={form.accountType} />
        </div>

        {/* Commission */}
        <div className="bg-bg-secondary rounded-[var(--radius-xl)] p-4 border border-border-light">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wide mb-3">Commission & Settings</h3>
          <ReviewRow label="Commission" value={`${form.commission}%`} />
          <ReviewRow label="Min Order" value={`₹${form.minOrder}`} />
          <ReviewRow label="Delivery Fee" value={`₹${form.deliveryFee}`} />
          <ReviewRow label="Free Delivery" value={`Above ₹${form.freeDeliveryAbove}`} />
          <ReviewRow label="Avg Delivery" value={`${form.avgDeliveryTime} mins`} />
          <ReviewRow label="Delivery Radius" value={`${form.deliveryRadius} km`} />
        </div>
      </div>
    </div>
  );
}

export default function OnboardRestaurantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const { isSaving, onboardRestaurant } = useAdminRestaurantStore();

  function goNext() {
    if (step < 7) {
      setCompletedSteps((prev) => prev.includes(step) ? prev : [...prev, step]);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleSubmit() {
    const payload = {
      owner: {
        name: form.ownerName,
        email: form.ownerEmail,
        phone: form.ownerPhone,
        role: form.ownerRole,
      },
      name: form.restaurantName,
      description: form.description,
      cuisines: form.cuisines,
      categories: form.categories,
      address: {
        line: form.addressLine,
        area: form.area,
        city: form.city,
        pincode: form.pincode,
        state: form.state,
      },
      documents: {
        fssai: form.fssai,
        fssaiExpiry: form.fssaiExpiry,
        gst: form.gst,
        pan: form.pan,
      },
      bank: {
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        accountType: form.accountType,
      },
      commission: form.commission,
      minOrder: form.minOrder,
      deliveryFee: form.deliveryFee,
      freeDeliveryAbove: form.freeDeliveryAbove,
      avgDeliveryTime: form.avgDeliveryTime,
      deliveryRadius: form.deliveryRadius,
    };

    try {
      await onboardRestaurant(payload);
      router.push("/admin/restaurants");
    } catch (err) {
      console.error("Failed to onboard restaurant:", err);
      alert("Failed to submit restaurant. Please try again.");
    }
  }

  function handleSaveDraft() {
    alert("Saved as draft");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Onboard New Restaurant</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Complete all steps to add a new restaurant partner
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-5">
        <StepIndicator currentStep={step} completedSteps={completedSteps} />
      </div>

      {/* Form Card */}
      <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-6">
        {step === 1 && <Step1 form={form} setForm={setForm} />}
        {step === 2 && <Step2 form={form} setForm={setForm} />}
        {step === 3 && <Step3 form={form} setForm={setForm} />}
        {step === 4 && <Step4 form={form} setForm={setForm} />}
        {step === 5 && <Step5 form={form} setForm={setForm} />}
        {step === 6 && <Step6 form={form} setForm={setForm} />}
        {step === 7 && <Step7 form={form} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] border border-border-default text-text-secondary text-sm font-semibold hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          {step >= 2 && (
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] border border-border-default text-text-secondary text-sm font-medium hover:bg-bg-hover transition-colors cursor-pointer"
            >
              <Save size={15} />
              Save as Draft
            </button>
          )}
        </div>

        {step < 7 ? (
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-lg)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-[var(--shadow-sm)] cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} />
                Submit for Review
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
