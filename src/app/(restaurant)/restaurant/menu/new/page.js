"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Camera,
  Minus,
  ArrowLeft,
} from "lucide-react";
import useMenuManagementStore from "@/stores/menuManagementStore";
import { Spinner, VegBadge } from "@/components/ui";
import useImageUpload from "@/hooks/useImageUpload";

// ─── Constants ───────────────────────────────────────────────────────────────

const SPICE_OPTIONS = [
  { value: "none", label: "None", emoji: "" },
  { value: "mild", label: "Mild", emoji: "🌶️" },
  { value: "medium", label: "Medium", emoji: "🌶️🌶️" },
  { value: "hot", label: "Hot", emoji: "🌶️🌶️🌶️" },
  { value: "extra_hot", label: "Extra Hot", emoji: "🌶️🌶️🌶️🌶️" },
];

const TAG_OPTIONS = [
  { value: "bestseller", label: "Bestseller" },
  { value: "new", label: "New" },
  { value: "chef_special", label: "Chef Special" },
];

const TAG_PILL_COLORS = {
  bestseller: {
    active: "bg-warning text-white",
    inactive: "bg-warning-light text-warning-dark border border-warning-light",
  },
  new: {
    active: "bg-success text-white",
    inactive: "bg-success-light text-success-dark border border-success-light",
  },
  chef_special: {
    active: "bg-primary text-white",
    inactive: "bg-primary-50 text-primary border border-primary-50",
  },
};

const FOOD_EMOJIS = {
  Starters: "🍢",
  "Main Course": "🍛",
  Biryani: "🍚",
  Breads: "🫓",
  Beverages: "🥤",
  Desserts: "🍮",
  Other: "🍽️",
};

const DEFAULT_FORM = {
  name: "",
  description: "",
  category: "",
  price: "",
  discountedPrice: "",
  isVeg: true,
  spiceLevel: "none",
  preparationTime: 15,
  tags: [],
  image: null,
  imagePreview: null,
  variants: [],
  addonGroups: [],
  nutritionalInfo: {
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, className = "" }) {
  return (
    <div
      className={`bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-5 ${className}`}
    >
      <h2 className="text-base font-semibold text-text-primary mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
      >
        <span className="text-base font-semibold text-text-primary">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-text-tertiary" />
        ) : (
          <ChevronDown size={18} className="text-text-tertiary" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-medium text-text-primary mb-1.5">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, prefix, type = "text", required, ...rest }) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-text-tertiary text-sm font-medium pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full py-2.5 pr-3 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${
          prefix ? "pl-7" : "pl-3"
        }`}
        {...rest}
      />
    </div>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────────

function PreviewCard({ form }) {
  const savings =
    form.price && form.discountedPrice
      ? Number(form.price) - Number(form.discountedPrice)
      : null;

  const emoji = FOOD_EMOJIS[form.category] || "🍽️";

  return (
    <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light overflow-hidden shadow-[var(--shadow-md)]">
      {/* Image area */}
      <div
        className={`h-36 flex items-center justify-center text-5xl ${
          form.isVeg ? "bg-success-light" : "bg-error-light"
        }`}
      >
        {form.imagePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imagePreview}
            alt="preview"
            className="w-full h-full object-cover"
          />
        ) : (
          emoji
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text-primary text-sm leading-tight">
              {form.name || (
                <span className="text-text-tertiary">Item Name</span>
              )}
            </p>
            <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
              {form.description || "Your item description will appear here..."}
            </p>
          </div>
          <VegBadge isVeg={form.isVeg} />
        </div>

        {/* Tags */}
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.tags.map((tag) => {
              const tagOpt = TAG_OPTIONS.find((t) => t.value === tag);
              const colors = TAG_PILL_COLORS[tag];
              return (
                <span
                  key={tag}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-[var(--radius-full)] ${colors?.active || "bg-bg-secondary text-text-secondary"}`}
                >
                  {tagOpt?.label || tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          {form.discountedPrice && form.price ? (
            <>
              <span className="text-base font-bold text-text-primary">
                ₹{form.discountedPrice}
              </span>
              <span className="text-xs text-text-tertiary line-through">
                ₹{form.price}
              </span>
            </>
          ) : form.price ? (
            <span className="text-base font-bold text-text-primary">
              ₹{form.price}
            </span>
          ) : (
            <span className="text-base font-bold text-text-tertiary">
              ₹ --
            </span>
          )}
          {savings && savings > 0 && (
            <span className="text-[10px] font-semibold text-success bg-success-light px-1.5 py-0.5 rounded-[var(--radius-full)]">
              Save ₹{savings}
            </span>
          )}
        </div>

        {/* ADD Button */}
        <button
          type="button"
          className="mt-3 w-full py-2 text-sm font-semibold text-primary border-2 border-primary rounded-[var(--radius-lg)] hover:bg-primary-50 transition-colors cursor-default"
          tabIndex={-1}
        >
          ADD
        </button>
      </div>

      <div className="px-4 py-2 border-t border-border-light bg-bg-secondary">
        <p className="text-[10px] font-semibold text-text-tertiary text-center uppercase tracking-wider">
          Customer Preview
        </p>
      </div>
    </div>
  );
}

