import { useState } from 'react';

const checklistItems = [
  'Print quality verified',
  'Dimensions checked',
  'Bundle count verified',
  'Glue quality inspected',
  'Dispatch approval confirmed',
];

export default function QCChecklist() {
  const [checked, setChecked] = useState(() => checklistItems.map(() => false));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">QC checklist</p>
          <p className="text-sm text-slate-400">Verify production quality before dispatch.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">5 steps</span>
      </div>
      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <label key={item} className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950/90 p-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={() => setChecked((prev) => prev.map((value, idx) => (idx === index ? !value : value)))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
