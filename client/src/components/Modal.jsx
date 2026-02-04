import React from "react";

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in border border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="px-6 py-4 text-slate-600 dark:text-slate-300">
          {children}
        </div>
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;
