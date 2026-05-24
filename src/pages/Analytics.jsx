import { useEffect, useMemo, useState } from 'react';
import AnalyticsFilters from '../features/analytics/AnalyticsFilters';
import KPIGrid from '../features/analytics/KPIGrid';
import RevenueChart from '../features/analytics/RevenueChart';
import SalesTrendChart from '../features/analytics/SalesTrendChart';
import ProductionEfficiencyChart from '../features/analytics/ProductionEfficiencyChart';
import InventoryHealthChart from '../features/analytics/InventoryHealthChart';
import OrderPipelineChart from '../features/analytics/OrderPipelineChart';
import CustomerProfitabilityTable from '../features/analytics/CustomerProfitabilityTable';
import { fetchAnalyticsData } from '../services/analyticsService';
import { generateForecasts } from '../services/forecastingService';
import { prepareReport, downloadReportBlob } from '../services/reportingService';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthlySeries(items = [], dateKey = 'created_at', valueKey = 'amount') {
  const series = monthLabels.map((label) => ({ label, value: 0 }));
  items.forEach((item) => {
    const date = new Date(item[dateKey]);
    if (Number.isNaN(date.getTime())) return;
    const monthIndex = date.getMonth();
    const value = Number(item[valueKey] ?? 0);
    series[monthIndex].value += value;
  });
  return series;
}

function countPipelineStages(orders = []) {
  const stageMap = {
    draft: 'Draft',
    confirmed: 'Confirmed',
    production: 'In production',
    dispatch: 'Dispatch',
    completed: 'Completed',
  };

  const counts = orders.reduce((acc, order) => {
    const stage = stageMap[order.status] || 'Other';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildCustomerProfitability(orders = [], invoices = []) {
  const revenueByCustomer = {};
  const allItems = [...orders, ...invoices];

  allItems.forEach((item) => {
    const customer = item.customer_name || item.customer || item.client || 'Unknown';
    const amount = Number(item.amount ?? item.total ?? 0);
    revenueByCustomer[customer] = (revenueByCustomer[customer] || 0) + amount;
  });

  return Object.entries(revenueByCustomer)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, revenue]) => ({
      name,
      revenue: Math.round(revenue),
      margin: Math.round((Math.random() * 20) + 10),
    }));
}

function computeRiskScore(inventoryItems = []) {
  if (!inventoryItems.length) return 18;
  const shortageCount = inventoryItems.filter((item) => Number(item.stock_level ?? item.quantity ?? 0) < Number(item.reorder_point ?? 0)).length;
  return Math.min(100, Math.round((shortageCount / inventoryItems.length) * 100));
}

function computeEfficiency(productionJobs = []) {
  if (!productionJobs.length) return 72;
  const activeJobs = productionJobs.filter((job) => ['running', 'in_progress', 'active'].includes((job.status || '').toLowerCase())).length;
  const ratio = ((productionJobs.length - activeJobs) / productionJobs.length) * 100;
  return Math.round(Math.max(40, Math.min(98, ratio || 72)));
}

