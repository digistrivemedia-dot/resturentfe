"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  AlertTriangle,
  Layers,
  Tag,
  Store,
} from "lucide-react";
import { Modal, Toggle } from "@/components/ui";
import useMenuManagementStore from "@/stores/menuManagementStore";

// ── Helpers ──────────────────────────────────────────────────────────────────
let addonIdCounter = 20;

function newAddonRow() {
  addonIdCounter += 1;
  return { _id: `a_new_${addonIdCounter}`, name: "", price: "" };
}

function emptyForm() {
  return {
    menuItemId: "",
    name: "",
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    addons: [newAddonRow(), newAddonRow()],
  };
}

// Normalise backend addonGroup shape for display.
// Backend returns usedInItems (array of item objects or names).
// UI expects: usedIn (array of strings), menuItemId (string).
function normaliseGroup(group) {
  // usedInItems may be array of objects {_id, name} or strings
  const usedInItems = group.usedInItems || [];
  const usedIn = usedInItems.map((item) =>
    typeof item === "string" ? item : item.name || ""
  );
  // Pick first menuItemId for the edit form default
  const menuItemId =
    group.menuItemId ||
    (usedInItems[0]
      ? typeof usedInItems[0] === "string"
        ? usedInItems[0]
        : usedInItems[0]._id
      : "");
  return { ...group, usedIn, menuItemId };
}

// ── Stepper component ─────────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 0 }) {
  return (
    <div className="flex items-center gap-0 border border-border-default rounded-[var(--radius-md)] overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer disabled:opacity-40"
        disabled={value <= min}
      >
        <span className="text-lg leading-none">−</span>
      </button>
      <span className="w-8 text-center text-sm font-semibold text-text-primary select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer"
      >
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}

