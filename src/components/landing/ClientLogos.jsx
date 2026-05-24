import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

const logos = ['Ecommerce', 'Luxury retail', 'FMCG', 'Gifting', 'Logistics', 'Enterprise'];

export default function ClientLogos() {
  return (
    <section id="logos" className="bg-slate-50 py-24">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Trusted by industry leaders"
          title="Enterprise brands rely on BoxIQ for scale and quality."
          description="A proven partner for categories that require premium packaging and consistent distribution."
        />

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((label) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="mb-3 h-12 w-12 rounded-full bg-slate-100" />
              {label}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
