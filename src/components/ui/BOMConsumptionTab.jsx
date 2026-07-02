import React from "react";

export default function BOMConsumptionTab({ usageData, jobActualQty, jobPlannedQty }) {
  const uniqueMaterialsCount = usageData.length;
  const hasVariance = usageData.some(item => Number(item.variance) !== 0);

  return (
    <div className="space-y-6">
      {/* Metrics Header: Fixed to show context, not nonsensical aggregate math */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 border border-slate-800 rounded">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Job Yield</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">{jobPlannedQty || 0} Units</span>
        </div>
        <div className="bg-slate-950 p-4 border border-slate-800 rounded">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Actual Job Yield</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{jobActualQty || "Pending"}</span>
        </div>
        <div className="bg-slate-950 p-4 border border-slate-800 rounded">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">BOM Components Tracked</span>
          <span className={`text-xl font-bold mt-1 block ${hasVariance ? 'text-amber-400' : 'text-emerald-400'}`}>
            {uniqueMaterialsCount} Items
          </span>
        </div>
      </div>

      {/* Itemized Ledger View */}
      <div className="border border-slate-800 rounded bg-slate-900/50 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3">Material Component ID</th>
              <th className="p-3 text-right">Required (Calculated)</th>
              <th className="p-3 text-right">Actual Consumed</th>
              <th className="p-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
            {usageData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-slate-500 font-sans">
                  No materials consumed yet. Finalize this production job to trigger the BOM explosion.
                </td>
              </tr>
            ) : (
              usageData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 text-slate-400 font-sans font-medium">{item.material_id}</td>
                  <td className="p-3 text-right">{Number(item.required_qty).toFixed(2)}</td>
                  <td className="p-3 text-right text-blue-400">{Number(item.actual_qty).toFixed(2)}</td>
                  <td className={`p-3 text-right font-bold ${Number(item.variance) > 0 ? 'text-red-400' : Number(item.variance) < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {Number(item.variance) === 0 ? "0.00" : Number(item.variance).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}