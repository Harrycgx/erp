import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import PageContainer from "../components/ui/PageContainer";

import {
  fetchAnalytics,
} from "../services/analytics/analyticsService";

export default function Analytics() {
  const [analytics,
    setAnalytics] =
    useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const data =
      await fetchAnalytics();

    setAnalytics(data);
  }

  if (!analytics) {
    return (
      <PageContainer title="Analytics">
        <p className="text-white">
          Loading analytics...
        </p>
      </PageContainer>
    );
  }

  const chartData = [
    {
      name: "Revenue",
      value:
        analytics.totalRevenue,
    },

    {
      name: "Production",
      value:
        analytics.completedProduction,
    },

    {
      name: "Inventory Usage",
      value:
        analytics.inventoryConsumption,
    },
  ];

  return (
    <PageContainer
      title="Analytics"
      subtitle="Operational intelligence and KPI tracking."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Revenue
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            ₹
            {
              analytics.totalRevenue
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Quotations
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {
              analytics.quotationCount
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Completed Production
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {
              analytics.completedProduction
            }
          </h2>
        </div>
      </div>

      <div
        className="
          mt-8 rounded-2xl
          bg-white/5 p-6
        "
      >
        <h3 className="mb-6 text-xl font-semibold text-white">
          Operations Overview
        </h3>

        <div className="h-80">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
            >
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContainer>
  );
}