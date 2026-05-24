export default function VendorTable({ vendors = [], onSelect, onEdit, onDelete, selectedVendor }) {
  return (
    <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
      <thead>
        <tr>
          <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Vendor</th>
          <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Contact</th>
          <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Terms</th>
          <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Materials</th>
          <th className="px-4 py-3 text-left uppercase tracking-[0.3em] text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
        {vendors.map((vendor) => (
          <tr key={vendor.id} className={`transition hover:bg-slate-900/80 ${selectedVendor?.id === vendor.id ? 'bg-slate-900/80' : ''}`}>
            <td className="cursor-pointer px-4 py-4 text-white" onClick={() => onSelect(vendor)}>{vendor.vendor_name}</td>
            <td className="px-4 py-4 text-slate-300">{vendor.contact_person || vendor.phone || 'N/A'}</td>
            <td className="px-4 py-4 text-slate-300">{vendor.payment_terms || 'Net 30'}</td>
            <td className="px-4 py-4 text-slate-300 text-sm">{vendor.supplied_materials || 'General raw materials'}</td>
            <td className="px-4 py-4 text-slate-300 space-x-2">
              <button
                type="button"
                onClick={() => onEdit(vendor)}
                className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white transition hover:border-orange-500"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(vendor.id)}
                className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-semibold text-white transition hover:border-rose-500"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
