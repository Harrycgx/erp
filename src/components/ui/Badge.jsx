export default function Badge({
  children,
  variant = "default",
}) {
  const variants = {
    default:
      "bg-white/10 text-white",

    success:
      "bg-green-500/20 text-green-300",

    warning:
      "bg-yellow-500/20 text-yellow-300",

    danger:
      "bg-red-500/20 text-red-300",

    info:
      "bg-blue-500/20 text-blue-300",
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1
        text-xs font-medium
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}