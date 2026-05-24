export default function QuotePricing({ pricing }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-5 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pricing preview</p>
          <h3 className="mt-2 text-xl font-black text-white">Real-time cost summary</h3>
        </div>
      </div>
      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{pricing.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>₹{pricing.gst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-3 text-white">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">₹{pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
