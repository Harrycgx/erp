import { useState } from "react";

import Papa from "papaparse";

import PageContainer from "../components/ui/PageContainer";

import {
  uploadQuotationImport,
} from "../services/import/importService";

export default function ImportCenter() {
  const [loading, setLoading] =
    useState(false);

  async function handleFile(
    event
  ) {
    const file =
      event.target.files[0];

    if (!file) {
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: true,

      complete: async (
        results
      ) => {
        const batchId =
          "BATCH-" + Date.now();

        await uploadQuotationImport(
          results.data,
          batchId
        );

        alert(
          "Import uploaded to staging successfully"
        );

        setLoading(false);
      },
    });
  }

  return (
    <PageContainer
      title="Import Center"
      subtitle="Secure staging imports for ERP data."
    >
      <div
        className="
          rounded-2xl
          border border-dashed border-white/20
          bg-white/5
          p-10
        "
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="text-white"
        />

        {loading && (
          <p className="mt-4 text-slate-400">
            Uploading import...
          </p>
        )}
      </div>
    </PageContainer>
  );
}