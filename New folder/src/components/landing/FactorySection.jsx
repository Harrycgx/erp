import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import StatCard from '../ui/StatCard';

const metrics = [
  { label: 'Assembly lines', value: '12' },
  { label: 'Annual throughput', value: '5M units' },
  { label: 'Quality rating', value: '99.4%' },
];

export default function FactorySection() {
  return (
    <section id="factory" className="bg-gradient-to-br from-white via-slate-50 to-slate-100 py-24">
      <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Manufacturing credibility"
            title="Industrial production with a premium finish."
            description="Our facilities combine advanced board engineering with rigorous quality controls for B2B brands that demand consistency at scale."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-[0_30px_70px_rgba(15,23,42,0.08)] transition duration-500 hover:shadow-[0_34px_90px_rgba(15,23,42,0.12)] group">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
            alt="Factory production"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-6 left-6 rounded-3xl bg-white/95 p-5 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Production insight</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Inspected and shipped from our ISO-certified lines.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