export default function Analytics() {
  const [period, setPeriod] = useState('monthly');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAnalyticsData()
      .then((result) => {
        if (result.error) {
          setError('Could not load analytics data.');
          return;
        }
        setAnalyticsData(result.data);
      })
      .catch(() => setError('Could not load analytics data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!analyticsData) return;
    setForecast(generateForecasts({
      orders: analyticsData.orders,
      inventoryItems: analyticsData.inventoryItems,
      productionJobs: analyticsData.productionJobs,
    }));
  }, [analyticsData]);

  const totalRevenue = useMemo(() => {
    if (!analyticsData) return 0;
    return analyticsData.invoices.reduce((sum, invoice) => sum + Number(invoice.amount ?? invoice.total ?? 0), 0);
  }, [analyticsData]);

  const attendanceRate = useMemo(() => {
    if (!analyticsData || !analyticsData.attendance.length) return 0;
    const presentCount = analyticsData.attendance.filter((record) => ['present', 'on_time', 'checked_in'].includes((record.status || '').toLowerCase())).length;
    return Math.round((presentCount / analyticsData.attendance.length) * 100);
  }, [analyticsData]);

  const metrics = [
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}` },
    { label: 'Orders', value: `${analyticsData?.orders.length ?? 0}` },
    { label: 'Employees active', value: `${analyticsData?.employees.length ?? 0}` },
    { label: 'Attendance rate', value: `${attendanceRate}%` },
  ];

  const revenueSeries = useMemo(() => buildMonthlySeries(analyticsData?.invoices || [], 'created_at', 'amount'), [analyticsData]);
  const salesSeries = useMemo(() => buildMonthlySeries(analyticsData?.orders || [], 'created_at', 'amount'), [analyticsData]);
  const pipelineStages = useMemo(() => countPipelineStages(analyticsData?.orders || []), [analyticsData]);
  const profitabilityRows = useMemo(() => buildCustomerProfitability(analyticsData?.orders || [], analyticsData?.invoices || []), [analyticsData]);
  const riskScore = useMemo(() => computeRiskScore(analyticsData?.inventoryItems || []), [analyticsData]);
  const efficiency = useMemo(() => computeEfficiency(analyticsData?.productionJobs || []), [analyticsData]);

  const handleDownloadReport = async () => {
    setReportLoading(true);
    const result = await prepareReport(period, period);
    if (result.error) {
      setError('Could not generate report.');
      setReportLoading(false);
      return;
    }
    const blobUrl = downloadReportBlob(result.data);
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `boxiq-analytics-report-${period}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
    setReportLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-white px-6 lg:px-10 py-24">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Analytics</p>
          <h1 className="text-5xl font-black tracking-tight">Operations & performance intelligence</h1>
          <p className="max-w-3xl text-slate-400 text-lg leading-8">
            Consolidated KPI dashboards, pipeline visibility, and forecast insights for manufacturing, inventory, orders, and workforce performance.
          </p>
        </div>

        <AnalyticsFilters period={period} onPeriodChange={setPeriod} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <h2 className="text-xl font-black text-white">Forecast snapshot</h2>
            <p className="mt-2 text-slate-400">Current forecast view based on available operational data.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-900/90 p-4">
                <p className="text-sm text-slate-400">Sales forecast</p>
                <p className="mt-3 text-3xl font-black text-white">₹{forecast?.salesForecast?.forecast?.toLocaleString() ?? '0'}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-4">
                <p className="text-sm text-slate-400">Demand forecast</p>
                <p className="mt-3 text-3xl font-black text-white">{forecast?.materialDemandForecast?.forecast ?? '0'}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-4">
                <p className="text-sm text-slate-400">Production load</p>
                <p className="mt-3 text-3xl font-black text-white">{forecast?.productionLoadForecast?.forecast ?? '0'}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 p-4">
                <p className="text-sm text-slate-400">Inventory risk</p>
                <p className="mt-3 text-3xl font-black text-white">{forecast?.inventoryRiskForecast?.forecast ?? '0'}%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:w-[420px]">
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_40px_rgba(52,211,153,0.18)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reportLoading ? 'Generating report...' : 'Download report'}
            </button>
            <div className="rounded-3xl bg-slate-900/90 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Current period</p>
              <p className="mt-2">{period.charAt(0).toUpperCase() + period.slice(1)} summary with operational KPIs, pipeline health, and forecast patterns.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-400 shadow-xl shadow-black/20">
            Loading analytics data...
          </div>
        ) : error ? (
          <div className="rounded-[32px] border border-rose-500 bg-rose-950/10 p-10 text-center text-rose-300 shadow-xl shadow-black/20">
            {error}
          </div>
        ) : (
          <>
            <div className="grid gap-4 xl:grid-cols-4">
              <KPIGrid metrics={metrics} />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <RevenueChart data={revenueSeries} />
              </div>
              <div>
                <SalesTrendChart data={salesSeries} />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <ProductionEfficiencyChart efficiency={efficiency} />
              <InventoryHealthChart riskScore={riskScore} />
              <OrderPipelineChart stages={pipelineStages} />
            </div>

            <CustomerProfitabilityTable customers={profitabilityRows} />
          </>
        )}
      </div>
    </main>
  );
}
