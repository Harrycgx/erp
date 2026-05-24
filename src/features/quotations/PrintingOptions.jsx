export default function PrintingOptions({ value, onChange }) {
  return (
    <label className="block text-sm text-slate-300">
      Printing colors
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
      >
        <option value="">Select printing</option>
        <option value="None">None</option>
        <option value="Single color">Single color</option>
        <option value="Spot color">Spot color</option>
        <option value="Full color">Full color</option>
      </select>
    </label>
  );
}
