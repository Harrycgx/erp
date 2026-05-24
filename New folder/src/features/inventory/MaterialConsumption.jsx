import { estimateMaterialUsage } from '../../utils/productionEstimations';

export default function MaterialConsumption({ order }) {
  if (!order) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Material consumption</p>
        <h2 className="mt-2 text-2xl font-black text-white">Choose an order to review materials</h2>
      </div>
    );
  }

  const usage = estimateMaterialUsage(order);

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Material consumption</p>
          <h2 className="mt-2 text-2xl font-black text-white">Order estimate</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Paper usage</p>
          <p className="mt-2 text-3xl font-black text-white">{usage.paperUsage} kg</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Wastage allowance</p>
          <p className="mt-2 text-3xl font-black text-white">{usage.wastage} kg</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Board requirement</p>
          <p className="mt-2 text-3xl font-black text-white">{usage.boardRequirement} m²</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
          <p className="text-sm text-slate-400">Printing/lamination</p>
          <p className="mt-2 text-3xl font-black text-white">{usage.printingInk} ink units</p>
        </div>
      </div>
    </div>
  );
}
