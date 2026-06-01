import { useState } from "react";

import Papa from "papaparse";

import PageContainer from "../components/ui/PageContainer";

import {
  uploadQuotationImport,
} from "../services/import/importService";

export default function ImportCenter() {
  const [loading, setLoading] =
    useState(false);

  const [importStats,
    setImportStats] =
    useState(null);

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

      skipEmptyLines: true,

      complete: async (
        results
      ) => {
        try {
          const validRows =
            results.data.filter(
              (row) =>
                Object.values(
                  row
                ).some(
                  (value) =>
                    value !==
                    ""
                )
            );

          const batchId =
            "BATCH-" +
            Date.now();

          await uploadQuotationImport(
            validRows,
            batchId
          );

          setImportStats({
            batchId,
            rows:
              validRows.length,
          });

          alert(
            "Import uploaded successfully"
          );
        } catch (
          error
        ) {
          console.error(
            error
          );

          alert(
            "Import failed"
          );
        }

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
          border border-dashed
          border-white/20
          bg-white/5
          p-10
        "
      >
        <input
          type="file"
          accept=".csv"
          onChange={
            handleFile
          }
          className="text-white"
        />

        {loading && (
          <p className="mt-4 text-slate-400">
            Processing import...
          </p>
        )}

        {importStats && (
          <div className="mt-6 rounded-xl bg-green-500/10 p-4">
            <p className="text-green-400">
              Import Complete
            </p>

            <p className="mt-2 text-white">
              Batch:
              {" "}
              {
                importStats.batchId
              }
            </p>

            <p className="text-white">
              Rows:
              {" "}
              {
                importStats.rows
              }
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}