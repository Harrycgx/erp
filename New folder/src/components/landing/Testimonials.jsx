import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';

const testimonials = [
  {
    quote: 'BoxIQ helped us scale packaging for a new premium line without sacrificing quality or lead time.',
    name: 'Nina Patel',
    role: 'Operations Director, Heritage Retail',
  },
  {
    quote: 'The production transparency and accuracy gave us confidence for large seasonal launches.',
    name: 'Rahul Sen',
    role: 'Head of Supply Chain, Luxe Gifts',
  },
  {
    quote: 'Their live quote workflow made procurement decisions faster and more reliable.',
    name: 'Ananya Mehta',
    role: 'VP, FMCG Packaging',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-24">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Client perspective"
          title="Trusted feedback from manufacturing leaders."
          description="Built for large-scale packaging programs that demand precision, speed, and dependable execution."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote
              key={item.name}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
            >
              <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
              <div className="mt-6 space-y-1 text-sm text-slate-500">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p>{item.role}</p>
              </div>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
