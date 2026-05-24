export default function EmployeeTable({ employees = [], selectedEmployee, onSelect, onEdit, onDeactivate }) {
  return (
    <div className="overflow-x-auto rounded-[32px] border border-slate-700 bg-slate-950/90 p-4 shadow-xl shadow-black/20">
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Employee</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Department</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Role</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Shift</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Status</th>
            <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {employees.map((employee) => (
            <tr key={employee.id} className={`transition ${selectedEmployee?.id === employee.id ? 'bg-slate-900/80' : 'hover:bg-slate-900/80'}`}>
              <td className="cursor-pointer px-4 py-4 text-white" onClick={() => onSelect(employee)}>{employee.full_name}</td>
              <td className="px-4 py-4 text-slate-300">{employee.department || 'N/A'}</td>
              <td className="px-4 py-4 text-slate-300">{employee.designation || 'N/A'}</td>
              <td className="px-4 py-4 text-slate-300">{employee.shift || 'Unassigned'}</td>
              <td className="px-4 py-4 text-slate-300">{employee.status || 'Active'}</td>
              <td className="px-4 py-4 space-x-2">
                <button
                  type="button"
                  onClick={() => onEdit(employee)}
                  className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white transition hover:border-orange-500"
                >Edit</button>
                <button
                  type="button"
                  onClick={() => onDeactivate(employee.id)}
                  className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white transition hover:border-rose-500"
                >Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
