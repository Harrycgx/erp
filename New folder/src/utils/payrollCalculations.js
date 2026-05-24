export function calculateOvertimeAmount(baseSalary, overtimeHours, overtimeRate = 1.5) {
  const hourlyRate = Number(baseSalary || 0) / 2080;
  return Number(overtimeHours || 0) * hourlyRate * Number(overtimeRate || 1.5);
}

export function calculateNetSalary(baseSalary, overtimeAmount = 0, deductions = 0, bonus = 0) {
  return Number(baseSalary || 0) + Number(overtimeAmount || 0) + Number(bonus || 0) - Number(deductions || 0);
}

export function buildPayrollRecord({ employeeId, payrollMonth, baseSalary, overtimeHours, deductions, bonus, paymentStatus = 'Pending' }) {
  const overtimeAmount = calculateOvertimeAmount(baseSalary, overtimeHours);
  const netSalary = calculateNetSalary(baseSalary, overtimeAmount, deductions, bonus);
  return {
    employee_id: employeeId,
    payroll_month: payrollMonth,
    base_salary: Number(baseSalary || 0),
    overtime_amount: Number(overtimeAmount.toFixed(2)),
    deductions: Number(deductions || 0),
    bonus: Number(bonus || 0),
    net_salary: Number(netSalary.toFixed(2)),
    payment_status: paymentStatus,
    generated_at: new Date().toISOString(),
  };
}
