export default function Modal({
  open,
  onClose,
  title,
  children,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-white transition hover:bg-red-500"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
