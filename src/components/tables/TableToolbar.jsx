import Input from "../ui/Input";
import Button from "../ui/Button";

export default function TableToolbar({
  search,
  setSearch,
  title,
  actionLabel,
  onAction,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111827] p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-black text-white">
          {title}
        </h2>

        <p className="mt-2 text-slate-400">
          Enterprise operational records
        </p>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {actionLabel && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}