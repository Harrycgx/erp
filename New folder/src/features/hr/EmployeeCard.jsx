export default function EmployeeCard({ employee }) {
  if (!employee) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20 text-slate-400">
        Select an employee to view profile details and shift assignment.
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Staff profile</p>
          <h2 className="mt-2 text-3xl font-black text-white">{employee.full_name}</h2>
          <p className="text-sm text-slate-400">{employee.employee_code || 'EMP-XXXX'}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Department</p>
            <p className="mt-2 text-sm text-white">{employee.department || 'Production'}</p>
            <p className="mt-1 text-slate-400">{employee.designation || 'Operator'}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Shift</p>
            <p className="mt-2 text-sm text-white">{employee.shift || 'Unassigned'}</p>
            <p className="mt-1 text-slate-400">Status: {employee.status || 'Active'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Contact</p>
            <p className="mt-2 text-sm text-white">{employee.phone || 'N/A'}</p>
            <p className="mt-1 text-slate-400">{employee.email || 'N/A'}</p>
          </div>
          <div className="rounded-3xl bg-slate-900/90 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Salary</p>
            <p className="mt-2 text-sm text-white">₹{Number(employee.salary || 0).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-slate-400">Joined: {employee.joining_date || 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
