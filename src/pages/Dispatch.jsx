import { useEffect, useState } from "react";
import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";
import supabase from "../lib/supabase";

const dispatchColumns = [
  { key: "dispatch_number", label: "Dispatch No" },
  { key: "customer_name", label: "Customer" },
  { key: "order_number", label: "Order No" },
  { key: "vehicle_number", label: "Vehicle" },
  { key: "quantity", label: "Quantity" },
  { key: "status", label: "Status" },
  { key: "delivered_at", label: "Delivered At" },
];

export default function Dispatch() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDispatches();
  }, []);

  async function loadDispatches() {
    const { data, error } = await supabase
      .from("dispatches")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading dispatches:", error);
      return;
    }
    setDispatches(data || []);
  }

  async function markDelivered(dispatch) {
    if (loading) return; // Prevent spam clicking
    setLoading(true);

    const { error } = await supabase.rpc('mark_dispatch_delivered', {
      p_dispatch_id: dispatch.id,
      p_order_number: dispatch.order_number,
      p_customer_name: dispatch.customer_name
    });

    setLoading(false);

    if (error) {
      console.error("Delivery process failed:", error.message);
      alert(`Error: ${error.message}`);
      return;
    }

    await loadDispatches();
  }

  const pendingDispatches = dispatches.filter((item) => item.status !== "delivered");

  return (
    <PageContainer title="Dispatch" subtitle="Shipment tracking and delivery operations.">
      {/* Stats Section */}
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        {/* ... (Keep your existing Stat Cards here) ... */}
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {pendingDispatches.map((dispatch) => (
          <button
            key={dispatch.id}
            disabled={loading}
            onClick={() => markDelivered(dispatch)}
            className={`rounded-xl px-4 py-2 text-white ${loading ? 'bg-gray-500' : 'bg-green-500'}`}
          >
            {loading ? "Processing..." : `Deliver ${dispatch.dispatch_number}`}
          </button>
        ))}
      </div>

      <DataTable columns={dispatchColumns} data={dispatches} />
    </PageContainer>
  );
}