// ── Addon Group Form (inside modal) ───────────────────────────────────────────
function AddonGroupForm({ form, setForm, menuItems }) {
  function updateAddon(id, field, val) {
    setForm((f) => ({
      ...f,
      addons: f.addons.map((a) => (a._id === id ? { ...a, [field]: val } : a)),
    }));
  }

  function removeAddon(id) {
    setForm((f) => ({ ...f, addons: f.addons.filter((a) => a._id !== id) }));
  }

  function addAddon() {
    setForm((f) => ({ ...f, addons: [...f.addons, newAddonRow()] }));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Menu Item selector */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Menu Item <span className="text-error">*</span>
        </label>
        <select
          value={form.menuItemId}
          onChange={(e) => setForm((f) => ({ ...f, menuItemId: e.target.value }))}
          className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        >
          <option value="">— Select a menu item —</option>
          {menuItems.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Group Name */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Group Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Choice of Bread"
          className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-bg-secondary border border-border-light">
        <div>
          <p className="text-sm font-medium text-text-primary">Required</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Customer must choose from this group
          </p>
        </div>
        <Toggle
          checked={form.isRequired}
          onChange={(val) => setForm((f) => ({ ...f, isRequired: val }))}
          size="md"
        />
      </div>

      {/* Selection range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Min Selection
          </label>
          <Stepper
            value={form.minSelection}
            onChange={(val) =>
              setForm((f) => ({
                ...f,
                minSelection: val,
                maxSelection: Math.max(f.maxSelection, val),
              }))
            }
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Max Selection
          </label>
          <Stepper
            value={form.maxSelection}
            onChange={(val) =>
              setForm((f) => ({
                ...f,
                maxSelection: Math.max(1, val),
                minSelection: Math.min(f.minSelection, Math.max(1, val)),
              }))
            }
            min={1}
          />
        </div>
      </div>

      {/* Addon items */}
      <div>
        <p className="text-sm font-semibold text-text-primary mb-3">
          Addon Items
        </p>
        <div className="flex flex-col gap-2">
          {form.addons.map((addon) => (
            <div key={addon._id} className="flex items-center gap-2">
              {/* Drag handle (visual only) */}
              <GripVertical
                size={16}
                className="text-text-tertiary shrink-0 cursor-grab"
              />
              {/* Name */}
              <input
                type="text"
                value={addon.name}
                onChange={(e) => updateAddon(addon._id, "name", e.target.value)}
                placeholder="Item name"
                className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {/* Price */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-text-tertiary">
                  ₹
                </span>
                <input
                  type="number"
                  value={addon.price}
                  onChange={(e) =>
                    updateAddon(addon._id, "price", e.target.value)
                  }
                  placeholder="0"
                  min={0}
                  className="w-24 h-9 pl-6 pr-2 rounded-[var(--radius-md)] border border-border-default bg-bg-primary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              {/* Remove */}
              <button
                type="button"
                onClick={() => removeAddon(addon._id)}
                disabled={form.addons.length <= 1}
                className="p-1.5 rounded-[var(--radius-md)] text-text-tertiary hover:text-error hover:bg-error-light transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAddon}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer"
        >
          <Plus size={15} />
          Add Another Item
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AddonsPage() {
  const {
    addonGroups,
    isLoading,
    fetchAddons,
    fetchMenu,
    getAllItems,
    addAddonGroup,
    updateAddonGroup,
    deleteAddonGroup,
  } = useMenuManagementStore();

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // null = create, obj = edit
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // page-level error
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        await Promise.all([fetchAddons(), fetchMenu()]);
      } catch (err) {
        setPageError(err?.response?.data?.message || err.message || "Failed to load addon data.");
      }
    }
    load();
  }, [fetchAddons, fetchMenu]);

  // Normalised groups for display
  const groups = addonGroups.map(normaliseGroup);

  // Flat list of all menu items for the selector
  const menuItems = getAllItems();

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalAddons = groups.reduce((sum, g) => sum + (g.addons || []).length, 0);
  const itemsUsingGroups = new Set(groups.flatMap((g) => g.usedIn || [])).size;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingGroup(null);
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(group) {
    setEditingGroup(group);
    setForm({
      menuItemId: group.menuItemId || "",
      name: group.name,
      isRequired: group.isRequired,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      addons: (group.addons || []).map((a) => ({ ...a })),
    });
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGroup(null);
    setForm(emptyForm());
    setFormError("");
  }

  async function handleSave() {
    if (!form.menuItemId) {
      setFormError("Please select a menu item.");
      return;
    }
    if (!form.name.trim()) {
      setFormError("Group name is required.");
      return;
    }
    const validAddons = form.addons.filter(
      (a) => a.name.trim() && a.price !== "" && Number(a.price) >= 0
    );
    if (validAddons.length === 0) {
      setFormError("Add at least one valid addon item.");
      return;
    }
    setFormError("");
    setSaving(true);

    const groupPayload = {
      name: form.name.trim(),
      isRequired: form.isRequired,
      minSelection: form.minSelection,
      maxSelection: form.maxSelection,
      addons: validAddons.map((a) => ({
        name: a.name.trim(),
        price: Number(a.price),
      })),
    };

    try {
      if (editingGroup) {
        await updateAddonGroup(editingGroup._id, form.menuItemId, groupPayload);
      } else {
        await addAddonGroup(form.menuItemId, groupPayload);
      }
      closeModal();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message || "Failed to save addon group.");
    } finally {
      setSaving(false);
    }
  }

  function openDelete(group) {
    setDeleteTarget(group);
    setDeleteError("");
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAddonGroup(deleteTarget._id, deleteTarget.menuItemId);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err.message || "Failed to delete addon group.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Addon Groups</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage customisation options attached to your menu items
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 h-10 px-4 bg-primary text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          Create New Group
        </button>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-error-light border border-error/30 rounded-[var(--radius-md)] text-sm text-error">
          <AlertTriangle size={15} className="shrink-0" />
          {pageError}
        </div>
      )}

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3 mb-7">
        {[
          {
            icon: Layers,
            label: `${groups.length} Group${groups.length !== 1 ? "s" : ""}`,
            bg: "bg-primary-50",
            text: "text-primary",
          },
          {
            icon: Tag,
            label: `${totalAddons} Addon${totalAddons !== 1 ? "s" : ""}`,
            bg: "bg-success-light",
            text: "text-success-dark",
          },
          {
            icon: Store,
            label: `${itemsUsingGroups} Item${itemsUsingGroups !== 1 ? "s" : ""} using groups`,
            bg: "bg-warning-light",
            text: "text-warning",
          },
        ].map(({ icon: Icon, label, bg, text }) => (
          <div
            key={label}
            className={`flex items-center gap-2 px-4 py-2 ${bg} rounded-[var(--radius-full)] ${text} text-sm font-medium`}
          >
            <Icon size={14} />
            {label}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && groups.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      )}

      {/* Group cards */}
      {!isLoading && groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-bg-secondary flex items-center justify-center mb-3">
            <Layers size={26} className="text-text-tertiary" />
          </div>
          <p className="text-base font-semibold text-text-primary">
            No addon groups yet
          </p>
          <p className="text-sm text-text-tertiary mt-1 mb-4">
            Create your first group to let customers customise orders
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 h-9 px-4 bg-primary text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer"
          >
            <Plus size={15} />
            Create New Group
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <AddonGroupCard
              key={group._id}
              group={group}
              onEdit={() => openEdit(group)}
              onDelete={() => openDelete(group)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingGroup ? "Edit Addon Group" : "Create Addon Group"}
        size="lg"
        footer={
          <>
            <button
              onClick={closeModal}
              className="h-9 px-4 text-sm font-medium text-text-secondary bg-bg-secondary border border-border-light rounded-[var(--radius-md)] hover:bg-bg-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-[var(--radius-md)] hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {saving && (
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
              {saving ? "Saving…" : "Save Group"}
            </button>
          </>
        }
      >
        <AddonGroupForm form={form} setForm={setForm} menuItems={menuItems} />
        {formError && (
          <p className="mt-3 text-sm text-error flex items-center gap-1.5">
            <AlertTriangle size={14} />
            {formError}
          </p>
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(""); }}
        title="Delete Addon Group"
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
            {(deleteTarget.usedIn || []).length > 0 ? (
              <div className="flex gap-3 p-3 bg-warning-light rounded-[var(--radius-md)] border border-warning/30">
                <AlertTriangle
                  size={18}
                  className="text-warning shrink-0 mt-0.5"
                />
                <p className="text-sm text-text-primary">
                  This group is used in{" "}
                  <span className="font-semibold">
                    {deleteTarget.usedIn.length} item
                    {deleteTarget.usedIn.length > 1 ? "s" : ""}
                  </span>{" "}
                  (
                  {deleteTarget.usedIn.join(", ")}
                  ). Removing it may break those items.
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

// ── Addon Group Card ──────────────────────────────────────────────────────────
function AddonGroupCard({ group, onEdit, onDelete }) {
  return (
    <div
      className="bg-bg-primary rounded-[var(--radius-xl)] border border-border-light p-5 transition-shadow hover:shadow-[var(--shadow-sm)]"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-bold text-text-primary">
              {group.name}
            </h3>
            {group.isRequired ? (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-success-light text-success-dark rounded-[var(--radius-full)] border border-success/20">
                Required
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-bg-secondary text-text-tertiary rounded-[var(--radius-full)] border border-border-light">
                Optional
              </span>
            )}
          </div>
          {/* Used-in line */}
          <p className="text-xs text-text-secondary mt-1">
            {(group.usedIn || []).length > 0 ? (
              <>
                Used in:{" "}
                <span className="font-medium text-text-primary">
                  {group.usedIn.join(", ")}
                </span>
              </>
            ) : (
              <span className="text-text-tertiary">
                Not used in any item
              </span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 rounded-[var(--radius-md)] text-text-tertiary hover:text-primary hover:bg-primary-50 transition-colors cursor-pointer"
            title="Edit group"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-[var(--radius-md)] text-text-tertiary hover:text-error hover:bg-error-light transition-colors cursor-pointer"
            title="Delete group"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Selection range chip */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bg-secondary border border-border-light rounded-[var(--radius-full)] text-xs font-medium text-text-secondary mb-3">
        Min: {group.minSelection} · Max: {group.maxSelection}
      </div>

      {/* Addon pills */}
      <div className="flex flex-wrap gap-2">
        {(group.addons || []).map((addon) => (
          <span
            key={addon._id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary text-xs font-medium rounded-[var(--radius-full)] border border-primary/20"
          >
            {addon.name}{" "}
            <span className="text-primary/70">₹{addon.price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
