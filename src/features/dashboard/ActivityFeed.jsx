import { Activity } from "lucide-react";

export default function ActivityFeed() {
  const activities = [
    {
      text: "Production jobs are being monitored",
      time: "Live",
    },
    {
      text: "Inventory ledger connected",
      time: "Active",
    },
    {
      text: "Dispatch workflow enabled",
      time: "Active",
    },
    {
      text: "Finance module online",
      time: "Active",
    },
    {
      text: "ERP services operational",
      time: "Live",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
      <div className="mb-6 flex items-center gap-3">
        <Activity className="text-orange-400" />

        <h2 className="text-2xl font-bold text-white">
          System Activity
        </h2>
      </div>

      <div className="space-y-4">
        {activities.map(
          (activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-3 w-3 rounded-full bg-green-500" />

                <p className="text-slate-300">
                  {activity.text}
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {activity.time}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}