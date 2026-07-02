export default function SearchBar({ onSearch, placeholder = "Search..." }) {
  return (
    <input 
      type="text"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      className="bg-[#1e293b] border border-slate-700 text-slate-200 text-sm px-4 py-1.5 rounded-lg w-56 outline-none focus:border-blue-500 transition-colors"
    />
  );
}