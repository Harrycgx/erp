export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  onAction, 
  actionLabel = "Create New" 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border border-slate-800 rounded-xl bg-[#0f172a]/50 text-center">
      {Icon && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-full">
          <Icon size={24} className="text-slate-400" />
        </div>
      )}
      <h3 className="text-slate-200 font-bold mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>
      
      {onAction && (
        <button 
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}