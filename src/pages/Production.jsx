import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import StatusBadge from "../components/ui/StatusBadge";

import {
  addInventoryMovement,
} from "../services/inventory/inventoryService";

import {
  fetchProductionJobs,
  updateProductionJob,
} from "../services/production/productionService";

const stages = [
  "pending",
  "cutting",
  "printing",
  "assembly",
  "qc",
  "completed",
];

export default function Production() {
  const [jobs, setJobs] =
    useState([]);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    const data =
      await fetchProductionJobs();

    setJobs(data || []);
  }

  async function moveStage(job) {
    const currentIndex =
      stages.indexOf(job.stage);

    const nextStage =
      stages[currentIndex + 1];

    if (!nextStage) {
      return;
    }

    await updateProductionJob(
      job.id,
      {
        stage: nextStage,
      }
    );
    if (nextStage === "cutting") {
  await addInventoryMovement({
    material_name:
      "Kraft Paper",

    movement_type:
      "production_usage",

    quantity:
      -job.quantity,

    reference_number:
      job.quotation_number,

    notes:
      "Production consumption",
  });
}

    loadJobs();
  }

  return (
    <PageContainer
      title="Production"
      subtitle="Manufacturing execution and workflow tracking."
    >
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="
              rounded-2xl
              border border-white/10
              bg-white/5
              p-5
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {job.job_name}
                </h3>

                <p className="text-sm text-slate-400">
                  {job.customer_name}
                </p>
              </div>

              <StatusBadge
                status={job.stage}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-300">
                Qty: {job.quantity}
              </div>

              {job.stage !==
                "completed" && (
                <button
                  onClick={() =>
                    moveStage(job)
                  }
                  className="
                    rounded-xl
                    bg-orange-500
                    px-4 py-2
                    text-sm font-medium
                    text-white
                  "
                >
                  Move Forward
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}