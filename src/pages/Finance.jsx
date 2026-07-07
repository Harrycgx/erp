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
  const [invoices, setInvoices] =
    useState([]);

  async function loadInvoices() {
    try {
      const result =
        await fetchInvoices();

      if (result.data) {
        setInvoices(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const totalRevenue =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.invoice_amount || 0
        ),
      0
    );

  const totalPaid =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.paid_amount || 0
        ),
      0
    );

  const totalDue =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.due_amount || 0
        ),
      0
    );

  const pendingPayments =
    invoices.filter(
      (invoice) =>
        invoice.payment_status !==
        "paid"
    );

  const paidInvoices =
    invoices.filter(
      (invoice) =>
        invoice.payment_status ===
        "paid"
    );

  return (
    <PageContainer
      title="Finance"
      subtitle="Track invoices, receivables, payment collection and financial operations."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Revenue
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            ₹
            {totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Collected
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            ₹
            {totalPaid.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Outstanding Due
          </p>

          <h2 className="mt-4 text-5xl font-black text-red-400">
            ₹
            {totalDue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Paid Invoices
          </p>

          <h2 className="mt-4 text-5xl font-black text-purple-400">
            {
              paidInvoices.length
            }
          </h2>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Pending Payments
          </p>

          <h3 className="mt-3 text-3xl font-bold text-orange-400">
            {
              pendingPayments.length
            }
          </h3>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Total Invoices
          </p>

          <h3 className="mt-3 text-3xl font-bold text-white">
            {invoices.length}
          </h3>
        </div>
      </div>

      <DataTable
        columns={financeColumns}
        data={invoices}
      />
    </PageContainer>
  );
}