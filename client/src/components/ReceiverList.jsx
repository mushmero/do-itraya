import React, { useState, useMemo } from "react";
import ReceiverItem from "./ReceiverItem";
import EmptyState from "./EmptyState";
import {
  PlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const FILTER_CHIPS = [
  { id: "all", label: "All" },
  { id: "family", label: "Family" },
  { id: "individual", label: "Individual" },
  { id: "relatives_inlaws", label: "Relatives & In-laws" },
  { id: "community", label: "Neighbors & Friends" },
  { id: "charity", label: "Charity" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
];

const ReceiverList = ({ receivers, onAdd, onEdit, onToggleReceived }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReceivers = useMemo(() => {
    return (receivers || []).filter((receiver) => {
      // 1. Search term match (by name or category/type)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const name = (receiver.name || "").toLowerCase();
        const type = (receiver.type || "").toLowerCase();
        if (!name.includes(query) && !type.includes(query)) {
          return false;
        }
      }

      // 2. Filter chip match
      const type = (receiver.type || "family").toLowerCase();
      if (activeFilter === "family") {
        return type === "family";
      }
      if (activeFilter === "individual") {
        return type === "individual" || type === "single";
      }
      if (activeFilter === "relatives_inlaws") {
        return type === "relatives" || type === "in-laws";
      }
      if (activeFilter === "community") {
        return type === "neighbors" || type === "colleagues";
      }
      if (activeFilter === "charity") {
        return type === "charity";
      }
      if (activeFilter === "pending") {
        return !receiver.is_received;
      }
      if (activeFilter === "completed") {
        return !!receiver.is_received;
      }
      return true; // 'all'
    });
  }, [receivers, searchTerm, activeFilter]);

  const hasActiveFilters = searchTerm.trim() !== "" || activeFilter !== "all";

  return (
    <div className="section-divider pt-8">
      {/* Section Header */}
      <div className="flex flex-row items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          {/* Visual Anchor Icon - REDUCED SIZE */}
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-gold-dark/10 border border-accent/20 shadow-md shadow-accent/5 hidden sm:flex">
            <UserGroupIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100 light:text-slate-800 mb-0.5">
              Recipients List
            </h2>
            <p className="text-xs dark:text-slate-400 light:text-slate-500">
              {receivers.length === 0
                ? "No recipients registered yet"
                : hasActiveFilters
                  ? `Showing ${filteredReceivers.length} of ${receivers.length} recipients`
                  : `${receivers.length} ${
                      receivers.length === 1 ? "recipient" : "recipients"
                    } registered`}
            </p>
          </div>
        </div>

        {/* Mobile Add Button - Compact & Inline */}
        {receivers.length > 0 && (
          <button
            onClick={onAdd}
            className="flex sm:hidden items-center justify-center w-10 h-10 bg-gradient-to-br from-accent via-amber-500 to-yellow-500 text-white rounded-full shadow-lg shadow-accent/30 active:scale-95 transition-transform"
            aria-label="Add Recipient"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        )}

        {/* Desktop Add Button - AGGRESSIVE REDESIGN */}
        {receivers.length > 0 && (
          <button
            onClick={onAdd}
            className="hidden sm:flex items-center gap-2 pl-5 pr-6 py-2.5 
            bg-gradient-to-r from-accent via-amber-400 to-amber-500 
            hover:from-amber-400 hover:to-accent 
            text-white font-bold rounded-full 
            shadow-glow-md hover:shadow-glow-lg 
            transition-all duration-300 hover:scale-105 active:scale-95 
            group border border-white/20 relative overflow-hidden"
            aria-label="Add Family"
          >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-shimmer" />

            <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90 relative z-10" />
            <span className="relative z-10 tracking-wide text-sm">
              Add Recipient
            </span>
          </button>
        )}
      </div>

      {/* Controls: Search and Filter Chips (only when recipients exist) */}
      {receivers.length > 0 && (
        <div className="space-y-4 mb-6">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 dark:text-slate-400 light:text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipients by name..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border dark:border-white/10 light:border-slate-300 dark:bg-tertiary light:bg-white dark:text-white light:text-light-text placeholder-slate-400 focus:border-accent focus:ring-2 focus:ring-accent/40 outline-none text-sm transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center dark:text-slate-400 light:text-slate-500 hover:text-slate-700 dark:hover:text-white"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border",
                    isActive
                      ? "bg-accent border-accent text-white shadow-md shadow-accent/25"
                      : "dark:bg-tertiary light:bg-slate-100 dark:border-white/5 light:border-slate-200 dark:text-slate-400 light:text-slate-600 hover:border-accent/40 dark:hover:text-slate-200 light:hover:text-slate-800",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Receivers Grid or Empty / No Match State */}
      {receivers.length === 0 ? (
        <EmptyState onAddClick={onAdd} />
      ) : filteredReceivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredReceivers.map((receiver, index) => (
            <div
              key={receiver.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <ReceiverItem
                receiver={receiver}
                onEdit={onEdit}
                onToggleReceived={onToggleReceived}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-2xl border dark:border-white/5 light:border-slate-200 dark:bg-tertiary/50 light:bg-slate-50">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full dark:bg-slate-800 light:bg-slate-200 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-6 h-6 dark:text-slate-400 light:text-slate-500" />
          </div>
          <h3 className="text-base font-bold dark:text-slate-200 light:text-slate-800 mb-1">
            No matching recipients found
          </h3>
          <p className="text-xs dark:text-slate-400 light:text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or active filter to find the recipient you are looking for.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setActiveFilter("all");
            }}
            className="px-4 py-2 text-xs font-semibold text-accent hover:text-white border border-accent hover:bg-accent rounded-full transition-all duration-200 shadow-sm"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

export default ReceiverList;
