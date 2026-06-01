import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import { useNavigate } from "react-router-dom";

import { fetchOrders } from "../services/orderService";

const orderColumns = [
  {
    key: "order_number",
    label: "Order No",
  },
  {
    key: "customer_name",
    label: "Customer",
  },
  {
    key: "box_type",
    label: "Box Type",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "total_amount",
    label: "Amount",
  },
  {
    key: "production_status",
    label: "Production",
  },
  {
    key: "payment_status",
    label: "Payment",
  },
];

export default function Orders() {
  const [orders, setOrders] =
    useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const result =
        await fetchOrders();

      if (result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const totalOrders =
    orders.length;

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount || 0
        ),
      0
    );

  const pendingProduction =
    orders.filter(
      (order) =>
        order.production_status !==
        "completed"
    ).length;

  const unpaidOrders =
    orders.filter(
      (order) =>
        order.payment_status !==
        "paid"
    ).length;

  return (
    <PageContainer
      title="Orders"
      subtitle="Track customer orders, production status and payment workflow."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Total Orders
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {totalOrders}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Revenue
          </p>

          <h2 className="mt-3 text-4xl font-bold text-green-400">
            ₹
            {totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Pending Production
          </p>

          <h2 className="mt-3 text-4xl font-bold text-orange-400">
            {pendingProduction}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Unpaid Orders
          </p>

          <h2 className="mt-3 text-4xl font-bold text-red-400">
            {unpaidOrders}
          </h2>
        </div>
      </div>

      <DataTable
  columns={orderColumns}
  data={orders}
  onRowClick={(order) =>
    navigate(
      `/orders/${order.id}`
    )
  }
/>
    </PageContainer>
  );
}