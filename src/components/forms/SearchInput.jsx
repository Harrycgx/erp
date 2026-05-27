export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="
        w-full rounded-2xl
        border border-white/10
        bg-[#111827]
        px-4 py-3
        text-white
        outline-none
        transition-all duration-300
        focus:border-orange-500
      "
    />
  );
}