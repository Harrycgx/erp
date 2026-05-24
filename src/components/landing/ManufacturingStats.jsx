import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import StatCard from '../ui/StatCard';

const stats = [
  { label: 'Production capacity', value: '4.5M units' },
  { label: 'Dispatch speed', value: '24h ready' },
  { label: 'Repeat clients', value: '87%' },
  { label: 'Machine uptime', value: '99.2%' },
  { label: 'Reliability', value: '98.7%' },
];

export default function ManufacturingStats() {
  return (
    <section id="manufacturing" className="bg-slate-50 py-24">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Operational authority"
          title="Manufacturing capacity built for enterprise scale."
          description="A premium operations layer showing the performance metrics that matter for large-scale production and repeat fulfillment."
        />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="grid gap-6 sm:grid-cols-2">
            {stats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-600">Operational snapshot</p>
            <div className="mt-8 space-y-6 text-slate-700">
              <div className="space-y-2 rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Peak throughput</p>
                <p className="text-xl font-semibold text-slate-900">115,000 units / week</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Shift efficiency</p>
                <p className="text-xl font-semibold text-slate-900">92% line utilization</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
