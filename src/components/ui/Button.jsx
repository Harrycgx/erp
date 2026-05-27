export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white",

    secondary:
      "bg-[#111827] border border-white/10 text-white hover:border-orange-500/30",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",

    ghost:
      "bg-transparent hover:bg-white/5 text-slate-300",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center
        rounded-2xl
        px-5 py-3
        font-medium
        transition-all duration-300
        hover:-translate-y-1
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}