import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const YearSelector = ({ selectedYear, onChange, availableYears = [] }) => {
  // Ensure current year and selected year are in the list
  const currentYear = new Date().getFullYear();
  const years = [...new Set([...availableYears, 2025, 2026, currentYear])].sort(
    (a, b) => a - b,
  );

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full p-1.5 flex items-center shadow-lg border border-white/20 dark:border-slate-700/50">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => onChange(year)}
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden",
              selectedYear === year
                ? "text-white shadow-lg"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
            )}
          >
            {selectedYear === year && (
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-amber-500 to-yellow-500 opacity-100" />
            )}
            <span className="relative z-10">{year}</span>
          </button>
        ))}

        {/* Add Year Button (Simulated for UI) */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full ml-1 text-slate-400 hover:text-accent hover:bg-accent/10 transition-colors"
          title="Add Future Year"
          onClick={() => onChange(Math.max(...years) + 1)}
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default YearSelector;
