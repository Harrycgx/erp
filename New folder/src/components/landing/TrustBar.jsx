import Container from '../ui/Container';
import StatCard from '../ui/StatCard';

const metrics = [
  { label: 'Brands served', value: '120+' },
  { label: 'On-time delivery', value: '98%' },
  { label: 'Monthly capacity', value: '450K boxes' },
];

export default function TrustBar() {
  return (
    <section id="trust" className="bg-slate-50 py-24">
      <Container className="grid gap-6 rounded-[32px] bg-white p-8 shadow-sm sm:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            value={metric.value}
            label={metric.label}
            className="border-r border-slate-200 last:border-r-0 pr-4 sm:pr-0"
          />
        ))}
      </Container>
    </section>
  );
}
