export default function SupplierCard({ supplier }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Supplier</p>
          <h3 className="mt-2 text-xl font-black text-white">{supplier?.supplier_name}</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{supplier?.payment_terms || 'Net 30'}</span>
      </div>
      <div className="space-y-2 text-sm text-slate-300">
        <p><span className="font-semibold text-white">Contact</span>: {supplier?.contact_person || 'N/A'}</p>
        <p><span className="font-semibold text-white">Phone</span>: {supplier?.phone || 'N/A'}</p>
        <p><span className="font-semibold text-white">Email</span>: {supplier?.email || 'N/A'}</p>
        <p><span className="font-semibold text-white">Address</span>: {supplier?.address || 'N/A'}</p>
        <p><span className="font-semibold text-white">GST</span>: {supplier?.gst_number || 'N/A'}</p>
      </div>
    </div>
  );
}
