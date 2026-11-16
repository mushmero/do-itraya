import React, { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

const CATEGORY_OPTIONS = [
  { value: "family", label: "Family (Keluarga)" },
  { value: "individual", label: "Individual / Single (Bujang/Warga Emas)" },
  { value: "in-laws", label: "In-laws (Mertua / Ipar)" },
  { value: "relatives", label: "Relatives (Saudara Mara)" },
  { value: "neighbors", label: "Neighbors (Jiran)" },
  { value: "colleagues", label: "Colleagues / Friends (Rakan)" },
  { value: "charity", label: "Charity (Asnaf / Sedekah)" },
];

/**
 * EditReceiverForm - Form for editing receiver details in BottomSheet
 */
const EditReceiverForm = ({ receiver, onSave, onDelete, onCancel }) => {
  const initialType =
    receiver.type === "single"
      ? "individual"
      : receiver.type || "family";

  const [formData, setFormData] = useState({
    name: receiver.name || "",
    type: initialType,
    children_count: receiver.children_count || 1,
    amount_per_packet: receiver.amount_per_packet || 10,
    cash_note: receiver.cash_note || 10,
    is_eligible:
      receiver.is_eligible !== undefined ? receiver.is_eligible : true,
  });

  const isIndividual =
    formData.type === "individual" || formData.type === "single";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...receiver,
      ...formData,
      children_count: isIndividual ? 1 : parseInt(formData.children_count) || 1,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalAmount = formData.children_count * formData.amount_per_packet;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category Selector */}
      <div>
        <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
          Category
        </label>
        <select
          value={formData.type}
          onChange={(e) => {
            const newType = e.target.value;
            handleChange("type", newType);
            if (newType === "individual" || newType === "single") {
              handleChange("children_count", 1);
            }
          }}
          className="w-full dark:bg-tertiary light:bg-white border dark:border-white/10 light:border-slate-300 rounded-xl px-4 py-3 dark:text-white light:text-light-text font-semibold focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all cursor-pointer"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
          {formData.type === "family" ? "Family Name" : "Recipient Name"}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full dark:bg-tertiary light:bg-white border dark:border-white/10 light:border-slate-300 rounded-xl px-4 py-3 dark:text-white light:text-light-text focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
          placeholder={
            formData.type === "family"
              ? "e.g. Keluarga Hj. Ahmad"
              : "e.g. Mak Cik Kiah"
          }
          required
        />
      </div>

      {/* Eligibility Toggle */}
      <div>
        <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
          Eligibility Status
        </label>
        <button
          type="button"
          onClick={() => handleChange("is_eligible", !formData.is_eligible)}
          className={clsx(
            "w-full py-3 px-4 rounded-full font-semibold transition-all border-2",
            formData.is_eligible
              ? "bg-accent/10 border-accent text-accent hover:bg-accent/20"
              : "dark:bg-slate-800 light:bg-slate-100 dark:border-slate-700 light:border-slate-300 dark:text-slate-400 light:text-slate-600 hover:border-slate-500",
          )}
        >
          {formData.is_eligible ? "✓ Eligible for Packets" : "✗ Not Eligible"}
        </button>
      </div>

      {/* Details (only if eligible) */}
      {formData.is_eligible && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Children Count - Only for non-individual */}
            {!isIndividual ? (
              <div>
                <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
                  Number of Kids / Packets
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.children_count}
                  onChange={(e) =>
                    handleChange(
                      "children_count",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-full dark:bg-tertiary light:bg-white border dark:border-white/10 light:border-slate-300 rounded-xl px-4 py-3 dark:text-white light:text-light-text text-center font-semibold focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                />
              </div>
            ) : (
              // Hidden input for Individual (implicitly 1)
              <div className="hidden">
                <input type="hidden" value="1" />
              </div>
            )}

            {/* Amount per Packet */}
            <div className={isIndividual ? "col-span-2" : ""}>
              <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
                {isIndividual
                  ? "Amount to Give (RM)"
                  : "RM per Packet"}
              </label>
              <input
                type="number"
                min="1"
                value={formData.amount_per_packet}
                onChange={(e) =>
                  handleChange(
                    "amount_per_packet",
                    parseInt(e.target.value) || 10,
                  )
                }
                className="w-full dark:bg-tertiary light:bg-white border dark:border-white/10 light:border-slate-300 rounded-xl px-4 py-3 dark:text-white light:text-light-text text-center font-semibold focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Cash Note Selection */}
          <div>
            <label className="block text-sm font-semibold dark:text-slate-300 light:text-light-text mb-2">
              Cash Note Denomination
            </label>
            <select
              value={formData.cash_note}
              onChange={(e) =>
                handleChange("cash_note", parseInt(e.target.value))
              }
              className="w-full dark:bg-tertiary light:bg-white border dark:border-white/10 light:border-slate-300 rounded-xl px-4 py-3 dark:text-white light:text-light-text font-semibold focus:border-accent focus:ring-2 focus:ring-accent/50 outline-none transition-all"
            >
              {[1, 5, 10, 20, 50, 100].map((note) => (
                <option key={note} value={note}>
                  RM {note}
                </option>
              ))}
            </select>
          </div>

          {/* Total Preview */}
          <div className="dark:bg-accent/10 light:bg-accent/20 border border-accent/40 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm dark:text-slate-300 light:text-light-text font-semibold">
                Total Amount:
              </span>
              <span className="text-2xl md:text-3xl font-bold text-accent font-mono">
                RM {totalAmount}
              </span>
            </div>
            <p className="text-xs dark:text-slate-400 light:text-light-text-secondary mt-1.5">
              {!isIndividual
                ? `${formData.children_count} packets × RM ${formData.amount_per_packet}`
                : `Single recipient (RM ${formData.amount_per_packet})`}{" "}
              using RM {formData.cash_note} notes
            </p>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 dark:bg-slate-800 light:bg-slate-200 dark:hover:bg-slate-700 light:hover:bg-slate-300 dark:text-slate-300 light:text-light-text rounded-full font-semibold transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white rounded-full font-semibold transition-all shadow-lg shadow-accent/30 hover:shadow-accent/40"
        >
          Save Changes
        </button>
      </div>

      {/* Delete Button (with custom confirmation) */}
      {receiver.id && (
        <DeleteButton
          onDelete={() => onDelete(receiver.id)}
          label={
            formData.type === "family" ? "Delete Family" : "Delete Recipient"
          }
        />
      )}
    </form>
  );
};

// Internal Delete Button Component with Confirmation State
const DeleteButton = ({ onDelete, label }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex gap-3 animate-fade-in">
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="flex-1 py-3 px-4 dark:bg-slate-700 light:bg-slate-200 dark:text-slate-300 light:text-slate-600 rounded-full font-semibold transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold transition-all shadow-lg shadow-red-500/30"
        >
          Confirm Delete
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="w-full py-3 px-4 flex items-center justify-center gap-2 text-red-500 dark:hover:bg-red-500/10 light:hover:bg-red-50 rounded-full transition-all border-2 dark:border-red-500/30 light:border-red-300 hover:border-red-500 font-semibold"
    >
      <TrashIcon className="w-5 h-5" />
      {label}
    </button>
  );
};

export default EditReceiverForm;
