import { useEffect, useState } from 'react';
import { SHIFT_OPTIONS } from '../../utils/shiftHelpers';

const defaultPayload = {
  employee_code: '',
  full_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setForm({
        ...defaultPayload,
        ...employee,
        date_of_birth: employee.date_of_birth || employee.metadata?.date_of_birth || '',
        salary: employee.salary || 0,
      });
    } else {
      setForm(defaultPayload);
    }
    setErrors({});
  }, [employee]);

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    const aadhaarRegex = /^\d{12}$/;
    if (form.aadhaar_number && !aadhaarRegex.test(form.aadhaar_number)) {
      newErrors.aadhaar_number = 'Aadhaar must be exactly 12 digits';
    }

    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.date_of_birth = 'Employee must be at least 18 years old';
      }
    } else {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!form.joining_date) newErrors.joining_date = 'Joining date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      salary: Number(form.salary || 0),
      metadata: {
        ...form.metadata,
        date_of_birth: form.date_of_birth,
      },
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
        <div>
          <input
            type="text"
            value={form.employee_code}
            onChange={(event) => handleChange('employee_code', event.target.value)}
            placeholder="Employee code"
            className={`w-full rounded-3xl border ${errors.employee_code ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.employee_code && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.employee_code}</p>}
        </div>
        <div>
          <input
            type="text"
            value={form.full_name}
            onChange={(event) => handleChange('full_name', event.target.value)}
            placeholder="Full name"
            className={`w-full rounded-3xl border ${errors.full_name ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
          />
          {errors.full_name && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.full_name}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder="Phone (10 digits)"
              className={`w-full rounded-3xl border ${errors.phone ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.phone && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder="Email"
              className={`w-full rounded-3xl border ${errors.email ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.email && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.email}</p>}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 ml-4 block text-[10px] uppercase tracking-wider text-slate-500">Date of Birth</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(event) => handleChange('date_of_birth', event.target.value)}
              className={`w-full rounded-3xl border ${errors.date_of_birth ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.date_of_birth && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label className="mb-1 ml-4 block text-[10px] uppercase tracking-wider text-slate-500">Joining Date</label>
            <input
              type="date"
              value={form.joining_date}
              onChange={(event) => handleChange('joining_date', event.target.value)}
              className={`w-full rounded-3xl border ${errors.joining_date ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.joining_date && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.joining_date}</p>}
          </div>
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
          <select
            value={form.employment_type}
            onChange={(event) => handleChange('employment_type', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Permanent</option>
            <option>Contract</option>
            <option>Temporary</option>
          </select>
          <select
            value={form.shift}
            onChange={(event) => handleChange('shift', event.target.value)}
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          >
            {SHIFT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="number"
            value={form.salary}
            onChange={(event) => handleChange('salary', event.target.value)}
            placeholder="Monthly salary"
            className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
          />
          <div>
            <input
              type="text"
              value={form.aadhaar_number}
              onChange={(event) => handleChange('aadhaar_number', event.target.value)}
              placeholder="Aadhaar number (12 digits)"
              className={`w-full rounded-3xl border ${errors.aadhaar_number ? 'border-rose-500' : 'border-slate-700'} bg-slate-900/90 px-4 py-3 text-sm text-white outline-none`}
            />
            {errors.aadhaar_number && <p className="mt-1 ml-4 text-xs text-rose-500">{errors.aadhaar_number}</p>}
          </div>
        </div>
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