// ─── Inner form (uses useSearchParams) ───────────────────────────────────────

function MenuItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    categories,
    addonGroups,
    isSaving,
    fetchMenu,
    fetchCategories,
    fetchAddons,
    getAllItems,
    addMenuItem,
    updateMenuItem,
  } = useMenuManagementStore();

  const [form, setForm] = useState(DEFAULT_FORM);
  const fileInputRef = useRef(null);

  const { upload, isUploading, progress, error: uploadError } = useImageUpload({
    type: "menu-item",
    onSuccess: (result) => {
      setForm((prev) => ({ ...prev, image: result.url, imagePreview: result.url }));
    },
  });

  // Load menu, categories, and addon groups on mount
  useEffect(() => {
    fetchMenu().catch(() => {});
    fetchCategories().catch(() => {});
    fetchAddons().catch(() => {});
  }, []);

  // Pre-populate on edit
  useEffect(() => {
    if (!editId) return;
    const allItems = getAllItems();
    const existing = allItems.find((i) => i._id === editId);
    if (!existing) return;
    setForm({
      name: existing.name || "",
      description: existing.description || "",
      category: existing.category || "",
      price: existing.price ? String(existing.price) : "",
      discountedPrice: existing.discountedPrice
        ? String(existing.discountedPrice)
        : "",
      isVeg: existing.isVeg ?? true,
      spiceLevel: existing.spiceLevel || "none",
      preparationTime: existing.preparationTime || 15,
      tags: existing.tags || [],
      image: existing.image || null,
      imagePreview: existing.image || null,
      variants: existing.variants
        ? existing.variants.map((v) => ({
            id: v._id || Math.random().toString(36).slice(2),
            name: v.name,
            price: String(v.price),
          }))
        : [],
      addonGroups: existing.addonGroups
        ? existing.addonGroups.map((ag) => ag._id)
        : [],
      nutritionalInfo: {
        calories: existing.nutritionalInfo?.calories ?? "",
        protein: existing.nutritionalInfo?.protein ?? "",
        carbs: existing.nutritionalInfo?.carbs ?? "",
        fat: existing.nutritionalInfo?.fat ?? "",
      },
    });
  }, [editId]);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function toggleAddonGroup(id) {
    setForm((prev) => ({
      ...prev,
      addonGroups: prev.addonGroups.includes(id)
        ? prev.addonGroups.filter((g) => g !== id)
        : [...prev.addonGroups, id],
    }));
  }

  function adjustPrepTime(delta) {
    setForm((prev) => {
      const next = prev.preparationTime + delta;
      if (next < 5 || next > 60) return prev;
      return { ...prev, preparationTime: next };
    });
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show a local object URL immediately as a preview while uploading
    const localPreview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imagePreview: localPreview }));
    try {
      const result = await upload(file);
      if (result) {
        // Replace local preview with the Cloudinary URL
        URL.revokeObjectURL(localPreview);
        setForm((prev) => ({ ...prev, image: result.url, imagePreview: result.url }));
      }
    } catch {
      // uploadError state is set by the hook
    }
  }

  // Variants
  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: Math.random().toString(36).slice(2), name: "", price: "" },
      ],
    }));
  }

  function updateVariant(id, field, value) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      ),
    }));
  }

  function removeVariant(id) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  }

  function setNutrition(field, value) {
    setForm((prev) => ({
      ...prev,
      nutritionalInfo: { ...prev.nutritionalInfo, [field]: value },
    }));
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
      isVeg: form.isVeg,
      spiceLevel: form.spiceLevel,
      preparationTime: form.preparationTime,
      tags: form.tags,
      image: form.image || undefined,
      variants: form.variants.map((v) => ({ name: v.name, price: Number(v.price) })),
      addonGroups: form.addonGroups,
      nutritionalInfo: {
        calories: form.nutritionalInfo.calories ? Number(form.nutritionalInfo.calories) : undefined,
        protein: form.nutritionalInfo.protein ? Number(form.nutritionalInfo.protein) : undefined,
        carbs: form.nutritionalInfo.carbs ? Number(form.nutritionalInfo.carbs) : undefined,
        fat: form.nutritionalInfo.fat ? Number(form.nutritionalInfo.fat) : undefined,
      },
    };
  }

  // Save handlers
  async function doSave() {
    if (!form.name.trim() || !form.price) {
      alert("Name and Price are required.");
      return false;
    }
    try {
      const payload = buildPayload();
      if (editId) {
        await updateMenuItem(editId, payload);
      } else {
        await addMenuItem(payload);
      }
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    const ok = await doSave();
    if (!ok) return;
    router.push("/restaurant/menu");
  }

  async function handleSaveAndAddAnother() {
    const ok = await doSave();
    if (!ok) return;
    setForm(DEFAULT_FORM);
  }

  const savingsBadge =
    form.price && form.discountedPrice
      ? Number(form.price) - Number(form.discountedPrice)
      : null;

  return (
    <div className="min-h-screen bg-bg-secondary pb-24">
      {/* Page Header */}
      <div className="bg-bg-primary border-b border-border-light px-4 py-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-hover rounded-[var(--radius-md)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {editId ? "Edit Menu Item" : "Add New Item"}
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              {editId
                ? "Update item details"
                : "Add a new dish to your menu"}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-5">
            {/* Section 1: Basic Info */}
            <Section title="Basic Information">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <FieldLabel required>Item Name</FieldLabel>
                  <TextInput
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="e.g. Paneer Tikka"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Describe this dish..."
                    className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <FieldLabel>Category</FieldLabel>
                  <select
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="Other">Other / New</option>
                  </select>
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Price</FieldLabel>
                    <TextInput
                      type="number"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                      placeholder="0"
                      prefix="₹"
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel>Discounted Price</FieldLabel>
                    <TextInput
                      type="number"
                      value={form.discountedPrice}
                      onChange={(e) =>
                        setField("discountedPrice", e.target.value)
                      }
                      placeholder="0"
                      prefix="₹"
                      min={0}
                    />
                    {savingsBadge && savingsBadge > 0 && (
                      <p className="text-xs text-success mt-1 font-medium">
                        Save ₹{savingsBadge} for customers
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 2: Type & Attributes */}
            <Section title="Type &amp; Attributes">
              <div className="flex flex-col gap-5">
                {/* Veg / Non-Veg */}
                <div>
                  <FieldLabel>Food Type</FieldLabel>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setField("isVeg", true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-full)] border-2 text-sm font-semibold transition-colors cursor-pointer ${
                        form.isVeg
                          ? "border-veg bg-success-light text-veg"
                          : "border-border-light text-text-tertiary hover:bg-bg-hover"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 ${
                          form.isVeg
                            ? "border-veg bg-veg"
                            : "border-text-tertiary"
                        }`}
                      />
                      Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setField("isVeg", false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-full)] border-2 text-sm font-semibold transition-colors cursor-pointer ${
                        !form.isVeg
                          ? "border-non-veg bg-error-light text-non-veg"
                          : "border-border-light text-text-tertiary hover:bg-bg-hover"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 ${
                          !form.isVeg
                            ? "border-non-veg bg-non-veg"
                            : "border-text-tertiary"
                        }`}
                      />
                      Non-Veg
                    </button>
                  </div>
                </div>

                {/* Spice Level */}
                <div>
                  <FieldLabel>Spice Level</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {SPICE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setField("spiceLevel", opt.value)}
                        className={`px-3 py-1.5 rounded-[var(--radius-full)] text-sm font-medium border transition-colors cursor-pointer ${
                          form.spiceLevel === opt.value
                            ? "bg-primary text-white border-primary"
                            : "bg-bg-secondary text-text-secondary border-border-light hover:bg-bg-hover"
                        }`}
                      >
                        {opt.emoji && (
                          <span className="mr-1">{opt.emoji}</span>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prep Time */}
                <div>
                  <FieldLabel>Preparation Time</FieldLabel>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => adjustPrepTime(-5)}
                      disabled={form.preparationTime <= 5}
                      className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] border border-border-light bg-bg-secondary text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold text-text-primary w-20 text-center">
                      {form.preparationTime} mins
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPrepTime(5)}
                      disabled={form.preparationTime >= 60}
                      className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] border border-border-light bg-bg-secondary text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const active = form.tags.includes(tag.value);
                      const colors = TAG_PILL_COLORS[tag.value];
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => toggleTag(tag.value)}
                          className={`px-4 py-1.5 rounded-[var(--radius-full)] text-sm font-medium transition-colors cursor-pointer ${
                            active
                              ? colors?.active || "bg-primary text-white"
                              : colors?.inactive ||
                                "bg-bg-secondary text-text-secondary border border-border-light"
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 3: Image Upload */}
            <Section title="Item Photo">
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-border-default rounded-[var(--radius-xl)] flex flex-col items-center justify-center py-8 px-4 transition-colors ${
                  isUploading
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:border-primary hover:bg-primary-50/30"
                }`}
              >
                {form.imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imagePreview}
                    alt="Selected"
                    className="h-32 w-auto rounded-[var(--radius-lg)] object-cover"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-[var(--radius-full)] bg-bg-secondary flex items-center justify-center mb-3">
                      <Camera size={22} className="text-text-tertiary" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      Upload Photo
                    </p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Click to browse — JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </div>

              {/* Upload progress bar */}
              {isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary font-medium">Uploading…</span>
                    <span className="text-xs text-text-tertiary">{progress}%</span>
                  </div>
                  <div className="w-full bg-bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload error */}
              {uploadError && (
                <p className="mt-2 text-xs text-error font-medium">
                  Upload failed: {uploadError}. Click to try again.
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {form.imagePreview && !isUploading && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, image: null, imagePreview: null }));
                  }}
                  className="mt-2 text-xs text-error hover:underline cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </Section>

            {/* Section 4: Variants */}
            <CollapsibleSection
              title="Variants"
              defaultOpen={form.variants.length > 0}
            >
              <p className="text-xs text-text-tertiary mb-3">
                Add variants like Half / Full, Small / Large. Customers can
                choose one variant when ordering.
              </p>
              {form.variants.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_120px_40px] gap-2 px-1">
                    <span className="text-xs font-medium text-text-tertiary">
                      Name
                    </span>
                    <span className="text-xs font-medium text-text-tertiary">
                      Price (₹)
                    </span>
                    <span />
                  </div>
                  {form.variants.map((v) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-[1fr_120px_40px] gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) =>
                          updateVariant(v.id, "name", e.target.value)
                        }
                        placeholder="e.g. Half"
                        className="px-3 py-2 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(v.id, "price", e.target.value)
                        }
                        placeholder="0"
                        min={0}
                        className="px-3 py-2 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error-light rounded-[var(--radius-md)] transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-50 rounded-[var(--radius-lg)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Plus size={15} />
                Add Variant
              </button>
            </CollapsibleSection>

            {/* Section 5: Addon Groups */}
            <CollapsibleSection title="Addon Groups" defaultOpen={false}>
              <p className="text-xs text-text-tertiary mb-3">
                Attach addon groups so customers can customise their order.
              </p>
              <div className="flex flex-col gap-2">
                {addonGroups.map((ag) => {
                  const checked = form.addonGroups.includes(ag._id);
                  return (
                    <label
                      key={ag._id}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-border-light hover:bg-bg-hover transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddonGroup(ag._id)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-primary">
                          {ag.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {ag.addons?.length ?? ag.addonCount ?? 0} addon
                          {(ag.addons?.length ?? ag.addonCount ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </label>
                  );
                })}
                {addonGroups.length === 0 && (
                  <p className="text-sm text-text-tertiary">No addon groups available.</p>
                )}
              </div>
            </CollapsibleSection>

            {/* Section 6: Nutritional Info */}
            <CollapsibleSection
              title="Nutritional Information"
              defaultOpen={false}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "calories", label: "Calories (kcal)" },
                  { field: "protein", label: "Protein (g)" },
                  { field: "carbs", label: "Carbs (g)" },
                  { field: "fat", label: "Fat (g)" },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <FieldLabel>{label}</FieldLabel>
                    <input
                      type="number"
                      value={form.nutritionalInfo[field]}
                      onChange={(e) => setNutrition(field, e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full px-3 py-2.5 text-sm bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>

          {/* RIGHT COLUMN — sticky preview */}
          <div className="lg:sticky lg:top-6">
            <PreviewCard form={form} />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-light px-4 py-3 z-10 shadow-[var(--shadow-xl)]">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSaving || isUploading}
            className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-light rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndAddAnother}
            disabled={isSaving || isUploading}
            className="px-5 py-2.5 text-sm font-medium text-primary bg-primary-50 rounded-[var(--radius-lg)] hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            Save &amp; Add Another
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors disabled:opacity-70 cursor-pointer"
          >
            {(isSaving || isUploading) && <Spinner size="sm" className="text-white" />}
            {isUploading
              ? `Uploading… ${progress}%`
              : isSaving
              ? "Saving..."
              : editId
              ? "Update Item"
              : "Save Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page export (wraps form in Suspense for useSearchParams) ─────────────────

export default function AddEditMenuItemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
          <Spinner size="lg" label="Loading..." />
        </div>
      }
    >
      <MenuItemForm />
    </Suspense>
  );
}
