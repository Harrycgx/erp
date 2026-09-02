const inventory = [
  { id: 1, category: 'Board Stock', items: [
    { name: '2mm Corrugated', stock: 480, capacity: 500, unit: 'reams', alert: false },
    { name: '3mm Cardboard', stock: 320, capacity: 400, unit: 'reams', alert: false },
    { name: '4mm Kraft', stock: 45, capacity: 200, unit: 'reams', alert: true },
  ]},
  { id: 2, category: 'Ink & Materials', items: [
    { name: 'Cyan Ink', stock: 340, capacity: 400, unit: 'liters', alert: false },
    { name: 'Magenta Ink', stock: 280, capacity: 400, unit: 'liters', alert: true },
    { name: 'Varnish', stock: 180, capacity: 250, unit: 'liters', alert: false },
  ]},
  { id: 3, category: 'Packaging', items: [
    { name: 'Tape Rolls', stock: 2400, capacity: 3000, unit: 'rolls', alert: false },
    { name: 'Bubble Wrap', stock: 1200, capacity: 1500, unit: 'meters', alert: false },
    { name: 'Foam Inserts', stock: 340, capacity: 500, unit: 'units', alert: true },
  ]},
];

export default function InventoryPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Inventory Levels <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">MOCK DATA</span></h3>
        <p className="mt-1 text-sm text-slate-500">Hardcoded demonstration values — not connected to real inventory database (SCHEMA / ADMIN blocked).</p>
      </div>

      <div className="space-y-6">
        {inventory.map((section) => (
          <div key={section.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="font-semibold text-slate-900">{section.category}</h4>
            <div className="mt-4 space-y-4">
              {section.items.map((item, idx) => (
                <div key={idx} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{item.name}</span>
                      {item.alert && (
                        <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Low
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {item.stock} / {item.capacity} {item.unit}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${item.alert ? 'bg-red-500' : item.stock > item.capacity * 0.75 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${(item.stock / item.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {inventory.flatMap(s => s.items).filter(i => i.alert).length > 0 && (
        <div className="rounded-2xl border-l-4 border-l-red-500 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            ⚠️ {inventory.flatMap(s => s.items).filter(i => i.alert).length} low stock alerts
          </p>
          <p className="mt-1 text-xs text-red-600">Reorder immediately to prevent production delays</p>
        </div>
      )}
    </div>
  );
}
