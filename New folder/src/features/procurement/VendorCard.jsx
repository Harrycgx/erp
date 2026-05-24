export default function VendorCard({ vendor, score = 0, performanceLabel = 'Unknown' }) {
  if (!vendor) {
    return (
      <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 text-center text-slate-400">
        Select a vendor to view profile and performance details.
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor details</p>
          <h2 className="mt-2 text-3xl font-black text-white">{vendor.vendor_name}</h2>
          <p className="mt-2 text-sm text-slate-400">{vendor.supplied_materials || 'General raw materials'}</p>
        </div>
        <div className="rounded-3xl bg-slate-900 px-5 py-4 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Supplier score</p>
          <p className="mt-3 text-4xl font-black text-white">{score}</p>
          <p className="mt-1 text-sm text-slate-400">{performanceLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Primary contact</p>
          <p className="mt-2 text-sm text-white">{vendor.contact_person || 'N/A'}</p>
          <p className="mt-1 text-slate-400">{vendor.phone || 'N/A'}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-4">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Payment terms</p>
          <p className="mt-2 text-sm text-white">{vendor.payment_terms || 'Net 30'}</p>
          <p className="mt-1 text-slate-400">GST: {vendor.gst_number || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-900/90 p-4 text-sm text-slate-300">
        <p className="font-semibold text-white">Address</p>
        <p className="mt-2">{vendor.address || 'Not available'}</p>
        <p className="mt-4 font-semibold text-white">Notes</p>
        <p className="mt-2 text-slate-400">{vendor.notes || 'No notes recorded.'}</p>
      </div>
    </div>
  );
}
