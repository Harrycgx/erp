import { Search } from 'lucide-react';

export default function QuoteSearchBar({ value, onChange, placeholder = 'Search quotes, customers, or box types' }) {
  return (
    <label className="relative block w-full text-sm text-slate-300">
      <span className="sr-only">Search quotations</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[28px] border border-slate-700 bg-slate-900/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-400"
      />
    </label>
  );
}
