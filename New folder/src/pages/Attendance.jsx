import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import AttendanceTable from '../features/hr/AttendanceTable';
import AttendanceCalendar from '../features/hr/AttendanceCalendar';
import ShiftPlanner from '../features/hr/ShiftPlanner';
import OvertimeTracker from '../features/hr/OvertimeTracker';
import { fetchAttendanceRecords } from '../services/attendanceService';
import { fetchEmployees } from '../services/employeeService';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [attendanceResult, employeeResult] = await Promise.all([fetchAttendanceRecords(), fetchEmployees()]);
    if (attendanceResult.error || employeeResult.error) {
      setError(attendanceResult.error?.message || employeeResult.error?.message || 'Unable to load attendance data.');
      setAttendance([]);
      setEmployees([]);
    } else {
      setAttendance(attendanceResult.data || []);
      setEmployees(employeeResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const presentCount = attendance.filter((record) => record.attendance_status === 'Present').length;
  const absentCount = attendance.filter((record) => record.attendance_status === 'Absent').length;
  const lateCount = attendance.filter((record) => record.attendance_status === 'Late').length;
  const overtimeHours = attendance.reduce((sum, record) => sum + Number(record.overtime_hours || 0), 0);

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Attendance control"
            title="Workforce attendance and shift tracking"
            description="Monitor daily factory attendance, shift coverage, late arrivals and overtime in one consolidated dashboard."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard className="bg-slate-950 text-white" value={presentCount} label="Present" />
            <StatCard className="bg-slate-950 text-white" value={absentCount} label="Absent" />
            <StatCard className="bg-slate-950 text-white" value={lateCount} label="Late" />
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <AttendanceTable records={attendance} />
            <AttendanceCalendar records={attendance} />
          </div>
          <div className="space-y-6">
            <ShiftPlanner employees={employees} />
            <OvertimeTracker records={attendance} />
          </div>
        </div>
      </Container>
    </main>
  );
}
