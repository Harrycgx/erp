import { useCallback, useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { fetchProductionJobs } from "../services/productionService";

import PageContainer from "../components/ui/PageContainer";
import KPIStrip from "../components/ui/KPIStrip";
import ERPTable from "../components/ui/ERPTable";
import SearchBar from "../components/ui/SearchBar";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    orders: 0,
    quotations: 0,
    dispatches: 0,
    jobs: 0,
    lowStock: 0,
  });

  const loadDashboard = useCallback(async () => {
    try {
      const [
        jobsRes,
        quotationsRes,
        ordersRes,
        dispatchRes,
      ] = await Promise.all([
        fetchProductionJobs(),

        supabase
          .from("quotations")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("dispatches")
          .select("*", { count: "exact", head: true }),
      ]);

      const jobsData = Array.isArray(jobsRes)
        ? jobsRes
        : jobsRes?.data || [];

      setJobs(jobsData);

      setStats({
        orders: ordersRes.count || 0,
        quotations: quotationsRes.count || 0,
        dispatches: dispatchRes.count || 0,
        jobs: jobsData.length || 0,
        lowStock: 0,
      });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Dashboard data resolves asynchronously before state updates.
    loadDashboard();
  }, [loadDashboard]);

  const filteredJobs = jobs.filter((job) =>
    JSON.stringify(job)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <PageContainer>

     <KPIStrip
  items={[
    { label: "Orders", value: stats.orders },
    { label: "Quotes", value: stats.quotations },
    { label: "Jobs", value: stats.jobs }
  ]}
/>

      <div className="grid grid-cols-12 gap-4">

        {/* LEFT SIDE */}

        <div className="col-span-12 lg:col-span-8 space-y-4">

          <div className="flex justify-between items-center">

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
                label: "Job",
              },
              {
                key: "customer_name",
                label: "Customer",
              },
              {
                key: "box_type",
                label: "Product",
              },
              {
                key: "quantity",
                label: "Qty",
              },
              {
                key: "status",
                label: "Status",
              },
            ]}
            data={filteredJobs}
          />

        </div>

        {/* RIGHT SIDE */}

        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Alerts */}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">

            <div className="text-xs uppercase tracking-widest text-red-400 font-bold mb-3">
              Critical Alerts
            </div>

            <div className="space-y-3 text-sm">

              <div className="border-l-2 border-red-500 pl-3">
                Review delayed production jobs
              </div>

              <div className="border-l-2 border-amber-500 pl-3">
                Check inventory reorder levels
              </div>

              <div className="border-l-2 border-blue-500 pl-3">
                Verify pending dispatches
              </div>

            </div>

          </div>

          {/* Actions */}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">

            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
              Today's Actions
            </div>

            <div className="space-y-2">

              <button className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 text-sm">
                Create Quotation
              </button>

              <button className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 text-sm">
                Create Order
              </button>

              <button className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 text-sm">
                Schedule Production
              </button>

              <button className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-md px-3 py-2 text-sm">
                Create Dispatch
              </button>

            </div>

          </div>

          {/* Quick Stats */}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">

            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
              Operations
            </div>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Active Jobs
                </span>
                <span>{stats.jobs}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Orders
                </span>
                <span>{stats.orders}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Dispatches
                </span>
                <span>{stats.dispatches}</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </PageContainer>
  );
}
