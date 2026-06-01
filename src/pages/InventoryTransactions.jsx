import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import supabase from "../lib/supabase";

import {
  addInventoryMovement,
} from "../services/inventory/inventoryService";

export default function InventoryTransactions() {
  const [materials, setMaterials] =
    useState([]);

  const [materialId, setMaterialId] =
    useState("");

  const [movementType, setMovementType] =
    useState("receipt");

  const [quantity, setQuantity] =
    useState("");

  const [reference, setReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  async function loadMaterials() {
    const { data } =
      await supabase
        .from("inventory_items")
        .select("*")
        .order(
          "material_name"
        );

    setMaterials(data || []);
  }

  async function submitTransaction() {
    if (
      !materialId ||
      !quantity
    ) {
      return;
    }

    const material =
      materials.find(
        (m) =>
          String(m.id) ===
          String(materialId)
      );

    if (!material) {
      return;
    }

    const qty =
      Number(quantity);

    const signedQty =
      movementType ===
      "issue"
        ? -qty
        : qty;

    const newStock =
      Number(
        material.current_stock ||
          0
      ) + signedQty;

    if (
      movementType ===
        "issue" &&
      newStock < 0
    ) {
      alert(
        "Insufficient stock"
      );
      return;
    }

    const { error } =
      await supabase
        .from(
          "inventory_items"
        )
        .update({
          current_stock:
            newStock,
        })
        .eq(
          "id",
          material.id
        );

    if (error) {
      console.error(error);
      return;
    }

    await addInventoryMovement({
      material_name:
        material.material_name,

      movement_type:
        movementType,

      quantity:
        signedQty,

      reference_number:
        reference,

      notes,
    });

    alert(
      "Transaction saved"
    );

    setQuantity("");
    setReference("");
    setNotes("");

    loadMaterials();
  }

  return (
    <PageContainer
      title="Inventory Transactions"
      subtitle="Receive and issue stock."
    >
      <div className="rounded-3xl bg-white/5 p-6">

        <div className="grid gap-4 md:grid-cols-2">

          <select
            value={materialId}
            onChange={(e) =>
              setMaterialId(
                e.target.value
              )
            }
            className="rounded-xl bg-black/30 p-3 text-white"
          >
            <option value="">
              Select Material
            </option>

            {materials.map(
              (material) => (
                <option
                  key={
                    material.id
                  }
                  value={
                    material.id
                  }
                >
                  {
                    material.material_name
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              movementType
            }
            onChange={(e) =>
              setMovementType(
                e.target.value
              )
            }
            className="rounded-xl bg-black/30 p-3 text-white"
          >
            <option value="receipt">
              Receive Stock
            </option>

            <option value="issue">
              Issue Stock
            </option>
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              setQuantity(
                e.target.value
              )
            }
            placeholder="Quantity"
            className="rounded-xl bg-black/30 p-3 text-white"
          />

          <input
            value={reference}
            onChange={(e) =>
              setReference(
                e.target.value
              )
            }
            placeholder="Reference Number"
            className="rounded-xl bg-black/30 p-3 text-white"
          />

        </div>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(
              e.target.value
            )
          }
          placeholder="Notes"
          className="
            mt-4
            h-28
            w-full
            rounded-xl
            bg-black/30
            p-3
            text-white
          "
        />

        <button
          onClick={
            submitTransaction
          }
          className="
            mt-4
            rounded-xl
            bg-green-500
            px-6
            py-3
            text-white
          "
        >
          Save Transaction
        </button>

      </div>
    </PageContainer>
  );
}