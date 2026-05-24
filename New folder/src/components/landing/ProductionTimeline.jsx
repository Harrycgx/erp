import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

const flow = [
  'Consultation',
  'Structural Design',
  'Prototype',
  'Production',
  'Quality Check',
  'Dispatch',
];

export default function ProductionTimeline() {
  return (
    <section id="timeline" className="bg-white py-24">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Premium process"
          title="A confident manufacturing timeline with clear milestones."
          description="From concept to dispatch, each stage is designed for speed, precision, and reliable delivery."
        />

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="hidden items-center justify-between gap-6 lg:flex">
            {flow.map((step, index) => (
              <div key={step} className="relative flex-1 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200" />
                <p className="text-sm font-semibold text-slate-900">{step}</p>
                {index < flow.length - 1 && (
                  <div className="absolute right-0 top-8 h-px w-full translate-x-1/2 bg-slate-300" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6 lg:hidden">
            {flow.map((step, index) => (
              <div key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Step {index + 1}</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
