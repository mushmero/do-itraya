import React from "react";
import Modal from "./Modal";
import {
  PrinterIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

// Distinctive color themes for Malaysian Ringgit banknotes
const NOTE_COLOR_STYLES = {
  1: "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/30",
  5: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  10: "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
  20: "text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
  50: "text-teal-500 dark:text-teal-400 bg-teal-500/10 border-teal-500/30",
  100: "text-purple-500 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
};

const BankSlipModal = ({
  isOpen,
  onClose,
  notesBreakdown = [],
  totalPlanned = 0,
  year = new Date().getFullYear(),
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Sort breakdown in ascending denomination order
  const sortedBreakdown = [...(notesBreakdown || [])].sort(
    (a, b) => Number(a.cash_note) - Number(b.cash_note),
  );

  const totalNotes = sortedBreakdown.reduce(
    (sum, n) => sum + (Number(n.total_count) || 0),
    0,
  );
  const totalRemainingNotes = sortedBreakdown.reduce(
    (sum, n) => sum + (Number(n.remaining_count) || 0),
    0,
  );
  const totalRemainingAmount = sortedBreakdown.reduce(
    (sum, n) =>
      sum + (Number(n.cash_note) || 0) * (Number(n.remaining_count) || 0),
    0,
  );

  const formattedTotalPlanned = Number(totalPlanned || 0).toLocaleString();
  const formattedRemainingAmount = Number(
    totalRemainingAmount || 0,
  ).toLocaleString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bank Cash Withdrawal Slip (${year})`}
      cancelText="Close"
      maxWidth="max-w-2xl"
      actions={
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-gold-dark hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 print:hidden"
        >
          <PrinterIcon className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      }
    >
      <div className="space-y-5">
        {/* Header Summary Box */}
        <div className="p-4 rounded-2xl glass-card bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/80 dark:to-slate-800/40 border border-slate-200 dark:border-white/10 print:border print:border-slate-300 print:bg-white print:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-accent print:text-black" />
                <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 print:text-slate-600">
                  Total Cash Amount Needed
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-accent dark:text-gold-light print:text-black font-mono mt-1">
                RM {formattedTotalPlanned}
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 print:text-slate-600">
                Remaining to Withdraw
              </span>
              <div className="text-lg font-bold text-amber-500 dark:text-amber-400 print:text-black font-mono mt-0.5">
                RM {formattedRemainingAmount}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 print:text-slate-500">
                Aidilfitri {year} Budget
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal Denominations Table */}
        {sortedBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
            No cash notes breakdown data available for this year.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60 print:border print:border-slate-300 shadow-sm">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/60 print:bg-slate-100 print:text-black">
                  <th className="py-3 px-4 font-semibold">Denomination</th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Total Quantity (Pcs)
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Remaining to Withdraw (Pcs)
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Subtotal (RM)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40 print:divide-slate-200">
                {sortedBreakdown.map((note) => {
                  const subtotal =
                    (Number(note.cash_note) || 0) *
                    (Number(note.total_count) || 0);
                  const isDone = Number(note.remaining_count) === 0;
                  const colorClass =
                    NOTE_COLOR_STYLES[note.cash_note] ||
                    "text-accent bg-accent/10 border-accent/30";

                  return (
                    <tr
                      key={note.cash_note}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 print:text-black">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${colorClass} print:bg-transparent print:border-slate-300 print:text-black`}
                        >
                          RM {note.cash_note}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300 print:text-black">
                        {Number(note.total_count || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono print:text-black">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-semibold print:text-black">
                            <CheckCircleIcon className="w-3.5 h-3.5 print:hidden" />
                            <span>0 (Done)</span>
                          </span>
                        ) : (
                          <span className="text-amber-500 dark:text-amber-400 font-semibold print:text-black">
                            {Number(note.remaining_count || 0).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-100 print:text-black">
                        RM {subtotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-700/60 font-bold text-slate-800 dark:text-white border-t-2 border-slate-200 dark:border-slate-600 print:bg-slate-100 print:text-black print:border-t-2 print:border-slate-800">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4 text-right font-mono">
                    {totalNotes.toLocaleString()} pcs
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {totalRemainingNotes.toLocaleString()} pcs
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-accent dark:text-gold-light print:text-black">
                    RM {formattedTotalPlanned}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Bank Teller Note / Remarks */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 print:border print:border-slate-300 print:bg-slate-50 print:text-black">
          <p className="font-semibold mb-0.5">📌 Note for Bank Teller:</p>
          <p>
            Please provide fresh / new banknotes (duit baru) for festive gifting
            where available. Thank you.
          </p>
        </div>

        {/* Print-only verification / signature section */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-slate-300 text-xs text-black">
          <div>
            <p className="font-semibold mb-6">Account Holder / Requester:</p>
            <div className="border-b border-black w-48 mb-1"></div>
            <p className="text-[10px] text-slate-600">Signature / Date</p>
          </div>
          <div>
            <p className="font-semibold mb-6">Bank Teller Verification:</p>
            <div className="border-b border-black w-48 mb-1"></div>
            <p className="text-[10px] text-slate-600">Officer Stamp / Date</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BankSlipModal;
