"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Home, Briefcase, Plus, Pencil,
  Trash2, CheckCircle2, Star,
} from "lucide-react";
import { Modal } from "@/components/ui";
import useLocationStore from "@/stores/locationStore";
import useAuthStore from "@/stores/authStore";
import useProfileStore from "@/stores/profileStore";
import toast from "react-hot-toast";

const LABEL_ICONS = { home: Home, work: Briefcase, other: MapPin };
const LABEL_COLORS = {
  home: "bg-primary-50 text-primary",
  work: "bg-success-light text-success",
  other: "bg-warning-light text-warning",
};

export default function ManageAddressesPage() {
  const router = useRouter();
  const { user, fetchMe } = useAuthStore();
  const { deleteAddress: deleteAddressApi, updateAddress: updateAddressApi } = useProfileStore();
  const { savedAddresses, removeAddress } = useLocationStore();

  // Use user addresses from API, fall back to location store
  const userAddrs = user?.addresses || [];
  const storeAddrs = savedAddresses || [];
  const allIds = new Set(userAddrs.map((a) => a._id));
  const merged = [...userAddrs, ...storeAddrs.filter((a) => !allIds.has(a._id))];

  const [addresses, setAddresses] = useState(merged);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Update addresses when user data changes
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      setAddresses(user.addresses);
    }
  }, [user?.addresses]);

  const setDefault = async (id) => {
    try {
      await updateAddressApi(id, { isDefault: true });
      await fetchMe();
    } catch {
      toast.error("Failed to set default address");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAddressApi(deleteTarget._id);
      await fetchMe();
      removeAddress?.(deleteTarget._id);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete address");
      setDeleteTarget(null);
    }
  };

  const LabelIcon = ({ label }) => {
    const Icon = LABEL_ICONS[label] || MapPin;
    return <Icon size={15} />;
  };

  return (
    <>
      <div className="py-4 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="p-1.5 rounded-[var(--radius-md)] text-text-secondary hover:bg-bg-hover transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Saved Addresses</h1>
          <Link
            href="/address/new?redirect=/profile/addresses"
            className="ml-auto flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <Plus size={16} /> Add New
          </Link>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-4">
              <MapPin size={36} className="text-text-tertiary" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">No saved addresses</h3>
            <p className="text-sm text-text-secondary max-w-xs mb-6">
              Add your home, work, or other delivery addresses for faster checkout.
            </p>
            <Link
              href="/address/new?redirect=/profile/addresses"
              className="h-11 px-6 bg-primary text-white font-semibold text-sm rounded-[var(--radius-full)] flex items-center gap-2 hover:bg-primary-dark transition-colors"
            >
              <Plus size={15} /> Add Address
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const labelColor = LABEL_COLORS[addr.label] || LABEL_COLORS.other;

              return (
                <div
                  key={addr._id}
                  className={`bg-white rounded-[var(--radius-xl)] border-2 overflow-hidden transition-all ${
                    addr.isDefault ? "border-primary" : "border-border-light"
                  }`}
                >
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      {/* Label icon */}
                      <div className={`w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 ${labelColor}`}>
                        <LabelIcon label={addr.label} />
                      </div>

                      {/* Address info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-text-primary capitalize">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={10} /> Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{addr.fullAddress}</p>
                        {addr.landmark && (
                          <p className="text-xs text-text-tertiary mt-0.5">Near {addr.landmark}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefault(addr._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <Star size={11} /> Set as Default
                        </button>
                      )}
                      <div className="ml-auto flex gap-2">
                        <Link
                          href={`/address/new?redirect=/profile/addresses&edit=${addr._id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(addr)}
                          className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-error transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new CTA */}
            <Link
              href="/address/new?redirect=/profile/addresses"
              className="flex items-center gap-3 border-2 border-dashed border-border-default rounded-[var(--radius-xl)] p-4 hover:border-primary hover:bg-primary-50/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Plus size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Add a new address</p>
                <p className="text-xs text-text-tertiary mt-0.5">Home, work, or any other location</p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete address?"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="h-10 px-5 text-sm font-semibold text-text-secondary border border-border-default rounded-[var(--radius-lg)] hover:bg-bg-hover transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} className="h-10 px-5 text-sm font-semibold text-white bg-error rounded-[var(--radius-lg)] hover:bg-error-dark transition-colors">
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          <strong className="text-text-primary capitalize">{deleteTarget?.label}</strong> — {deleteTarget?.fullAddress}
        </p>
        <p className="text-sm text-text-secondary mt-1">This address will be permanently removed.</p>
      </Modal>
    </>
  );
}
