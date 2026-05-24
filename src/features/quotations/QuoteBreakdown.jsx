export default function QuoteBreakdown({ pricing }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Pricing breakdown</h3>
        <span className="text-sm text-slate-400">Insights</span>
      </div>
      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Material cost</span>
          <span>₹{pricing.materialCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Printing</span>
          <span>₹{pricing.printCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Lamination</span>
          <span>₹{pricing.laminationCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Tooling</span>
          <span>₹{pricing.toolingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Labor</span>
          <span>₹{pricing.laborCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Wastage</span>
          <span>₹{pricing.wastageCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-3">
          <span>Rush surcharge</span>
          <span>₹{pricing.rushCharge.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
