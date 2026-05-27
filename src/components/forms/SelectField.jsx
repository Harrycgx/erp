export default function SelectField({
  options = [],
  className = "",
  ...props
}) {
  return (
    <select
      className={`
        w-full rounded-2xl
        border border-white/10
        bg-[#111827]
        px-4 py-3
        text-white
        outline-none
        transition-all duration-300
        focus:border-orange-500
        ${className}
      `}
      {...props}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}