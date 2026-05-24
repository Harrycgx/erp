export default function DashboardCard({ title = 'Dashboard card', children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-4 text-slate-600">{children}</div>
    </div>
  );
}
