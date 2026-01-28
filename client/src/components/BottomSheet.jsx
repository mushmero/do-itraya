import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

/**
 * BottomSheet - Mobile-first slide-up modal component
 * On mobile: Slides up from bottom
 * On desktop: Shows as centered modal dialog
 */
const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Trigger animation after mount
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      document.body.style.overflow = "unset";
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isAnimating ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div
        className={clsx(
          "fixed z-50 dark:bg-secondary light:bg-light-secondary border-t dark:border-white/10 light:border-black/10 shadow-2xl transition-all duration-300 ease-out",
          // Mobile: Bottom sheet
          "bottom-0 left-0 right-0 rounded-t-3xl max-h-[90vh] overflow-hidden",
          // Desktop: Centered modal
          "md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:rounded-2xl md:max-h-[80vh]",
          maxWidth,
          "md:w-full md:mx-4",
          // Animation states
          isAnimating
            ? "translate-y-0 md:-translate-y-1/2 opacity-100"
            : "translate-y-full md:translate-y-0 md:scale-95 opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b dark:border-white/5 light:border-black/5 sticky top-0 dark:bg-secondary/95 light:bg-light-secondary/95 backdrop-blur-md z-10">
          <h2 className="text-lg md:text-xl font-bold dark:text-slate-100 light:text-light-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 dark:hover:bg-white/10 light:hover:bg-black/5 rounded-full transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 dark:text-slate-400 light:text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)] md:max-h-[calc(80vh-5rem)] p-4 md:p-5">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
