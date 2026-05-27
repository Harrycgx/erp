export default function PageContainer({
  title,
  description,
  children,
}) {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <h1 className="text-5xl font-bold text-white">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-400">
          {description}
        </p>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">
        {children}
      </div>

    </div>
  );
}