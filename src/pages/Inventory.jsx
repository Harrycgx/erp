import {
  useEffect,
  useState,
} from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  createInventoryItem,
} from "../modules/inventory/services/inventoryLedgerService";

import supabase from "../lib/supabase";

export default function Inventory() {
  const [itemName, setItemName] =
    useState("");

  const [category, setCategory] =
    useState("Paper");

  const [unit, setUnit] =
    useState("Kg");

  const [stock, setStock] =
    useState("");

  const [items, setItems] =
    useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data, error } =
      await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (!error) {
      setItems(data || []);
    }
  }

  async function createItem() {
    if (!itemName) return;

    await createInventoryItem({
      material_code:
        "MAT-" + Date.now(),

      material_name:
        itemName,

      category,

      unit,

      quantity:
        Number(stock) || 0,

      current_stock:
        Number(stock) || 0,
    });

    setItemName("");
    setStock("");
    setCategory("Paper");
    setUnit("Kg");

    await loadItems();
  }

  const totalItems =
    items.length;

  const totalStock =
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.current_stock || 0
        ),
      0
    );

  return (
    <PageContainer
      title="Inventory"
      subtitle="Inventory Ledger & Stock Control"
    >
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Total Materials
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {totalItems}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Total Stock
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {totalStock}
          </h2>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-5">

        <input
          value={itemName}
          onChange={(e) =>
            setItemName(
              e.target.value
            )
          }
          placeholder="Material Name"
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            px-4 py-2
            text-white
          "
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value
            )
          }
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            px-4 py-2
            text-white
          "
        >
          <option value="Paper">
            Paper
          </option>

          <option value="Ink">
            Ink
          </option>

          <option value="Glue">
            Glue
          </option>

          <option value="Chemical">
            Chemical
          </option>
        </select>

        <select
          value={unit}
          onChange={(e) =>
            setUnit(
              e.target.value
            )
          }
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            px-4 py-2
            text-white
          "
        >
          <option value="Kg">
            Kg
          </option>

          <option value="Litre">
            Litre
          </option>

          <option value="Piece">
            Piece
          </option>
        </select>

        <input
          type="number"
          value={stock}
          onChange={(e) =>
            setStock(
              e.target.value
            )
          }
          placeholder="Stock"
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            px-4 py-2
            text-white
          "
        />

        <button
          onClick={createItem}
          className="
            rounded-xl
            bg-blue-500
            px-4 py-2
            text-white
          "
        >
          Add Material
        </button>

      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="
              rounded-2xl
              bg-white/5
              p-5
            "
          >
            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-bold text-white">
                  {item.material_name}
                </h2>

                <p className="text-slate-400">
                  Code: {item.material_code}
                </p>

                <p className="text-slate-400">
                  Category: {item.category}
                </p>

                <p className="text-slate-400">
                  Unit: {item.unit}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Current Stock
                </p>

                <p className="text-2xl font-bold text-green-400">
                  {item.current_stock || 0}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}