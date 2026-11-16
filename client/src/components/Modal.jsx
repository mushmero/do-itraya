import React from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  cancelText = "Cancel",
  maxWidth = "max-w-md",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:inset-auto print:block">
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} transform transition-all animate-scale-in border border-slate-200 dark:border-slate-700 printable-slip-modal print:border-none print:shadow-none print:max-w-full print:w-full print:bg-white print:text-black`}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between print:border-b-2 print:border-slate-900">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white print:text-xl print:text-black">
            {title}
          </h3>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 print:hidden"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="px-6 py-4 text-slate-600 dark:text-slate-300 print:text-black print:px-0">
          {children}
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 rounded-b-2xl flex justify-end gap-3 print:hidden">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {cancelText}
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;
