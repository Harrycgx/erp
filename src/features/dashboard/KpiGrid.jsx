import {
  Package,
  Factory,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

import StatCard from "../../components/ui/StatCard";

const stats = [
  {
    title: "Active Quotes",
    value: 4,
    icon: Package,
    color: "from-orange-500/20 to-orange-700/10",
  },
  {
    title: "Orders Running",
    key: "running",
    icon: ShoppingCart,
    color: "from-blue-500/20 to-blue-700/10",
  },
  {
    title: "Production Efficiency",
    value: 92,
    suffix: "%",
    icon: Factory,
    color: "from-green-500/20 to-green-700/10",
  },
  {
    title: "Pending Jobs",
    key: "pending",
    icon: AlertTriangle,
    color: "from-red-500/20 to-red-700/10",
  },
];

export default function KpiGrid({ jobs }) {
  function getCardValue(card) {
    if (card.key === "running") {
      return jobs.filter(
        (job) => job.status?.toLowerCase() === "running"
      ).length;
    }

    if (card.key === "pending") {
      return jobs.filter(
        (job) => job.status?.toLowerCase() === "pending"
      ).length;
    }

    return card.value;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={getCardValue(card)}
          icon={card.icon}
          color={card.color}
          suffix={card.suffix || ""}
        />
      ))}
    </div>
  );
}