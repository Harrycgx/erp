import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';

export default function Admin() {
  return (
    <main className="bg-slate-50 text-slate-900 min-h-screen pt-28">
      <Container className="space-y-8 py-16">
        <SectionHeading
          eyebrow="Admin"
          title="An enterprise admin console will connect operational controls and analytics."
          description="Future iterations will include user management, access controls, and manufacturing configuration workflows."
        />
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </Container>
    </main>
  );
}
