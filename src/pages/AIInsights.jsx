import { useEffect, useState } from "react";

import PageContainer from "../components/ui/PageContainer";

import {
  generateForecast,
} from "../services/ai/forecastService";

export default function AIInsights() {
  const [forecast,
    setForecast] =
    useState(null);

  async function loadForecast() {
    const data =
      await generateForecast();

    setForecast(data);
  }

  useEffect(() => {
    loadForecast();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!forecast) {
    return (
      <PageContainer title="AI Insights">
        <p className="text-white">
          Loading AI analysis...
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="AI Insights"
      subtitle="Operational forecasting and intelligent recommendations."
    >
      <div className="grid gap-6 md:grid-cols-5">
        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Quotation Volume
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {
              forecast.quotationVolume
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Revenue Trend
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            ₹
            {forecast.revenue}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 p-6">
          <p className="text-sm text-slate-400">
            Inventory Usage
            <div className="rounded-2xl bg-white/5 p-6">
  <p className="text-sm text-slate-400">
    Active Orders
  </p>

  <h2 className="mt-2 text-3xl font-bold text-white">
    {forecast.activeOrders}
  </h2>
</div>

<div className="rounded-2xl bg-white/5 p-6">
  <p className="text-sm text-slate-400">
    Completed Production
  </p>

  <h2 className="mt-2 text-3xl font-bold text-white">
    {
      forecast.completedProduction
    }
  </h2>
</div>
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {
              forecast.inventoryUsage
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
          AI Recommendations
        </h3>

        <div className="space-y-4">
          {forecast.recommendations.map(
            (
              recommendation,
              index
            ) => (
              <div
                key={index}
                className="
                  rounded-xl
                  border border-orange-500/20
                  bg-orange-500/10
                  p-4 text-white
                "
              >
                {recommendation}
              </div>
            )
          )}
        </div>
      </div>
    </PageContainer>
  );
}