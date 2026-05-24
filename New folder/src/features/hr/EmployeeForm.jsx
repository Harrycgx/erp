import { useEffect, useState } from 'react';
import { SHIFT_OPTIONS } from '../../utils/shiftHelpers';

const defaultPayload = {
  employee_code: '',
  full_name: '',
  phone: '',
  email: '',
  department: 'Production',
  designation: '',
  joining_date: '',
  employment_type: 'Permanent',
  shift: 'Morning',
  salary: 0,
  aadhaar_number: '',
  emergency_contact: '',
  status: 'Active',
};

export default function EmployeeForm({ employee, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(defaultPayload);

  useEffect(() => {
    if (employee) {
      setForm({
        ...defaultPayload,
        ...employee,
        salary: employee.salary || 0,
      });
    } else {
      setForm(defaultPayload);
    }
  }, [employee]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      salary: Number(form.salary || 0),
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Employee profile</p>
        <h2 className="mt-2 text-2xl font-black text-white">{employee?.id ? 'Update employee' : 'Add team member'}</h2>
      </div>

      <div className="grid gap-4">
        <input
          type="text"
          value={form.employee_code}
          onChange={(event) => handleChange('employee_code', event.target.value)}
          placeholder="Employee code"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.full_name}
          onChange={(event) => handleChange('full_name', event.target.value)}
          placeholder="Full name"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="Phone"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            placeholder="Email"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={form.department}
            onChange={(event) => handleChange('department', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Production</option>
            <option>Printing</option>
            <option>Dispatch</option>
            <option>Sales</option>
            <option>Accounts</option>
            <option>Management</option>
          </select>
          <input
            type="text"
            value={form.designation}
            onChange={(event) => handleChange('designation', event.target.value)}
            placeholder="Designation"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="date"
            value={form.joining_date}
            onChange={(event) => handleChange('joining_date', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
          <select
            value={form.employment_type}
            onChange={(event) => handleChange('employment_type', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Permanent</option>
            <option>Contract</option>
            <option>Temporary</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={form.shift}
            onChange={(event) => handleChange('shift', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          >
            {SHIFT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            type="number"
            value={form.salary}
            onChange={(event) => handleChange('salary', event.target.value)}
            placeholder="Monthly salary"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
        </div>
        <input
          type="text"
          value={form.aadhaar_number}
          onChange={(event) => handleChange('aadhaar_number', event.target.value)}
          placeholder="Aadhaar number"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <input
          type="text"
          value={form.emergency_contact}
          onChange={(event) => handleChange('emergency_contact', event.target.value)}
          placeholder="Emergency contact"
          className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-emerald-500 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : employee?.id ? 'Update employee' : 'Add employee'}
          </button>
          {employee?.id ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-4 text-sm font-semibold text-slate-200 transition hover:border-orange-500"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
