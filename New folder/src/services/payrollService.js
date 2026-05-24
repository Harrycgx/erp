import supabase from '../lib/supabase';

export async function fetchPayrollRecords() {
  return supabase.from('payroll').select('*').order('generated_at', { ascending: false });
}

export async function fetchPayrollByEmployee(employeeId) {
  return supabase.from('payroll').select('*').eq('employee_id', employeeId).order('generated_at', { ascending: false });
}

export async function insertPayrollRecord(record) {
  return supabase.from('payroll').insert([record]);
}

export async function updatePayrollStatus(id, updates) {
  return supabase.from('payroll').update(updates).eq('id', id);
}

export async function fetchMonthlyAttendanceSummary({ employeeId, month }) {
  const start = `${month}-01`;
  const endDate = new Date(start);
  endDate.setMonth(endDate.getMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);

  const [attendanceResult, leaveResult] = await Promise.all([
    supabase.from('attendance').select('*').eq('employee_id', employeeId).gte('attendance_date', start).lt('attendance_date', end),
    supabase.from('leave_requests').select('*').eq('employee_id', employeeId).gte('start_date', start).lt('start_date', end),
  ]);

  const error = attendanceResult.error || leaveResult.error;
  if (error) return { data: null, error };

  const attendance = attendanceResult.data || [];
  const approvedLeaves = (leaveResult.data || []).filter((leave) => String(leave.approval_status || leave.status).toLowerCase() === 'approved');
  const presentDays = attendance.filter((record) => String(record.attendance_status || record.status).toLowerCase() === 'present').length;
  const overtimeHours = attendance.reduce((sum, record) => sum + Number(record.overtime_hours || record.metadata?.overtime_hours || 0), 0);

  return {
    data: {
      employee_id: employeeId,
      month,
      present_days: presentDays,
      leave_days: approvedLeaves.length,
      overtime_hours: overtimeHours,
      attendance_records: attendance.length,
    },
    error: null,
  };
}

export async function buildPayrollPreview({ employee, month }) {
  const summaryResult = await fetchMonthlyAttendanceSummary({ employeeId: employee.id, month });
  if (summaryResult.error) return summaryResult;

  const baseSalary = Number(employee.salary || 0);
  const overtimeHours = Number(summaryResult.data.overtime_hours || 0);
  const hourlyRate = baseSalary / 208;
  const overtimeAmount = overtimeHours * hourlyRate * 1.5;
  const leaveDeductions = Number(summaryResult.data.leave_days || 0) * (baseSalary / 26);
  const grossAmount = baseSalary + overtimeAmount;
  const netAmount = grossAmount - leaveDeductions;

  return {
    data: {
      employee_id: employee.id,
      payroll_month: month,
      base_salary: baseSalary,
      overtime_hours: overtimeHours,
      overtime_amount: Number(overtimeAmount.toFixed(2)),
      leave_deductions: Number(leaveDeductions.toFixed(2)),
      gross_amount: Number(grossAmount.toFixed(2)),
      deductions: Number(leaveDeductions.toFixed(2)),
      net_amount: Number(netAmount.toFixed(2)),
      net_salary: Number(netAmount.toFixed(2)),
      payment_status: 'Preview',
      generated_at: new Date().toISOString(),
      attendance_summary: summaryResult.data,
    },
    error: null,
  };
}
