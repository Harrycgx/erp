export default function SecondaryButton({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-sm transform transition duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
