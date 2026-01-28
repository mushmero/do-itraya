import React from "react";
import { UsersIcon, UserIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import clsx from "clsx";

const ReceiverItem = ({ receiver, onEdit, onToggleReceived }) => {
  const {
    id,
    name,
    children_count,
    amount_per_packet,
    cash_note,
    is_eligible,
    is_received,
  } = receiver;

  const totalAmount = children_count * amount_per_packet;

  // Status-based styling with full theme support
  const getCardStyle = () => {
    if (!is_eligible) {
      return "opacity-40 grayscale dark:border-slate-700/50 light:border-slate-300";
    }
    if (is_received) {
      return "border-emerald-500/40 dark:bg-emerald-500/5 light:bg-emerald-50 shadow-emerald-500/10";
    }
    return "dark:border-white/10 light:border-slate-200 hover:border-accent/50 hover:shadow-accent/10";
  };

  return (
    <div
      className={clsx(
        // Base card styling - inline instead of glass-card for better theme control
        // Added hover:z-10 to ensure overflowing content stacks on top of siblings
        "rounded-2xl p-5 md:p-6 transition-all duration-300 relative group hover:scale-[1.02] hover:z-10",
        "dark:bg-slate-800/50 light:bg-white/80 backdrop-blur-sm",
        "border shadow-lg dark:shadow-black/20 light:shadow-slate-200/50",
        getCardStyle(),
      )}
    >
      {/* Received Badge - Moved slightly inside to prevent clipping */}
      {!!is_received && is_eligible && (
        <div className="absolute -top-3 -right-3 z-20">
          <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/50 animate-pop">
            <CheckCircleSolid className="w-6 h-6 text-white" />
          </div>
        </div>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div
            className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg transition-transform group-hover:scale-105",
              is_eligible
                ? "bg-gradient-to-br from-accent via-amber-500 to-yellow-500 text-white shadow-accent/30"
                : "dark:bg-slate-700 light:bg-slate-200 dark:text-slate-400 light:text-slate-500",
            )}
          >
            {name.charAt(0).toUpperCase()}
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold dark:text-slate-100 light:text-slate-800 text-lg truncate mb-1.5">
              {name}
            </h3>
            {is_eligible ? (
              <div className="flex items-center gap-2 text-xs dark:text-slate-400 light:text-slate-500">
                <div className="flex items-center gap-1 dark:bg-slate-700/50 light:bg-slate-100 px-2.5 py-1 rounded-full">
                  {receiver.type === "individual" ? (
                    <>
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Single</span>
                    </>
                  ) : (
                    <>
                      <UsersIcon className="w-3.5 h-3.5" />
                      <span>
                        {children_count} {children_count === 1 ? "Kid" : "Kids"}
                      </span>
                    </>
                  )}
                </div>
                <div className="dark:bg-slate-700/50 light:bg-slate-100 px-2.5 py-1 rounded-full">
                  RM {cash_note} notes
                </div>
              </div>
            ) : (
              <span className="text-xs dark:text-slate-500 light:text-slate-400 italic dark:bg-slate-800/50 light:bg-slate-100 px-2.5 py-1 rounded-full">
                Not Eligible
              </span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(receiver)}
          className="p-2.5 dark:hover:bg-white/10 light:hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 md:opacity-70 md:hover:opacity-100"
          aria-label="Edit"
        >
          <PencilIcon className="w-5 h-5 dark:text-slate-400 light:text-slate-500 hover:text-accent transition-colors" />
        </button>
      </div>

      {/* Amount & Status Row */}
      {is_eligible && (
        <div className="flex items-center justify-between pt-5 border-t dark:border-white/5 light:border-slate-100">
          <div>
            <p className="text-xs dark:text-slate-400 light:text-slate-500 mb-1 uppercase tracking-wider font-semibold">
              Total Amount
            </p>
            <p className="text-3xl font-bold font-mono text-accent">
              <span className="text-sm opacity-70 mr-1">RM</span>
              {totalAmount}
            </p>
          </div>

          {/* Received Toggle */}
          <button
            onClick={() => onToggleReceived(id, !is_received)}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 min-w-[120px] border-2 shadow-sm active:scale-95 transform",
              !!is_received
                ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/30 hover:shadow-emerald-500/20"
                : "dark:bg-slate-700/50 light:bg-slate-100 dark:text-slate-300 light:text-slate-600 dark:border-slate-600 light:border-slate-200 hover:border-accent hover:text-accent hover:shadow-accent/10",
            )}
          >
            {!!is_received ? (
              <span className="flex items-center gap-1.5 animate-pop">
                <CheckCircleSolid className="w-5 h-5" />
                Received
              </span>
            ) : (
              "Mark Paid"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceiverItem;
