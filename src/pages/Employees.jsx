import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import EmployeeTable from '../features/hr/EmployeeTable';
import EmployeeCard from '../features/hr/EmployeeCard';
import EmployeeForm from '../features/hr/EmployeeForm';
import { deactivateEmployee, fetchEmployees, insertEmployee, updateEmployee } from '../services/employeeService';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    const result = await fetchEmployees();
    if (result.error) {
      setError(result.error.message);
      setEmployees([]);
    } else {
      setEmployees(result.data || []);
      if (!selectedEmployee && result.data?.length) setSelectedEmployee(result.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSave = async (employee) => {
    setSaving(true);
    setError('');
    try {
      if (editingEmployee?.id) {
        const { error } = await updateEmployee(editingEmployee.id, employee);
        if (error) throw error;
      } else {
        const { error } = await insertEmployee({ ...employee, created_at: new Date().toISOString() });
        if (error) throw error;
      }
      setEditingEmployee(null);
      await loadEmployees();
    } catch (err) {
      setError(err.message || 'Unable to save employee.');
    }
    setSaving(false);
  };

  const handleDeactivate = async (id) => {
    setSaving(true);
    setError('');
    const { error } = await deactivateEmployee(id);
    if (error) {
      setError(error.message);
    } else {
      await loadEmployees();
      if (selectedEmployee?.id === id) setSelectedEmployee(null);
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Human resources"
            title="Employee management"
            description="Add, edit, and monitor staff records with department, shift, and payroll readiness built for factory operations."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard className="bg-slate-950 text-white" value={employees.length} label="Team members" />
            <StatCard className="bg-slate-950 text-white" value={employees.filter((item) => item.status === 'Active').length} label="Active staff" />
            <StatCard className="bg-slate-950 text-white" value={employees.filter((item) => item.shift).length} label="Shift assigned" />
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-400">Loading employees…</div>
            ) : (
              <EmployeeTable
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelect={setSelectedEmployee}
                onEdit={(employee) => {
                  setEditingEmployee(employee);
                  setSelectedEmployee(employee);
                }}
                onDeactivate={handleDeactivate}
              />
            )}
            <EmployeeCard employee={selectedEmployee} />
          </div>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleSave}
            onCancel={() => setEditingEmployee(null)}
            saving={saving}
          />
        </div>
      </Container>
    </main>
  );
}
