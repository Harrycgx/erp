import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  addInventoryMovement,
} from "../services/inventory/inventoryService";

import {
  fetchProductionJobs,
  updateProductionJob,
} from "../services/production/productionService";

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

  async function moveStage(
    job,
    nextStage
  ) {

    await updateProductionJob(
      job.id,
      {
        stage: nextStage,
      }
    );

    // Auto deduct inventory
    if (
      nextStage === "cutting"
    ) {

      await addInventoryMovement({

        material_name:
          "Kraft Paper",

        movement_type:
          "production_usage",

        quantity:
          -job.quantity,

        reference_number:
          job.quotation_number,
      });
    }

    loadJobs();
  }

  return (
    <PageContainer
      title="Production"
      subtitle="Manufacturing execution and workflow tracking."
    >

      <div className="space-y-4">

        {jobs.length === 0 && (
          <div
            className="
              rounded-2xl
              border border-dashed
              border-white/10
              p-10 text-center
              text-slate-400
            "
          >
            No production jobs yet.
          </div>
        )}

        {jobs.map((job) => (

          <div
            key={job.id}
            className="
              rounded-2xl
              bg-white/5
              p-5
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-lg font-semibold text-white">
                  {job.quotation_number}
                </h3>

                <p className="text-sm text-slate-400">
                  Stage: {job.stage}
                </p>

              </div>

              <div className="text-right">

                <p className="text-white font-bold">
                  Qty: {job.quantity}
                </p>

              </div>

            </div>

            <div className="mt-4 flex gap-3">

              {job.stage ===
                "planning" && (

                <button
                  onClick={() =>
                    moveStage(
                      job,
                      "cutting"
                    )
                  }
                  className="
                    rounded-xl
                    bg-blue-500
                    px-4 py-2
                    text-sm text-white
                  "
                >
                  Start Cutting
                </button>
              )}

              {job.stage ===
                "cutting" && (

                <button
                  onClick={() =>
                    moveStage(
                      job,
                      "printing"
                    )
                  }
                  className="
                    rounded-xl
                    bg-orange-500
                    px-4 py-2
                    text-sm text-white
                  "
                >
                  Move To Printing
                </button>
              )}

              {job.stage ===
                "printing" && (

                <button
                  onClick={() =>
                    moveStage(
                      job,
                      "completed"
                    )
                  }
                  className="
                    rounded-xl
                    bg-green-500
                    px-4 py-2
                    text-sm text-white
                  "
                >
                  Complete Job
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

    </PageContainer>
  );
}