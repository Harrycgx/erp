import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  fetchInventoryLedger,
} from "../services/inventory/inventoryService";

export default function InventoryLedger() {
  const [ledger, setLedger] =
    useState([]);

  useEffect(() => {
    loadLedger();
  }, []);

  async function loadLedger() {
    const data =
      await fetchInventoryLedger();

    setLedger(data);
  }

  return (
    <PageContainer
      title="Inventory Ledger"
      subtitle="Immutable inventory movement tracking."
    >
      <div className="space-y-4">
        {ledger.map((entry) => (
          <div
            key={entry.id}
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              p-4
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  {
                    entry.material_name
                  }
                </h3>

                <p className="text-sm text-slate-400">
                  {
                    entry.movement_type
                  }
                </p>
              </div>

              <div
                className={`
                  text-lg font-bold

                  ${
                    entry.quantity > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                `}
              >
                {entry.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}