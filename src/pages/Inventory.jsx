import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import { fetchInventoryItems } from "../services/inventoryService";

const inventoryColumns = [
  {
    key: "material_code",
    label: "Material Code",
  },
  {
    key: "material_name",
    label: "Material",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "gsm",
    label: "GSM",
  },
  {
    key: "current_stock",
    label: "Stock",
  },
  {
    key: "minimum_stock",
    label: "Min Stock",
  },
  {
    key: "warehouse_location",
    label: "Warehouse",
  },
];

export default function Inventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadInventory() {
      try {
        const result = await fetchInventoryItems();

        if (result.data) {
          setItems(result.data);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadInventory();
  }, []);

  const lowStockItems = items.filter(
    (item) =>
      Number(item.current_stock) <=
      Number(item.minimum_stock)
  );

  const totalStock = items.reduce(
    (sum, item) =>
      sum + Number(item.current_stock || 0),
    0
  );

  return (
    <PageContainer
      title="Inventory"
      subtitle="Track paper rolls, consumables, warehouse stock and material availability."
    >
      {/* INVENTORY KPI */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Inventory Items
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {items.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Low Stock Alerts
          </p>

          <h2 className="mt-4 text-5xl font-black text-red-400">
            {lowStockItems.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Stock
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {totalStock}
          </h2>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <DataTable
        columns={inventoryColumns}
        data={items}
      />
    </PageContainer>
  );
}