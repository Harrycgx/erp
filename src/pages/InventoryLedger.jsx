import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  fetchInventoryLedger,
} from "../services/inventory/inventoryService";

export default function InventoryLedger() {
  const [ledger, setLedger] =
    useState([]);

  const [search, setSearch] =
    useState("");

  async function loadLedger() {
    const data =
      await fetchInventoryLedger();

    setLedger(data || []);
  }

  useEffect(() => {
    loadLedger();
  }, []);

  const filteredLedger =
    ledger.filter((entry) =>
      entry.material_name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  const totalIn =
    ledger
      .filter(
        (entry) =>
          Number(
            entry.quantity
          ) > 0
      )
      .reduce(
        (sum, entry) =>
          sum +
          Number(
            entry.quantity
          ),
        0
      );

  const totalOut =
    ledger
      .filter(
        (entry) =>
          Number(
            entry.quantity
          ) < 0
      )
      .reduce(
        (sum, entry) =>
          sum +
          Math.abs(
            Number(
              entry.quantity
            )
          ),
        0
      );

  return (
    <PageContainer
      title="Inventory Ledger"
      subtitle="Complete inventory movement audit trail."
    >
      {/* KPI */}

      <div className="mb-8 grid gap-6 md:grid-cols-3">

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Entries
          </p>

          <h2 className="mt-3 text-4xl font-black text-blue-400">
            {ledger.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Stock Received
          </p>

          <h2 className="mt-3 text-4xl font-black text-green-400">
            {totalIn}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Stock Consumed
          </p>

          <h2 className="mt-3 text-4xl font-black text-red-400">
            {totalOut}
          </h2>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-6">
        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search material..."
          className="
            w-full
            rounded-xl
            border border-white/10
            bg-white/5
            px-4 py-3
            text-white
          "
        />
      </div>

      {/* LEDGER */}

      <div className="space-y-4">

        {filteredLedger.map(
          (entry) => (
            <div
              key={entry.id}
              className="
                rounded-2xl
                border border-white/10
                bg-white/5
                p-5
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-bold text-white">
                    {
                      entry.material_name
                    }
                  </h3>

                  <p className="text-slate-400">
                    Type:
                    {" "}
                    {
                      entry.movement_type
                    }
                  </p>

                  <p className="text-slate-500 text-sm">
                    Ref:
                    {" "}
                    {
                      entry.reference_number ||
                      "N/A"
                    }
                  </p>

                  <p className="text-slate-500 text-sm">
                    {
                      new Date(
                        entry.created_at
                      ).toLocaleString()
                    }
                  </p>
                </div>

                <div
                  className={`
                    text-3xl
                    font-black

                    ${
                      Number(
                        entry.quantity
                      ) > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  `}
                >
                  {Number(
                    entry.quantity
                  ) > 0
                    ? "+"
                    : ""}
                  {
                    entry.quantity
                  }
                </div>

              </div>
            </div>
          )
        )}

      </div>
    </PageContainer>
  );
}