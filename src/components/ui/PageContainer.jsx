export default function PageContainer({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          BOXIQ ERP
        </p>

        <h1 className="mt-3 text-5xl font-black text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}