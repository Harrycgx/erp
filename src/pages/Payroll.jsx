import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import PayrollSummary from '../features/hr/PayrollSummary';
import SalarySlipPreview from '../features/hr/SalarySlipPreview';
import { buildPayrollRecord } from '../utils/payrollCalculations';
import { fetchEmployees } from '../services/employeeService';
import { fetchPayrollRecords, insertPayrollRecord, updatePayrollStatus } from '../services/payrollService';

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [employeeResult, payrollResult] = await Promise.all([fetchEmployees(), fetchPayrollRecords()]);
    if (employeeResult.error || payrollResult.error) {
      setError(employeeResult.error?.message || payrollResult.error?.message || 'Unable to load payroll data.');
      setEmployees([]);
      setPayrollRecords([]);
    } else {
      setEmployees(employeeResult.data || []);
      setPayrollRecords(payrollResult.data || []);
      if (!selectedPayroll && payrollResult.data?.length) setSelectedPayroll(payrollResult.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePayroll = async () => {
    const employee = employees[0];
    if (!employee) return;
    setSaving(true);
    setError('');
    const record = buildPayrollRecord({
      employeeId: employee.id,
      payrollMonth: new Date().toISOString().slice(0, 7),
      baseSalary: employee.salary || 0,
      overtimeHours: 0,
      deductions: 0,
      bonus: 0,
    });
    const { error } = await insertPayrollRecord(record);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setSaving(false);
  };

  const handleMarkPaid = async (id) => {
    setSaving(true);
    setError('');
    const { error } = await updatePayrollStatus(id, { payment_status: 'Paid' });
    if (error) {
      setError(error.message);
    } else {
      await loadData();
    }
    setSaving(false);
  };

  const summaryMetrics = useMemo(
    () => [
      { value: payrollRecords.length, label: 'Payroll records' },
      { value: payrollRecords.filter((item) => item.payment_status === 'Pending').length, label: 'Pending' },
      { value: payrollRecords.filter((item) => item.payment_status === 'Processed').length, label: 'Processed' },
      { value: payrollRecords.filter((item) => item.payment_status === 'Paid').length, label: 'Paid' },
    ],
    [payrollRecords]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Payroll operations"
            title="Salary calculation and payment tracking"
            description="Generate payroll records, preview slips, and manage payment status for factory employees."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <StatCard key={metric.label} className="bg-slate-950 text-white" value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <PayrollSummary payroll={payrollRecords} onGenerate={handleGeneratePayroll} />
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payroll actions</p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleGeneratePayroll}
                  className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
                >Generate payroll record</button>
                <button
                  type="button"
                  disabled={saving || !selectedPayroll}
                  onClick={() => selectedPayroll && handleMarkPaid(selectedPayroll.id)}
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >Mark selected paid</button>
              </div>
            </div>
            <SalarySlipPreview employee={employees.find((emp) => emp.id === selectedPayroll?.employee_id)} payroll={selectedPayroll} />
          </div>
        </div>
      </Container>
    </main>
  );
}
