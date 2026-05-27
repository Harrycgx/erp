import { Activity } from "lucide-react";

const activities = [
  "Production batch #P-204 completed",
  "Inventory updated by warehouse team",
  "New quotation generated for client",
  "Purchase order approved",
  "Finance payment cleared",
];

export default function ActivityFeed() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <div className="mb-6 flex items-center gap-3">
        <Activity className="text-orange-400" />

        <h2 className="text-2xl font-bold text-white">
          Recent Activity
        </h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-orange-500" />

              <p className="text-slate-300">
                {activity}
              </p>
            </div>

            <span className="text-sm text-slate-500">
              Just now
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}