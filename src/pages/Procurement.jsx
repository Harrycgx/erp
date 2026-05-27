import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import { fetchPurchaseOrders } from "../services/procurementService";

const procurementColumns = [
  {
    key: "po_number",
    label: "PO Number",
  },
  {
    key: "vendor_name",
    label: "Vendor",
  },
  {
    key: "material_name",
    label: "Material",
  },
  {
    key: "quantity",
    label: "Quantity",
  },
  {
    key: "unit_price",
    label: "Unit Price",
  },
  {
    key: "total_amount",
    label: "Amount",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function Procurement() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  useEffect(() => {
    async function loadPurchaseOrders() {
      try {
        const result = await fetchPurchaseOrders();

        if (result.data) {
          setPurchaseOrders(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadPurchaseOrders();
  }, []);

  const totalProcurement = purchaseOrders.reduce(
    (sum, po) =>
      sum + Number(po.total_amount || 0),
    0
  );

  const pendingOrders = purchaseOrders.filter(
    (po) => po.status === "pending"
  );

  return (
    <PageContainer
      title="Procurement"
      subtitle="Manage paper purchases, vendors and procurement operations."
    >
      {/* PROCUREMENT KPI */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Purchase Orders
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {purchaseOrders.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Pending Orders
          </p>

          <h2 className="mt-4 text-5xl font-black text-red-400">
            {pendingOrders.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Procurement Value
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            ₹{totalProcurement.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* PROCUREMENT TABLE */}
      <DataTable
        columns={procurementColumns}
        data={purchaseOrders}
      />
    </PageContainer>
  );
}