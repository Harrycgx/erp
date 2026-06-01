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

        notes:
          "Auto inventory deduction from production",
      });
    }

    await loadJobs();
  }

  const totalJobs =
    jobs.length;

  const completedJobs =
    jobs.filter(
      (job) =>
        job.stage ===
        "completed"
    ).length;

  const activeJobs =
    jobs.filter(
      (job) =>
        job.stage !==
        "completed"
    ).length;

  const completionRate =
    totalJobs === 0
      ? 0
      : Math.round(
          (completedJobs /
            totalJobs) *
            100
        );

  function getStageColor(
    stage
  ) {
    switch (stage) {
      case "planning":
        return "bg-slate-500";

      case "cutting":
        return "bg-blue-500";

      case "printing":
        return "bg-orange-500";

      case "completed":
        return "bg-green-500";

      default:
        return "bg-slate-500";
    }
  }

  return (
    <PageContainer
      title="Production Control Board"
      subtitle="Monitor manufacturing jobs and production workflow."
    >
      <div className="mb-8 grid gap-6 md:grid-cols-4">

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Total Jobs
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {totalJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Active Jobs
          </p>

          <h2 className="mt-3 text-4xl font-black text-orange-400">
            {activeJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Completed
          </p>

          <h2 className="mt-3 text-4xl font-black text-green-400">
            {completedJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-slate-400">
            Efficiency
          </p>

          <h2 className="mt-3 text-4xl font-black text-cyan-400">
            {completionRate}%
          </h2>
        </div>

      </div>

      <div className="space-y-5">

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
            No production jobs found.
          </div>
        )}

        {jobs.map((job) => (

          <div
            key={job.id}
            className="
              rounded-3xl
              border border-white/10
              bg-white/5
              p-6
            "
          >

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold text-white">
                  {job.quotation_number}
                </h3>

                <p className="text-slate-400">
                  Production Quantity: {job.quantity}
                </p>
              </div>

              <div className="flex items-center gap-3">

                <div
                  className={`h-3 w-3 rounded-full ${getStageColor(job.stage)}`}
                />

                <span className="text-white capitalize">
                  {job.stage}
                </span>

              </div>

            </div>

            <div className="mb-4">

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className={`h-full ${
                    job.stage === "planning"
                      ? "w-[25%] bg-slate-500"
                      : job.stage === "cutting"
                      ? "w-[50%] bg-blue-500"
                      : job.stage === "printing"
                      ? "w-[75%] bg-orange-500"
                      : "w-full bg-green-500"
                  }`}
                />

              </div>

            </div>

            <div className="flex gap-3">

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
                    text-white
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
                    text-white
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
                    text-white
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