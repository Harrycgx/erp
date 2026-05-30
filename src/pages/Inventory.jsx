import {
  useEffect,
  useState,
} from "react";

import PageContainer
from "../components/ui/PageContainer";

import {

  createInventoryItem,

  fetchInventoryHistory,

  getInventoryBalance,

} from "../modules/inventory/services/inventoryLedgerService";

export default function Inventory() {

  const [itemName,
    setItemName] =
    useState("");

  const [items,
    setItems] =
    useState([]);

  async function
  createItem() {

    if (!itemName) {
      return;
    }

    const item =
      await createInventoryItem({

        sku:
          "SKU-" +
          Date.now(),

        material_name:
          itemName,

        category:
          "Paper",

        unit:
          "kg",
      });

    setItems((prev) => [
      ...prev,
      item,
    ]);

    setItemName("");
  }

  return (
    <PageContainer
      title="Inventory"
      subtitle="Inventory ledger system"
    >

      <div className="mb-6 flex gap-4">

        <input
          value={itemName}

          onChange={(e) =>
            setItemName(
              e.target.value
            )
          }

          placeholder="Material name"

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

            <h2 className="text-white font-bold">
              {item.material_name}
            </h2>

            <p className="text-slate-400">
              SKU: {item.sku}
            </p>

          </div>

        ))}

      </div>

    </PageContainer>
  );
}