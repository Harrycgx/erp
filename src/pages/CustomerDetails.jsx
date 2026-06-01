import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import PageContainer from "../components/ui/PageContainer";

import supabase from "../lib/supabase";

export default function CustomerDetails() {
  const { id } = useParams();

  const [customer, setCustomer] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    const {
      data: customerData,
    } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    setCustomer(customerData);

    const {
      data: orderData,
    } = await supabase
      .from("orders")
      .select("*")
      .eq(
        "customer_name",
        customerData?.company_name
      );

    setOrders(orderData || []);

    const {
      data: invoiceData,
    } = await supabase
      .from("invoices")
      .select("*")
      .eq(
        "customer_name",
        customerData?.company_name
      );

    setInvoices(
      invoiceData || []
    );
  }

  if (!customer) {
    return (
      <PageContainer title="Customer">
        Loading...
      </PageContainer>
    );
  }

  const totalRevenue =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.invoice_amount || 0
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

  return (
    <PageContainer
      title={customer.company_name}
      subtitle="Customer 360 View"
    >
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Orders
          </p>

          <h2 className="mt-2 text-4xl font-bold text-white">
            {orders.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Invoices
          </p>

          <h2 className="mt-2 text-4xl font-bold text-white">
            {invoices.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Revenue
          </p>

          <h2 className="mt-2 text-4xl font-bold text-green-400">
            ₹
            {totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Outstanding
          </p>

          <h2 className="mt-2 text-4xl font-bold text-red-400">
            ₹
            {totalDue.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white/5 p-6">
        <h3 className="text-xl font-bold text-white">
          Contact Information
        </h3>

        <div className="mt-4 space-y-2 text-slate-300">
          <p>
            Contact:
            {" "}
            {customer.contact_person}
          </p>

          <p>
            Email:
            {" "}
            {customer.email}
          </p>

          <p>
            Phone:
            {" "}
            {customer.phone}
          </p>

          <p>
            Address:
            {" "}
            {customer.address}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}