import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import HRDashboard from '../features/hr/HRDashboard';
import { fetchAttendanceRecords } from '../services/attendanceService';
import { fetchEmployees } from '../services/employeeService';
import { fetchLeaveRequests } from '../services/leaveService';
import { fetchPayrollRecords } from '../services/payrollService';

export default function HRDashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [employeesRes, attendanceRes, leaveRes, payrollRes] = await Promise.all([
      fetchEmployees(),
      fetchAttendanceRecords(),
      fetchLeaveRequests(),
      fetchPayrollRecords(),
    ]);
    if (employeesRes.error || attendanceRes.error || leaveRes.error || payrollRes.error) {
      setError(employeesRes.error?.message || attendanceRes.error?.message || leaveRes.error?.message || payrollRes.error?.message || 'Unable to load HR dashboard.');
      setEmployees([]);
      setAttendance([]);
      setLeaveRequests([]);
      setPayrollRecords([]);
    } else {
      setEmployees(employeesRes.data || []);
      setAttendance(attendanceRes.data || []);
      setLeaveRequests(leaveRes.data || []);
      setPayrollRecords(payrollRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="HR control center"
            title="Human resources dashboard"
            description="Monitor workforce health, attendance coverage, leave demand, and payroll exposure from one operational panel."
          />
        </div>
        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}
        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-400">Loading HR dashboard…</div>
        ) : (
          <HRDashboard
            employees={employees}
            attendanceRecords={attendance}
            leaveRequests={leaveRequests}
            payrollRecords={payrollRecords}
          />
        )}
      </Container>
    </main>
  );
}
