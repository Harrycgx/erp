import {
  useEffect,
  useState,
} from "react";

import PageContainer from "../components/ui/PageContainer";



import DataTable from "../components/tables/DataTable";

import { useNavigate } from "react-router-dom";

import {
  fetchCustomers,
} from "../services/customerService";

const columns = [
  {
    key: "customer_code",
    label: "Code",
  },
  {
    key: "company_name",
    label: "Company",
  },
  {
    key: "contact_person",
    label: "Contact",
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "outstanding_amount",
    label: "Outstanding",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] =
    useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const result =
        await fetchCustomers();

      if (result.data) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }
  

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.status ===
        "active"
    );

  const outstandingAmount =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.outstanding_amount ||
            0
        ),
      0
    );

  return (
    <PageContainer
      title="Customers"
      subtitle="Manage customer relationships and account activity."
    >
      {/* KPI CARDS */}
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Customers
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {customers.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Active Customers
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {
              activeCustomers.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Outstanding Amount
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            ₹
            {outstandingAmount.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <DataTable
  columns={columns}
  data={customers}
  onRowClick={(customer) =>
    navigate(
      `/customers/${customer.id}`
    )
  }
/>
    </PageContainer>
  );
}