import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import { fetchInvoices } from "../services/financeService";

const financeColumns = [
  {
    key: "invoice_number",
    label: "Invoice No",
  },
  {
    key: "customer_name",
    label: "Customer",
  },
  {
    key: "order_number",
    label: "Order No",
  },
  {
    key: "invoice_amount",
    label: "Invoice Amount",
  },
  {
    key: "paid_amount",
    label: "Paid",
  },
  {
    key: "due_amount",
    label: "Due",
  },
  {
    key: "payment_status",
    label: "Payment Status",
  },
];

export default function Finance() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const result = await fetchInvoices();

        if (result.data) {
          setInvoices(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadInvoices();
  }, []);

  const totalRevenue = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.invoice_amount || 0),
    0
  );

  const totalDue = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.due_amount || 0),
    0
  );

  const pendingPayments = invoices.filter(
    (invoice) =>
      invoice.payment_status !== "paid"
  );

  return (
    <PageContainer
      title="Finance"
      subtitle="Track invoices, receivables, payment collection and financial operations."
    >
      {/* FINANCE KPI */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Revenue
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            ₹{totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Outstanding Due
          </p>

          <h2 className="mt-4 text-5xl font-black text-red-400">
            ₹{totalDue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Pending Payments
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {pendingPayments.length}
          </h2>
        </div>
      </div>

      {/* FINANCE TABLE */}
      <DataTable
        columns={financeColumns}
        data={invoices}
      />
    </PageContainer>
  );
}