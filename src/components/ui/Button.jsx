export default function Button({ children, type = 'button', className = '' }) {
  return (
    <button type={type} className={`rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 ${className}`}>
      {children}
    </button>
  );
}
