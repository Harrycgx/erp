import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

const categories = [
  {
    title: 'Luxury corrugated',
    description: 'Rigid-grade boards with refined embossing, crafted for premium unboxing.',
  },
  {
    title: 'Precision mailers',
    description: 'Engineered for e-commerce brands that need consistent protection and presentation.',
  },
  {
    title: 'Industrial cartons',
    description: 'High-volume packaging that balances strength, sustainability, and aesthetics.',
  },
];

export default function PackagingCategories() {
  return (
    <section id="categories" className="py-24">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Packaging expertise"
          title="Premium packaging categories for enterprise scale."
          description="Choose the packaging system that matches your brand, volume, and fulfillment expectations with confidence."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(15,23,42,0.12)]"
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Category</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900 transition duration-300 group-hover:text-slate-800">
                {category.title}
              </h3>
              <p className="mt-4 text-slate-600">{category.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
