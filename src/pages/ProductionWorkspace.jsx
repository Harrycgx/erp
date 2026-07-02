import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import ERPTable from "../components/ui/ERPTable";
import SearchBar from "../components/ui/SearchBar";
import KPIStrip from "../components/ui/KPIStrip";
import ActionDrawer from "../components/ui/ActionDrawer";

export default function ProductionWorkspace() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadProductionData();
  }, []);

  async function loadProductionData() {
    const { data, error } = await supabase
      .from("production_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setJobs(data || []);
  }

  function openJob(job) {
    setSelectedJob(job);
    setDrawerOpen(true);
  }

  async function startJob(job) {
    if (!job) return;

    const { error } = await supabase
      .from("production_jobs")
      .update({
        status: "In Production",
        actual_start: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (error) {
      console.error(error);
      return;
    }

    await loadProductionData();
    setDrawerOpen(false);
  }

  async function completeJob(job) {
    if (!job) return;

    const { error } = await supabase
      .from("production_jobs")
      .update({
        status: "Completed",
        actual_end: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (error) {
      console.error(error);
      return;
    }

    await loadProductionData();
    setDrawerOpen(false);
  }

  const stats = useMemo(() => {
    const running = jobs.filter(
      (j) =>
        String(j.status).toLowerCase() === "in production" ||
        String(j.status).toLowerCase() === "running"
    ).length;

    const scheduled = jobs.filter(
      (j) => String(j.status).toLowerCase() === "scheduled"
    ).length;

    const completed = jobs.filter(
      (j) => String(j.status).toLowerCase() === "completed"
    ).length;

    const pendingQc = jobs.filter(
      (j) => String(j.qc_status).toLowerCase() === "pending"
    ).length;

    return {
      running,
      scheduled,
      completed,
      pendingQc,
      total: jobs.length,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      `${job.job_number} ${job.customer_name} ${job.box_type}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [jobs, search]);

  return (
    <>
      <div className="p-4 space-y-4">
        <KPIStrip
          items={[
            { label: "Running", value: stats.running },
            { label: "Scheduled", value: stats.scheduled },
            { label: "Completed", value: stats.completed },
            { label: "Pending QC", value: stats.pendingQc },
            { label: "Total Jobs", value: stats.total },
          ]}
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Main Table */}
          <div className="col-span-12 xl:col-span-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Production Queue
              </h2>

              <SearchBar
                placeholder="Search jobs..."
                onSearch={setSearch}
              />
            </div>

            <ERPTable
              columns={[
                {
                  key: "job_number",
                  label: "Job #",
                },
                {
                  key: "customer_name",
                  label: "Customer",
                },
                {
                  key: "box_type",
                  label: "Box Type",
                },
                {
                  key: "quantity",
                  label: "Qty",
                },
                {
                  key: "status",
                  label: "Status",
                },
                {
                  key: "qc_status",
                  label: "QC",
                },
              ]}
              data={filteredJobs}
              onRowClick={openJob}
            />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 xl:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
                Production Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Running Jobs</span>
                  <span>{stats.running}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled</span>
                  <span>{stats.scheduled}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Completed</span>
                  <span>{stats.completed}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Pending QC</span>
                  <span>{stats.pendingQc}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
                Manufacturing Cost
              </h3>

              <div className="text-sm text-slate-400">
                Waste tracking and material cost analysis will appear here as
                production history grows.
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedJob?.job_number || "Production Job"}
        actions={[
          {
            label: "Start Job",
            variant: "primary",
            onClick: () => startJob(selectedJob),
          },
          {
            label: "Complete Job",
            variant: "success",
            onClick: () => completeJob(selectedJob),
          },
        ]}
      >
        {selectedJob && (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500">Customer</div>
              <div>{selectedJob.customer_name}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Product</div>
              <div>{selectedJob.box_type}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Quantity</div>
              <div>{selectedJob.quantity}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div>{selectedJob.status}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">QC Status</div>
              <div>{selectedJob.qc_status}</div>
            </div>
          </div>
        )}
      </ActionDrawer>
    </>
  );
}