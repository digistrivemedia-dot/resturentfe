"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, GripVertical, ImagePlus, Loader2, X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui";

const EMPTY_FORM = { name: "", image: "", displayOrder: 0, isActive: true };

function CategoryForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("folder", "general");
      const res = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      set("image", res.data.url);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Image */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Category Image</p>
        <div
          className="w-24 h-24 rounded-[var(--radius-lg)] border-2 border-dashed border-border-light bg-bg-secondary flex items-center justify-center cursor-pointer overflow-hidden relative group"
          onClick={() => fileRef.current?.click()}
        >
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="category" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus size={24} className="text-text-tertiary" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 size={20} className="text-white animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ImagePlus size={18} className="text-white" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {form.image && (
          <button onClick={() => set("image", "")} className="mt-1 text-xs text-error hover:underline">Remove</button>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">
          Category Name <span className="text-error">*</span>
        </label>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Biryani, Pizza, Burgers"
          className="w-full px-3 py-2.5 text-sm border border-border-light rounded-[var(--radius-md)] bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Display Order</label>
        <input
          type="number"
          min={0}
          value={form.displayOrder}
          onChange={(e) => set("displayOrder", Number(e.target.value))}
          className="w-full px-3 py-2.5 text-sm border border-border-light rounded-[var(--radius-md)] bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="text-xs text-text-tertiary mt-1">Lower number = appears first</p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <input
          id="isActive"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-text-primary">Active (visible on home page)</label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2 border-t border-border-light">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-secondary transition-colors">
          Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.name.trim()}
          className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isSaving && <Loader2 size={14} className="animate-spin" />}
          Save Category
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode: "create" } | { mode: "edit", category }
  const [deleteId, setDeleteId] = useState(null);

  async function load() {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/categories");
      setCategories(res.data.categories);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(form) {
    setIsSaving(true);
    try {
      if (modal.mode === "create") {
        const res = await api.post("/admin/categories", form);
        setCategories((p) => [...p, res.data.category]);
        toast.success("Category created");
      } else {
        const res = await api.put(`/admin/categories/${modal.category._id}`, form);
        setCategories((p) => p.map((c) => c._id === modal.category._id ? res.data.category : c));
        toast.success("Category updated");
      }
      setModal(null);
    } catch {
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await api.delete(`/admin/categories/${deleteId}`);
      setCategories((p) => p.filter((c) => c._id !== deleteId));
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  }

  async function toggleActive(cat) {
    try {
      const res = await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
      setCategories((p) => p.map((c) => c._id === cat._id ? res.data.category : c));
    } catch {
      toast.error("Failed to update");
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-light px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Food Categories</h1>
            <p className="text-sm text-text-secondary mt-0.5">Manage categories shown on the customer home page</p>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-[var(--radius-lg)] hover:bg-primary-dark transition-colors"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-bg-primary rounded-[var(--radius-xl)] border border-border-light">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-text-primary font-semibold">No categories yet</p>
            <p className="text-text-secondary text-sm mt-1">Add categories like Biryani, Pizza, Burgers to show on the home page</p>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-[var(--radius-lg)]"
            >
              <Plus size={15} /> Add First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id} className={`bg-bg-primary rounded-[var(--radius-xl)] border border-border-light overflow-hidden shadow-sm transition-opacity ${!cat.isActive ? "opacity-60" : ""}`}>
                {/* Image */}
                <div className="w-full h-32 bg-bg-secondary flex items-center justify-center overflow-hidden">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🍽️</span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{cat.name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Order: {cat.displayOrder}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.isActive ? "bg-success-light text-success-dark" : "bg-bg-secondary text-text-tertiary"}`}>
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleActive(cat)}
                      className="flex-1 text-xs font-medium py-1.5 rounded-[var(--radius-md)] border border-border-light hover:bg-bg-secondary transition-colors text-text-secondary"
                    >
                      {cat.isActive ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => setModal({ mode: "edit", category: cat })}
                      className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary-50 rounded-[var(--radius-md)] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat._id)}
                      className="p-1.5 text-text-tertiary hover:text-error hover:bg-error-light rounded-[var(--radius-md)] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add Category" : "Edit Category"}
        size="sm"
      >
        {modal && (
          <CategoryForm
            initial={modal.mode === "edit" ? {
              name: modal.category.name,
              image: modal.category.image || "",
              displayOrder: modal.category.displayOrder,
              isActive: modal.category.isActive,
            } : EMPTY_FORM}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            isSaving={isSaving}
          />
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-text-secondary border border-border-light rounded-[var(--radius-lg)] hover:bg-bg-secondary">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm font-semibold text-white bg-error rounded-[var(--radius-lg)] hover:opacity-90">
              Delete
            </button>
          </>
        }
      >
        <div className="text-center py-2">
          <div className="text-4xl mb-3">🗑️</div>
          <p className="text-text-primary font-medium">Delete this category?</p>
          <p className="text-text-secondary text-sm mt-1">It will no longer appear on the home page.</p>
        </div>
      </Modal>
    </div>
  );
}
