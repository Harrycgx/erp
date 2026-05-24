export default function StatCard({ value, label, className = '' }) {
  return (
    <div className={`rounded-3xl bg-white p-6 shadow-sm transform transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${className}`}>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-500">{label}</p>
    </div>
  );
}
