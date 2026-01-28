import React from "react";
import ReceiverItem from "./ReceiverItem";
import EmptyState from "./EmptyState";
import { PlusIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const ReceiverList = ({ receivers, onAdd, onEdit, onToggleReceived }) => {
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

      {/* Receivers Grid */}
      {receivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {receivers.map((receiver, index) => (
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
        <EmptyState onAddClick={onAdd} />
      )}
    </div>
  );
};

export default ReceiverList;
