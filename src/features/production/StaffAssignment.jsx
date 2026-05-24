import { useState } from 'react';

const defaultStaff = ['Amit Patel', 'Priya Sharma', 'Rohit Desai', 'Sneha Kaur'];
const defaultMachines = ['Corrugator A', 'Printer B', 'Punching Line 1', 'Pasting Station 3'];

export default function StaffAssignment({ job, onUpdateJob }) {
  const [staff, setStaff] = useState(job?.assigned_staff || '');
  const [machine, setMachine] = useState(job?.machine_name || '');

  const handleSave = () => {
    if (!job?.id) return;
    onUpdateJob(job.id, { assigned_staff: staff, machine_name: machine });
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Factory assignment</p>
          <p className="text-sm text-slate-400">Operators, supervisors and machine allocation.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
        >
          Assign
        </button>
      </div>

      <div className="mt-4 space-y-4">
        <label className="block text-sm text-slate-300">
          <span className="text-slate-400">Operator / supervisor</span>
          <select
            value={staff}
            onChange={(event) => setStaff(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">Select staff</option>
            {defaultStaff.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          <span className="text-slate-400">Machine</span>
          <select
            value={machine}
            onChange={(event) => setMachine(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">Select machine</option>
            {defaultMachines.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
