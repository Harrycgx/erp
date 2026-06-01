import {
  Users,
  IndianRupee,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { useEffect, useState } from "react";

import supabase from "../lib/supabase";

import { fetchProductionJobs } from "../services/productionService";

import PageContainer from "../components/ui/PageContainer";

import KpiGrid from "../features/dashboard/KpiGrid";
import LiveProductionFeed from "../features/dashboard/LiveProductionFeed";
import ActivityFeed from "../features/dashboard/ActivityFeed";
import DepartmentStatus from "../features/dashboard/DepartmentStatus";

export default function Dashboard() {
  const [jobs, setJobs] =
    useState([]);

  const [dashboardStats,
    setDashboardStats] =
    useState({
      customers: 0,
      orders: 0,
      invoices: 0,
      dispatches: 0,
      revenue: 0,
    });

  useEffect(() => {
    loadJobs();
    loadDashboardStats();
  }, []);

  async function loadJobs() {
    try {
      const result =
        await fetchProductionJobs();

      if (Array.isArray(result)) {
        setJobs(result);
      } else if (
        result?.data
      ) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );
    }
  }

  async function loadDashboardStats() {
    try {
      const [
        customers,
        orders,
        invoices,
        dispatches,
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("orders")
          .select("*", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("invoices")
          .select(
            "invoice_amount"
          ),

        supabase
          .from("dispatches")
          .select("*", {
            count: "exact",
            head: true,
          }),
      ]);

      const revenue =
        invoices.data?.reduce(
          (
            sum,
            invoice
          ) =>
            sum +
            Number(
              invoice.invoice_amount ||
                0
            ),
          0
        ) || 0;

      setDashboardStats({
        customers:
          customers.count || 0,

        orders:
          orders.count || 0,

        invoices:
          invoices.data
            ?.length || 0,

        dispatches:
          dispatches.count ||
          0,

        revenue,
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Monitor manufacturing operations in real time."
    >
      {/* HERO */}

      <div
        className="
          relative overflow-hidden
          rounded-3xl
          border border-white/10
          bg-gradient-to-br
          from-[#111827]
          via-[#0B1020]
          to-black
          p-8 shadow-2xl
        "
      >
        <div
          className="
            absolute right-0 top-0
            h-72 w-72
            rounded-full
            bg-orange-500/10
            blur-3xl
          "
        />

        <div
          className="
            relative z-10
            flex flex-col gap-8
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          <div>
            <p
              className="
                mb-3 text-sm
                uppercase
                tracking-[0.35em]
                text-orange-400
              "
            >
              BOXIQ ERP
            </p>

            <h1
              className="
                max-w-3xl
                text-5xl
                font-black
                leading-tight
                text-white
              "
            >
              Operations Command Center
            </h1>

            <p
              className="
                mt-5
                max-w-2xl
                text-lg
                text-slate-400
              "
            >
              Live visibility into
              quotations, production,
              dispatch, inventory and
              finance.
            </p>

            <div
              className="
                mt-8
                grid gap-4
                md:grid-cols-4
              "
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">
                  Customers
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {
                    dashboardStats.customers
                  }
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">
                  Orders
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-3xl font-bold text-blue-400">
                  <ShoppingCart
                    size={22}
                  />
                  {
                    dashboardStats.orders
                  }
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">
                  Dispatches
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-3xl font-bold text-orange-400">
                  <Truck
                    size={22}
                  />
                  {
                    dashboardStats.dispatches
                  }
                </h2>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">
                  Revenue
                </p>

                <h2 className="mt-2 flex items-center gap-2 text-3xl font-bold text-green-400">
                  <IndianRupee
                    size={22}
                  />
                  {dashboardStats.revenue.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="
              rounded-3xl
              border border-white/10
              bg-black/40
              p-8
              backdrop-blur-xl
            "
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse" />

              <span className="text-green-400">
                ERP System Online
              </span>
            </div>

            <h2 className="text-4xl font-black text-white">
              BoxIQ
            </h2>

            <p className="mt-2 text-orange-400">
              Manufacturing ERP
            </p>

            <div className="mt-6 rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">
                Active Production Jobs
              </p>

              <h3 className="mt-3 text-4xl font-black text-white">
                {jobs.length}
              </h3>
            </div>

            <div className="mt-4 rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">
                Total Invoices
              </p>

              <h3 className="mt-3 text-4xl font-black text-green-400">
                {
                  dashboardStats.invoices
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <KpiGrid jobs={jobs} />
      </div>

      <div className="mt-8">
        <LiveProductionFeed
          jobs={jobs}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ActivityFeed />

        <DepartmentStatus />
      </div>
    </PageContainer>
  );
}