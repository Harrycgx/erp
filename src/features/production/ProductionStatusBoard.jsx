export default function ProductionStatusBoard({
  jobs = [],
}) {
  function getStatusColor(status) {
    switch (status) {
      case "running":
        return "bg-green-500";

      case "pending":
        return "bg-yellow-500";

      case "completed":
        return "bg-blue-500";

      default:
        return "bg-red-500";
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            LIVE FACTORY STATUS
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            Production Monitoring
          </h2>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />

          <span className="text-green-300">
            Live Tracking Active
          </span>
        </div>
      </div>

      <div className="grid gap-5">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div>
              <h3 className="text-xl font-bold text-white">
                {job.job_name}
              </h3>

              <p className="mt-2 text-slate-400">
                Manufacturing workflow monitoring
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  job.status
                )}`}
              />

              <span className="capitalize text-white">
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}