export default function Input({
  label,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <input
        className={`
          w-full rounded-2xl
          border border-white/10
          bg-[#111827]
          px-4 py-3
          text-white
          outline-none
          transition-all duration-300
          focus:border-orange-500
          focus:ring-2 focus:ring-orange-500/20
          ${className}
        `}
        {...props}
      />
    </div>
  );
}