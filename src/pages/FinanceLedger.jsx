import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  fetchLedgerEntries,
} from "../services/finance/financeService";

export default function FinanceLedger() {
  const [entries, setEntries] =
    useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const data =
      await fetchLedgerEntries();

    setEntries(data);
  }

  return (
    <PageContainer
      title="Finance Ledger"
      subtitle="Immutable accounting transaction records."
    >
      <div className="space-y-4">
        {entries.map((entry) => (
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
                    entry.account_name
                  }
                </h3>

                <p className="text-sm text-slate-400">
                  {
                    entry.entry_type
                  }
                </p>
              </div>

              <div
                className={`
                  text-lg font-bold

                  ${
                    entry.entry_type ===
                    "credit"
                      ? "text-green-400"
                      : "text-orange-400"
                  }
                `}
              >
                ₹{entry.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
