"use client";

import { useState, useEffect } from "react";
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  X,
  LayoutGrid,
  UtensilsCrossed,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui";
import useMenuManagementStore from "@/stores/menuManagementStore";

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    isSaving,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenuManagementStore();

  // inline edit state — keyed by name since backend has no _id
  const [editingName, setEditingName] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // add modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // page-level error (fetch)
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        await fetchCategories();
      } catch (err) {
        setPageError(err?.response?.data?.message || err.message || "Failed to load categories.");
      }
    }
    load();
  }, [fetchCategories]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalItems = categories.reduce((s, c) => s + (c.itemCount || 0), 0);

  // Build display list with sortOrder derived from index
  const displayCategories = categories.map((c, idx) => ({ ...c, sortOrder: idx + 1 }));

  // ── Inline edit handlers ─────────────────────────────────────────────────────
  function startEdit(cat) {
    setEditingName(cat.name);
    setEditValue(cat.name);
    setEditError("");
  }

  function cancelEdit() {
    setEditingName(null);
    setEditValue("");
    setEditError("");
  }

  async function saveEdit(oldName) {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (trimmed === oldName) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    setEditError("");
    try {
      await updateCategory(oldName, trimmed);
      setEditingName(null);
      setEditValue("");
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || "Failed to rename category.");
    } finally {
      setEditSaving(false);
    }
  }

  function handleEditKeyDown(e, oldName) {
    if (e.key === "Enter") saveEdit(oldName);
    if (e.key === "Escape") cancelEdit();
  }

  // ── Add category ─────────────────────────────────────────────────────────────
  function openAddModal() {
    setNewCatName("");
    setAddError("");
    setAddModalOpen(true);
  }

  async function handleAdd() {
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setAddError("Category name is required.");
      return;
    }
    setAddError("");
    setAddSaving(true);
    try {
      await addCategory(trimmed);
      setAddModalOpen(false);
      setNewCatName("");
    } catch (err) {
      setAddError(err?.response?.data?.message || err.message || "Failed to add category.");
    } finally {
      setAddSaving(false);
    }
  }

  // ── Delete category ───────────────────────────────────────────────────────────
  function openDelete(cat) {
    setDeleteTarget(cat);
    setDeleteError("");
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteCategory(deleteTarget.name);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Menu Categories
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Organise your menu into sections customers can browse easily
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 h-10 px-4 bg-primary text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Page-level fetch error */}
      {pageError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-error-light border border-error/30 rounded-[var(--radius-md)] text-sm text-error">
          <AlertTriangle size={15} className="shrink-0" />
          {pageError}
        </div>
      )}

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3 mb-7">
        <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-[var(--radius-full)] text-primary text-sm font-medium">
          <LayoutGrid size={14} />
          {displayCategories.length} Categor{displayCategories.length !== 1 ? "ies" : "y"}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-success-light rounded-[var(--radius-full)] text-success-dark text-sm font-medium">
          <UtensilsCrossed size={14} />
          {totalItems} Total Item{totalItems !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Helper hint */}
      <p className="text-xs text-text-tertiary mb-4 flex items-center gap-1.5">
        <GripVertical size={13} className="shrink-0" />
        Drag handles are visual — reorder by editing sort order directly
      </p>

      {/* Loading state */}
      {isLoading && displayCategories.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {/* Category list */}
      {!isLoading && displayCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-bg-secondary flex items-center justify-center mb-3">
            <LayoutGrid size={26} className="text-text-tertiary" />
          </div>
          <p className="text-base font-semibold text-text-primary">
            No categories yet
          </p>
          <p className="text-sm text-text-tertiary mt-1 mb-4">
            Add your first category to start organising your menu
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Add Category
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayCategories.map((cat) => (
            <CategoryRow
              key={cat.name}
              cat={cat}
              isEditing={editingName === cat.name}
              editValue={editValue}
              editError={editError}
              editSaving={editSaving}
              onEditValueChange={(v) => { setEditValue(v); setEditError(""); }}
              onStartEdit={() => startEdit(cat)}
              onSaveEdit={() => saveEdit(cat.name)}
              onCancelEdit={cancelEdit}
              onEditKeyDown={(e) => handleEditKeyDown(e, cat.name)}
              onDelete={() => openDelete(cat)}
            />
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Category"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setAddModalOpen(false)}
              className="h-9 px-4 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={addSaving}
              className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {addSaving && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {addSaving ? "Saving…" : "Add Category"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Category Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setAddError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAddModalOpen(false);
              }}
              placeholder="e.g. Starters, Main Course…"
              autoFocus
              className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {addError && (
              <p className="mt-1.5 text-xs text-error flex items-center gap-1">
                <AlertTriangle size={12} />
                {addError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-[var(--radius-md)] border border-border-light">
            <span className="text-xs text-text-tertiary">Sort order</span>
            <span className="ml-auto text-sm font-semibold text-text-primary">
              #{displayCategories.length + 1}
            </span>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(""); }}
        title="Delete Category"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setDeleteTarget(null); setDeleteError(""); }}
              className="h-9 px-4 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-9 px-4 text-sm font-medium text-white bg-error rounded-[var(--radius-md)] hover:bg-error-dark transition-colors cursor-pointer disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex flex-col gap-3">
            {deleteTarget.itemCount > 0 ? (
              <div className="flex gap-3 p-3 bg-warning-light rounded-[var(--radius-md)] border border-warning/30">
                <AlertTriangle
                  size={18}
                  className="text-warning shrink-0 mt-0.5"
                />
                <p className="text-sm text-text-primary">
                  <span className="font-semibold">
                    "{deleteTarget.name}"
                  </span>{" "}
                  has{" "}
                  <span className="font-semibold">
                    {deleteTarget.itemCount} item
                    {deleteTarget.itemCount > 1 ? "s" : ""}
                  </span>
                  . Deleting it will make those items uncategorised.
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary">
                  "{deleteTarget.name}"
                </span>
                ? This action cannot be undone.
              </p>
            )}
            {deleteError && (
              <p className="text-xs text-error flex items-center gap-1">
                <AlertTriangle size={12} />
                {deleteError}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────
function CategoryRow({
  cat,
  isEditing,
  editValue,
  editError,
  editSaving,
  onEditValueChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditKeyDown,
  onDelete,
}) {
  return (
    <div
      className={`
        group flex items-center gap-3 px-4 py-3.5 bg-bg-primary
        rounded-[var(--radius-xl)] border transition-all
        ${isEditing ? "border-primary ring-2 ring-primary/15 shadow-[var(--shadow-sm)]" : "border-border-light hover:border-border-default hover:shadow-[var(--shadow-sm)]"}
      `}
    >
      {/* Drag handle */}
      <GripVertical
        size={16}
        className="text-text-tertiary shrink-0 cursor-grab opacity-50 group-hover:opacity-100 transition-opacity"
      />

      {/* Sort order badge */}
      <span className="w-6 h-6 rounded-full bg-bg-secondary border border-border-light text-xs font-semibold text-text-tertiary flex items-center justify-center shrink-0">
        {cat.sortOrder}
      </span>

      {/* Name — normal or editing */}
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            autoFocus
            className="w-full h-8 px-2 rounded-[var(--radius-md)] border border-primary bg-bg-primary text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {editError && (
            <p className="text-xs text-error flex items-center gap-1">
              <AlertTriangle size={11} />
              {editError}
            </p>
          )}
        </div>
      ) : (
        <span className="flex-1 text-sm font-medium text-text-primary truncate">
          {cat.name}
        </span>
      )}

      {/* Item count badge */}
      <span
        className={`
          px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-semibold shrink-0
          ${cat.itemCount > 0 ? "bg-primary-50 text-primary border border-primary/20" : "bg-bg-secondary text-text-tertiary border border-border-light"}
        `}
      >
        {cat.itemCount} item{cat.itemCount !== 1 ? "s" : ""}
      </span>

      {/* Actions */}
      {isEditing ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onSaveEdit}
            disabled={editSaving}
            className="p-1.5 rounded-[var(--radius-md)] text-success hover:bg-success-light transition-colors cursor-pointer disabled:opacity-50"
            title="Save (Enter)"
          >
            {editSaving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <CheckCircle2 size={17} />
            )}
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:bg-bg-hover transition-colors cursor-pointer"
            title="Cancel (Esc)"
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onStartEdit}
            className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
            title="Edit name"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:text-error hover:bg-error-light transition-colors cursor-pointer"
            title="Delete category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
