import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../config/permissions';

const roleOptions = [
  { value: ROLES.CUSTOMER, label: 'Customer', description: 'Order packaging, review quotes, and track invoices.' },
  { value: ROLES.VENDOR, label: 'Vendor', description: 'Submit supplier details and manage payment terms.' },
  { value: ROLES.STAFF, label: 'Staff', description: 'Manage operations, production, and order workflows.' },
  { value: ROLES.ADMIN, label: 'Admin', description: 'Control roles, access, and ERP settings.' },
];

export default function Register() {
  const { register, getRoleHomePath } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [vendorType, setVendorType] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [department, setDepartment] = useState('Operations');
  const [designation, setDesignation] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (role === ROLES.CUSTOMER && !companyName.trim()) {
      setError('Customer accounts require a company name.');
      return;
    }

    if (role === ROLES.VENDOR && !vendorType.trim()) {
      setError('Vendor accounts require a vendor type.');
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        fullName,
        email,
        password,
        role,
        phone,
        companyName,
        billingAddress,
        shippingAddress,
        gstNumber,
        vendorType,
        paymentTerms,
        department,
        designation,
        joiningDate,
        salary,
        employeeCode,
      });

      if (result?.session) {
        const destination = getRoleHomePath(result.profile?.role || role);
        navigate(destination, { replace: true });
      } else {
        setSuccess('Registration complete. Please verify your email before signing in.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-[radial-gradient(circle_at_top,_rgba(248,113,22,0.14),transparent_20%),linear-gradient(180deg,#070b16_0%,#090d16_100%)] px-4 py-20 text-white">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Mayur Packaging</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Create your account</h1>
          <p className="text-sm text-slate-400">Register once, then access ERP dashboards and role-specific workflows.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`rounded-3xl border px-5 py-4 text-left transition ${role === option.value ? 'border-orange-400 bg-orange-500/10 text-white' : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-orange-400'}`}>
                <span className="block text-sm font-semibold capitalize">{option.label}</span>
                <span className="mt-2 block text-xs text-slate-400">{option.description}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Amit Kumar"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>

          {(role === ROLES.CUSTOMER || role === ROLES.VENDOR) && (
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Company / Vendor name</span>
              <input
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Mayur Packaging Pvt Ltd"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
          )}

          {role === ROLES.VENDOR && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Vendor type</span>
                <input
                  type="text"
                  value={vendorType}
                  onChange={(event) => setVendorType(event.target.value)}
                  placeholder="Raw materials, Packaging supplies"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Payment terms</span>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(event) => setPaymentTerms(event.target.value)}
                  placeholder="Net 30"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
            </div>
          )}

          {role === ROLES.CUSTOMER && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">GST number</span>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(event) => setGstNumber(event.target.value)}
                    placeholder="GSTIN12345"
                    className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Billing address</span>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(event) => setBillingAddress(event.target.value)}
                    placeholder="Enter billing address"
                    className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Shipping address</span>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                  placeholder="Enter shipping address"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
            </>
          )}

          {(role === ROLES.STAFF || role === ROLES.ADMIN) && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Department</span>
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  placeholder="Operations"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Designation</span>
                <input
                  type="text"
                  value={designation}
                  onChange={(event) => setDesignation(event.target.value)}
                  placeholder="Supervisor"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
            </div>
          )}

          {(role === ROLES.STAFF || role === ROLES.ADMIN) && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Employee code</span>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(event) => setEmployeeCode(event.target.value)}
                  placeholder="EMP-001"
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Start date</span>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(event) => setJoiningDate(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </label>
            </div>
          )}

          {(role === ROLES.STAFF || role === ROLES.ADMIN) && (
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Salary</span>
              <input
                type="number"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                placeholder="0"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
          </div>

          {error ? <p className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {success ? <p className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="font-semibold text-white hover:text-orange-300">
            Sign in
          </button>
        </div>
      </div>
    </section>
  );
}
