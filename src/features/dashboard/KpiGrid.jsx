import {
  Package,
  Factory,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

import StatCard from "../../components/ui/StatCard";

export default function KpiGrid({
  jobs = [],
}) {
  const activeQuotes =
    jobs.filter(
      (job) =>
        job.stage !==
        "completed"
    ).length;

  const runningOrders =
    jobs.filter(
      (job) =>
        job.stage ===
          "cutting" ||
        job.stage ===
          "printing"
    ).length;

  const completedJobs =
    jobs.filter(
      (job) =>
        job.stage ===
        "completed"
    ).length;

  const pendingJobs =
    jobs.filter(
      (job) =>
        job.stage ===
          "planning" ||
        job.status ===
          "pending"
    ).length;

  const efficiency =
    jobs.length > 0
      ? Math.round(
          (completedJobs /
            jobs.length) *
            100
        )
      : 0;

  const stats = [
    {
      title:
        "Active Jobs",
      value:
        activeQuotes,
      icon: Package,
      color:
        "from-orange-500/20 to-orange-700/10",
    },
    {
      title:
        "Orders Running",
      value:
        runningOrders,
      icon:
        ShoppingCart,
      color:
        "from-blue-500/20 to-blue-700/10",
    },
    {
      title:
        "Production Efficiency",
      value:
        efficiency,
      suffix: "%",
      icon: Factory,
      color:
        "from-green-500/20 to-green-700/10",
    },
    {
      title:
        "Pending Jobs",
      value:
        pendingJobs,
      icon:
        AlertTriangle,
      color:
        "from-red-500/20 to-red-700/10",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(
        (card) => (
          <StatCard
            key={
              card.title
            }
            title={
              card.title
            }
            value={
              card.value
            }
            icon={
              card.icon
            }
            color={
              card.color
            }
            suffix={
              card.suffix ||
              ""
            }
          />
        )
      )}
    </div>
  );
}