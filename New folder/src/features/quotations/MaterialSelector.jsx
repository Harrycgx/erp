export default function MaterialSelector({ value, onChange }) {
  return (
    <label className="block text-sm text-slate-300">
      Flute type
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
      >
        <option value="">Select flute</option>
        <option value="A flute">A flute</option>
        <option value="B flute">B flute</option>
        <option value="C flute">C flute</option>
        <option value="BC flute">BC flute</option>
      </select>
    </label>
  );
}
