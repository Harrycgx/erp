import { calculateNetSalary, calculateOvertimeAmount } from '../../utils/payrollCalculations';

export default function SalarySlipPreview({ employee, payroll }) {
  if (!employee || !payroll) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20 text-slate-400">
        Select an employee payroll record to preview the salary slip.
      </div>
    );
  }

  const overtimeAmount = calculateOvertimeAmount(payroll.base_salary, payroll.overtime_hours || 0);
  const netSalary = calculateNetSalary(payroll.base_salary, overtimeAmount, payroll.deductions, payroll.bonus);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Salary slip</p>
        <h2 className="mt-2 text-2xl font-black text-white">{employee.full_name}</h2>
        <p className="text-sm text-slate-400">Payroll month: {payroll.payroll_month}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Base salary</p>
          <p className="mt-3 text-2xl font-black text-white">₹{Number(payroll.base_salary || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overtime</p>
          <p className="mt-3 text-2xl font-black text-white">₹{Number(overtimeAmount).toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Bonus</p>
          <p className="mt-3 text-xl font-black text-white">₹{Number(payroll.bonus || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Deductions</p>
          <p className="mt-3 text-xl font-black text-white">₹{Number(payroll.deductions || 0).toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-slate-900/90 p-4">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Net salary</p>
        <p className="mt-3 text-4xl font-black text-white">₹{Number(netSalary).toFixed(2)}</p>
        <p className="mt-1 text-sm text-slate-400">Payment status: {payroll.payment_status || 'Pending'}</p>
      </div>
    </div>
  );
}
