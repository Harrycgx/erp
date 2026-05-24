export default function SectionWrapper({ title, children }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {title ? <h2 className="text-2xl font-black">{title}</h2> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
