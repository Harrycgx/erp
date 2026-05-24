export default function FinishingOptions({ value, onChange }) {
  return (
    <label className="block text-sm text-slate-300">
      Lamination
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
      >
        <option value="None">None</option>
        <option value="Matte">Matte</option>
        <option value="Gloss">Gloss</option>
        <option value="Soft touch">Soft touch</option>
      </select>
    </label>
  );
}
