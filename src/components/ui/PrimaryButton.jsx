export default function PrimaryButton({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl bg-orange-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(249,115,22,0.2)] transform transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_80px_rgba(249,115,22,0.2)] hover:bg-orange-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
