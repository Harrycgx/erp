import DepartmentCard from './DepartmentCard';
import OvertimeTracker from './OvertimeTracker';
import StaffPerformanceCard from './StaffPerformanceCard';

export default function HRDashboard({ employees = [], attendanceRecords = [], leaveRequests = [], payrollRecords = [] }) {
  const totalEmployees = employees.length;
  const presentToday = attendanceRecords.filter((record) => record.attendance_status === 'Present').length;
  const absentToday = attendanceRecords.filter((record) => record.attendance_status === 'Absent').length;
  const pendingLeaves = leaveRequests.filter((request) => request.approval_status === 'Pending').length;
  const payrollExpenses = payrollRecords.reduce((sum, record) => sum + Number(record.net_salary || 0), 0);
  const totalOvertime = attendanceRecords.reduce((sum, record) => sum + Number(record.overtime_hours || 0), 0);

  const departmentCounts = employees.reduce((acc, employee) => {
    const department = employee.department || 'Unassigned';
    acc[department] = (acc[department] || 0) + 1;
    return acc;
  }, {});

  const metrics = {
    attendanceConsistency: employees.length ? Math.round((presentToday / employees.length) * 100) : 0,
    shiftEfficiency: employees.filter((employee) => employee.shift).length ? Math.round((employees.filter((employee) => employee.shift).length / employees.length) * 100) : 0,
    overtimeTrend: totalOvertime,
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Total workforce</p>
          <p className="mt-3 text-4xl font-black text-white">{totalEmployees}</p>
        </div>
        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Present today</p>
          <p className="mt-3 text-4xl font-black text-white">{presentToday}</p>
        </div>
        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Absent today</p>
          <p className="mt-3 text-4xl font-black text-white">{absentToday}</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <StaffPerformanceCard metrics={metrics} />
          <DepartmentCard counts={departmentCounts} />
        </div>
        <OvertimeTracker records={attendanceRecords} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pending leaves</p>
          <p className="mt-3 text-4xl font-black text-white">{pendingLeaves}</p>
        </div>
        <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Payroll expenses</p>
          <p className="mt-3 text-4xl font-black text-white">₹{payrollExpenses.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
