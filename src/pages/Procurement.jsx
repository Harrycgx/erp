import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import {
  fetchPurchaseOrders,
} from "../services/procurementService";

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
  const [
    purchaseOrders,
    setPurchaseOrders,
  ] = useState([]);

  async function loadPurchaseOrders() {
    try {
      const result =
        await fetchPurchaseOrders();

      if (result.data) {
        setPurchaseOrders(
          result.data
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const totalProcurement =
    purchaseOrders.reduce(
      (sum, po) =>
        sum +
        Number(
          po.total_amount || 0
        ),
      0
    );

  const pendingOrders =
    purchaseOrders.filter(
      (po) =>
        po.status ===
        "pending"
    );

  const approvedOrders =
    purchaseOrders.filter(
      (po) =>
        po.status ===
        "approved"
    );

  const completedOrders =
    purchaseOrders.filter(
      (po) =>
        po.status ===
          "received" ||
        po.status ===
          "completed"
    );

  return (
    <PageContainer
      title="Procurement"
      subtitle="Manage paper purchases, vendors and procurement operations."
    >
      {/* KPI CARDS */}

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Purchase Orders
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {
              purchaseOrders.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Pending Orders
          </p>

          <h2 className="mt-4 text-5xl font-black text-red-400">
            {
              pendingOrders.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Approved Orders
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {
              approvedOrders.length
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Procurement Value
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            ₹
            {totalProcurement.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Orders Awaiting Receipt
          </p>

          <h3 className="mt-3 text-3xl font-bold text-orange-400">
            {
              approvedOrders.length
            }
          </h3>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Material Received
          </p>

          <h3 className="mt-3 text-3xl font-bold text-green-400">
            {
              completedOrders.length
            }
          </h3>
        </div>
      </div>

      {/* TABLE */}

      <DataTable
        columns={
          procurementColumns
        }
        data={purchaseOrders}
      />
    </PageContainer>
  );
}