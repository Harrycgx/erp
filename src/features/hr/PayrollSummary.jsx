export default function PayrollSummary({ payroll = [], onGenerate }) {
  const totalPayroll = payroll.reduce((sum, item) => sum + Number(item.net_salary || 0), 0);
  const pending = payroll.filter((item) => item.payment_status === 'Pending').length;
  const paid = payroll.filter((item) => item.payment_status === 'Paid').length;

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payroll summary</p>
          <h2 className="mt-2 text-2xl font-black text-white">Salary ledger</h2>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >Generate payroll</button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total expense</p>
          <p className="mt-3 text-3xl font-black text-white">₹{totalPayroll.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Pending payouts</p>
          <p className="mt-3 text-3xl font-black text-white">{pending}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Paid this month</p>
          <p className="mt-3 text-3xl font-black text-white">{paid}</p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/95">
        <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Employee</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Month</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Net salary</th>
              <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {payroll.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/80">
                <td className="px-4 py-4 text-white">{item.employee_name || item.employee_id}</td>
                <td className="px-4 py-4 text-slate-300">{item.payroll_month}</td>
                <td className="px-4 py-4 text-slate-300">₹{Number(item.net_salary || 0).toFixed(2)}</td>
                <td className="px-4 py-4 text-slate-300">{item.payment_status || 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
