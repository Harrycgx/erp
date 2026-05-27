export default function FormField({
  label,
  children,
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-300">
        {label}
      </label>

      {children}
    </div>
  );
}