import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import PageContainer from "../components/ui/PageContainer";

import supabase from "../lib/supabase";

export default function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function loadOrder() {
    const { data, error } =
      await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);
      return;
    }

    setOrder(data);
  }

  if (!order) {
    return (
      <PageContainer
        title="Order Details"
      >
        Loading...
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={order.order_number}
      subtitle="Order 360 View"
    >
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Quantity
          </p>

          <h2 className="mt-2 text-4xl font-bold text-white">
            {order.quantity}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Order Value
          </p>

          <h2 className="mt-2 text-4xl font-bold text-green-400">
            ₹
            {Number(
              order.total_amount || 0
            ).toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Production
          </p>

          <h2 className="mt-2 text-2xl font-bold text-orange-400">
            {
              order.production_status
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Payment
          </p>

          <h2 className="mt-2 text-2xl font-bold text-blue-400">
            {
              order.payment_status
            }
          </h2>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white/5 p-6">
        <h3 className="text-xl font-bold text-white">
          Order Information
        </h3>

        <div className="mt-4 space-y-3 text-slate-300">
          <p>
            Customer:
            {" "}
            {order.customer_name}
          </p>

          <p>
            Order Number:
            {" "}
            {order.order_number}
          </p>

          <p>
            Quotation:
            {" "}
            {order.quotation_number}
          </p>

          <p>
            Box Type:
            {" "}
            {order.box_type}
          </p>

          <p>
            Dispatch Status:
            {" "}
            {order.dispatch_status}
          </p>

          <p>
            Overall Status:
            {" "}
            {order.status}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}