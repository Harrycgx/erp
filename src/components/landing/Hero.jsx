import Container from '../ui/Container';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import StatCard from '../ui/StatCard';

const metrics = [
  { value: '120+', label: 'trusted brands' },
  { value: '98%', label: 'on-time delivery' },
  { value: '5', label: 'manufacturing hubs' },
];

const snapshot = [
  { value: '450K', label: 'boxes/month' },
  { value: '24h', label: 'quote response' },
  { value: '93%', label: 'supply certainty' },
];

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-slate-50 py-24">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white to-transparent" />
      <Container className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-10">
          <span className="inline-flex rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Premium packaging intelligence
          </span>

          <div className="space-y-6">
            <h1 className="text-5xl leading-[1.02] font-black tracking-tight text-slate-900 sm:text-6xl">
              Packaging that makes every shipment feel premium.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Modern corrugated solutions for B2B brands that need speed, scale, and a refined unboxing experience.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <PrimaryButton>Get your custom quote</PrimaryButton>
            <SecondaryButton>Explore packaging services</SecondaryButton>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        <div className="relative group">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-[0_30px_60px_rgba(15,23,42,0.08)] transition duration-500 group-hover:shadow-[0_36px_90px_rgba(15,23,42,0.12)]">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
              alt="Premium packaging"
              className="h-[520px] w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

          <div className="absolute left-6 bottom-6 w-[calc(100%-3rem)] rounded-3xl border border-white/70 bg-white/95 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition duration-300 sm:w-[calc(100%-4rem)]">
            <p className="text-sm uppercase tracking-[0.24em] text-orange-600">Live production snapshot</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {snapshot.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-black text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
