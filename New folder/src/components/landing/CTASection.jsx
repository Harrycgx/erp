import Container from '../ui/Container';
import PrimaryButton from '../ui/PrimaryButton';
import SecondaryButton from '../ui/SecondaryButton';
import SectionHeading from '../ui/SectionHeading';

export default function CTASection() {
  return (
    <section id="contact" className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-24 text-white">
      <Container className="text-center">
        <SectionHeading
          center
          eyebrow="Ready to scale packaging excellence?"
          title="Start your custom quote with BoxIQ today."
          description="Bring premium packaging, efficient manufacturing, and responsive service into one streamlined experience."
          titleClassName="text-white"
          descriptionClassName="text-slate-300"
        />

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <PrimaryButton className="bg-orange-500 text-slate-950 hover:bg-orange-400">Request a quote</PrimaryButton>
          <SecondaryButton className="border-slate-700 bg-slate-950/10 text-slate-100 hover:border-slate-500">Speak with our team</SecondaryButton>
        </div>
      </Container>
    </section>
  );
}
