import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import supabase from "../lib/supabase";

const dispatchColumns = [
  {
    key: "dispatch_number",
    label: "Dispatch No",
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
    key: "vehicle_number",
    label: "Vehicle",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function Dispatch() {
  const [dispatches, setDispatches] =
    useState([]);

  useEffect(() => {
    loadDispatches();
  }, []);

  async function loadDispatches() {
    const { data, error } =
      await supabase
        .from("dispatches")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      return;
    }

    setDispatches(data || []);
  }

  async function markDelivered(
    dispatch
  ) {
    await supabase
      .from("dispatches")
      .update({
        status: "delivered",
      })
      .eq("id", dispatch.id);

    const invoiceNumber =
      "INV-" + Date.now();

    await supabase
      .from("invoices")
      .insert([
        {
          invoice_number:
            invoiceNumber,

          customer_name:
            dispatch.customer_name,

          order_number:
            dispatch.order_number,

          invoice_amount:
            1000,

          paid_amount: 0,

          due_amount: 1000,

          payment_status:
            "pending",
        },
      ]);

    loadDispatches();
  }

  const totalDispatches =
    dispatches.length;

  const deliveredDispatches =
    dispatches.filter(
      (item) =>
        item.status ===
        "delivered"
    );

  const pendingDispatches =
    dispatches.filter(
      (item) =>
        item.status !==
        "delivered"
    );

  return (
    <PageContainer
      title="Dispatch"
      subtitle="Shipment tracking and delivery operations."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Dispatches
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {totalDispatches}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Delivered
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {
              deliveredDispatches.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Pending
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {
              pendingDispatches.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Delivery Rate
          </p>

          <h2 className="mt-4 text-5xl font-black text-purple-400">
            {totalDispatches
              ? Math.round(
                  (deliveredDispatches.length /
                    totalDispatches) *
                    100
                )
              : 0}
            %
          </h2>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {pendingDispatches.map(
          (dispatch) => (
            <button
              key={dispatch.id}
              onClick={() =>
                markDelivered(
                  dispatch
                )
              }
              className="
                rounded-xl
                bg-green-500
                px-4 py-2
                text-white
              "
            >
              Deliver{" "}
              {
                dispatch.dispatch_number
              }
            </button>
          )
        )}
      </div>

      <DataTable
        columns={dispatchColumns}
        data={dispatches}
      />
    </PageContainer>
  );
}