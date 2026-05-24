import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';

export default function QuoteBuilder() {
  return (
    <main className="bg-slate-50 text-slate-900 min-h-screen pt-28">
      <Container className="space-y-8 py-16">
        <SectionHeading
          eyebrow="Quote builder"
          title="A scalable quote design workspace is on the roadmap."
          description="This page will host the interactive packaging configuration engine for precise, enterprise-grade estimates."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </Container>
    </main>
  );
}
