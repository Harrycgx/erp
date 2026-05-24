import { useEffect, useState } from 'react';
import { getAIFactoryIntelligence } from '../services/aiService';
import AIHealthMonitor from '../features/ai/AIHealthMonitor';
import AIInsightsPanel from '../features/ai/AIInsightsPanel';
import SmartAlerts from '../features/ai/SmartAlerts';
import AIRecommendations from '../features/ai/AIRecommendations';
import PredictionCard from '../features/ai/PredictionCard';
import OperationalWarnings from '../features/ai/OperationalWarnings';
import AIProductionInsights from '../features/ai/AIProductionInsights';
import AIInventoryForecast from '../features/ai/AIInventoryForecast';
import AIRevenueForecast from '../features/ai/AIRevenueForecast';
import AICustomerInsights from '../features/ai/AICustomerInsights';
import AIWorkflowAutomation from '../features/ai/AIWorkflowAutomation';
import AIActivityFeed from '../features/ai/AIActivityFeed';

export default function AIControlCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAI() {
      setLoading(true);
      const response = await getAIFactoryIntelligence();
      if (!isMounted) return;
      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data);
      }
      setLoading(false);
    }

    loadAI();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 px-6 py-10 sm:px-8 lg:px-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.35em] text-orange-400">AI Factory Intelligence</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">Smart automation & operational insights</h1>
        <p className="max-w-3xl text-base leading-7 text-slate-400">
          Monitor factory health, target production bottlenecks, detect anomalies, and automate workflows from one centralized control center.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading AI intelligence...</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500 bg-rose-950/90 p-10 text-center text-rose-200">Unable to load AI insights: {error}</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <AIHealthMonitor health={data.overview} />
              <AIInsightsPanel insights={data.insights} />
              <AIRecommendations recommendations={data.recommendations} />
            </div>
            <div className="space-y-6">
              <SmartAlerts alerts={data.anomalies.alerts ?? []} />
              <AIWorkflowAutomation workflows={data.automation.workflows ?? []} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <PredictionCard title="Demand forecast" current={data.predictions.demand.current} forecast={data.predictions.demand.forecast} trend={data.predictions.demand.trend} />
            <PredictionCard title="Production load" current={data.predictions.production.current} forecast={data.predictions.production.forecast} trend={data.predictions.production.trend} />
            <PredictionCard title="Inventory risk" current={data.predictions.inventory.current} forecast={data.predictions.inventory.forecast} trend={data.predictions.inventory.trend} />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <AIProductionInsights production={data.predictions.production} />
            <AIInventoryForecast inventory={data.predictions.inventory} />
            <AIRevenueForecast revenue={data.predictions.sales} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <AICustomerInsights customers={data.customerSignals} />
            <AIActivityFeed events={data.automation.events ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
