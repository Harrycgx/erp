import {
  Users,
  IndianRupee,
} from "lucide-react";

import { useEffect, useState } from "react";

import { fetchProductionJobs } from "../services/productionService";

import PageContainer from "../components/ui/PageContainer";

import KpiGrid from "../features/dashboard/KpiGrid";
import LiveProductionFeed from "../features/dashboard/LiveProductionFeed";
import ActivityFeed from "../features/dashboard/ActivityFeed";
import DepartmentStatus from "../features/dashboard/DepartmentStatus";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function loadJobs() {
      try {
        const result = await fetchProductionJobs();

        if (result.data) {
          setJobs(result.data);
        }

        console.log("Production Jobs:", result);
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    }

    loadJobs();
  }, []);

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Monitor production workflows, operational metrics, inventory health and manufacturing activity in real time."
    >
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#0B1020] to-black p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-orange-400">
              Manufacturing ERP Workspace
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-tight text-white">
              Daily Operations Control Center
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-slate-400">
              Track quotations, inventory, production workflows,
              procurement cycles and operational efficiency in real time.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
                <p className="text-sm text-slate-400">
                  Employees Active
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
                  <Users size={24} />
                  48
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
                <p className="text-sm text-slate-400">
                  Monthly Revenue
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-3xl font-bold text-white">
                  <IndianRupee size={24} />
                  12.4L
                </h2>
              </div>
            </div>
          </div>

          {/* ADMIN CARD */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />

              <span className="text-green-400">
                ERP System Online
              </span>
            </div>

            <p className="text-slate-400">
              Signed in as
            </p>

            <h2 className="mt-2 text-4xl font-black text-white">
              Admin
            </h2>

            <p className="mt-1 text-orange-400">
              Full Access Role
            </p>

            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">
                Server Performance
              </p>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-green-500" />
              </div>

              <p className="mt-2 text-sm text-green-400">
                92% Stable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <KpiGrid jobs={jobs} />

      {/* LIVE JOBS */}
      <LiveProductionFeed jobs={jobs} />

      {/* LOWER GRID */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeed />
        <DepartmentStatus />
      </div>
    </PageContainer>
  );
}