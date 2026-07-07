import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import supabase from "../lib/supabase";

const columns = [
  {
    key: "full_name",
    label: "Employee",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "department",
    label: "Department",
  },
  {
    key: "designation",
    label: "Designation",
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function Employees() {
  const [employees, setEmployees] =
    useState([]);

  async function loadEmployees() {
    const { data, error } =
      await supabase
        .from("employees")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      return;
    }

    setEmployees(data || []);
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "active"
    );

  const departments =
    new Set(
      employees.map(
        (employee) =>
          employee.department
      )
    );

  return (
    <PageContainer
      title="Employees"
      subtitle="Employee directory and workforce management."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Employees
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {employees.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Active Employees
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {activeEmployees.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Departments
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {departments.size}
          </h2>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
      />
    </PageContainer>
  );
}