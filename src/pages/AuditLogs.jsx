import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";

import {
  fetchAuditLogs,
} from "../services/auditLogService";

const columns = [
  {
    key: "action",
    label: "Action",
  },
  {
    key: "entity_type",
    label: "Entity",
  },
  {
    key: "entity_id",
    label: "Record ID",
  },
  {
    key: "created_at",
    label: "Created",
  },
];

export default function AuditLogs() {
  const [logs, setLogs] =
    useState([]);

  async function loadLogs() {
    const result =
      await fetchAuditLogs();

    if (result.data) {
      setLogs(result.data);
    }
  }

  useEffect(() => {
    loadLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer
      title="Audit Logs"
      subtitle="Track every critical ERP activity."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Total Events
          </p>

          <h2 className="mt-4 text-5xl font-black text-blue-400">
            {logs.length}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Entity Types
          </p>

          <h2 className="mt-4 text-5xl font-black text-orange-400">
            {
              new Set(
                logs.map(
                  (log) =>
                    log.entity_type
                )
              ).size
            }
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
          <p className="text-slate-400">
            Recent Events
          </p>

          <h2 className="mt-4 text-5xl font-black text-green-400">
            {
              logs.slice(
                0,
                10
              ).length
            }
          </h2>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
      />
    </PageContainer>
  );
}