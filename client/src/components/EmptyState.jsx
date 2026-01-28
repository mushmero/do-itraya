import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

/**
 * EmptyState - Engaging empty state for when no receivers exist
 */
const EmptyState = ({ onAddClick }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
      {/* Animated Icon */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-amber-600/10 rounded-3xl blur-2xl animate-pulse" />
        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br dark:from-accent/10 dark:to-amber-600/5 light:from-accent/20 light:to-amber-600/10 border-2 dark:border-accent/30 light:border-accent/40 flex items-center justify-center backdrop-blur-sm">
          <svg
            className="w-16 h-16 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-2xl md:text-3xl font-bold dark:text-slate-100 light:text-light-text mb-3">
        No Families Yet
      </h3>
      <p className="text-sm dark:text-slate-400 light:text-light-text-secondary text-center max-w-sm mb-8 leading-relaxed">
        Start planning your festive money packets by adding families to your
        list. Track who receives what and manage your budget effortlessly!
      </p>

      {/* CTA Button */}
      <button
        onClick={onAddClick}
        className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-amber-500 hover:from-amber-500 hover:to-accent text-white font-bold rounded-full shadow-2xl shadow-accent/30 transition-all hover:scale-105 active:scale-95"
      >
        <PlusIcon className="w-6 h-6 transition-transform group-hover:rotate-90" />
        Add Your First Family
      </button>
    </div>
  );
};

export default EmptyState;
