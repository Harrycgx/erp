import React, { useEffect } from "react";

/**
 * DrawerSection Component
 * Used for logical grouping of data within the action drawer.
 */
export const DrawerSection = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">
        {title}
      </h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

/**
 * ActionDrawer Component
 * The central operational control surface for BoxIQ.
 */
export default function ActionDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions = [] 
}) {
  
  // 1. ESC Key Support: For keyboard-first power users
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // 2. Prevent Background Scroll: Keeps the focus strictly on the action
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Variant Styling for Action Buttons
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700",
  };

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Drawer Container */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Action Footer */}
        {actions.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                disabled={action.loading}
                className={`w-full px-4 py-2 text-[11px] font-bold rounded transition-colors ${
                  variants[action.variant || 'secondary']
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {action.loading ? "Processing..." : action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}