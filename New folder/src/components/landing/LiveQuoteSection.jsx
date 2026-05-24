import { useState } from 'react';
import Container from '../ui/Container';
import SectionHeading from '../ui/SectionHeading';
import PrimaryButton from '../ui/PrimaryButton';
import StatCard from '../ui/StatCard';

const options = [
  { label: 'Corrugated luxury', price: '₹3.4L', material: 'Rigid corrugated', timeline: '14 days' },
  { label: 'Mail-ready shells', price: '₹2.1L', material: 'Lightweight craft', timeline: '10 days' },
  { label: 'Industrial cartons', price: '₹4.8L', material: 'High-strength board', timeline: '18 days' },
];

const chatLines = [
  { role: 'assistant', text: 'What packaging format are you exploring today?' },
  { role: 'user', text: 'I need 2,500 units with premium brand presentation.' },
  { role: 'assistant', text: 'Great. Let me match capacity, material, and delivery expectations.' },
];

function ChatBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`rounded-3xl p-5 shadow-sm ${isUser ? 'self-end bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} ${isUser ? 'shadow-[0_16px_40px_rgba(15,23,42,0.12)]' : 'border border-slate-200'}`}>
      <p className="text-sm leading-7">{text}</p>
    </div>
  );
}

function BoxPreview() {
  return (
    <svg viewBox="0 0 320 220" className="h-full w-full">
      <defs>
        <linearGradient id="boxGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x="20" y="40" width="280" height="140" rx="24" fill="url(#boxGrad)" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M60 40 L100 16 H220 L260 40" fill="#cbd5e1" opacity="0.9" />
      <path d="M95 16 L95 40" stroke="#94a3b8" strokeWidth="2" />
      <path d="M225 16 L225 40" stroke="#94a3b8" strokeWidth="2" />
      <rect x="80" y="90" width="160" height="60" rx="14" fill="#f1f5f9" />
      <circle cx="150" cy="120" r="18" fill="#f97316" opacity="0.92" />
    </svg>
  );
}

export default function LiveQuoteSection() {
  const [selected, setSelected] = useState(options[0]);

  return (
    <section id="quote" className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24">
      <Container className="space-y-12">
        <SectionHeading
          eyebrow="Live quote experience"
          title="Intelligent packaging quotes in a conversational flow."
          description="Feel how BoxIQ understands your volume, specs, and timeline in real time with an enterprise-friendly interface."
        />

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Interactive assistant</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Packaging workflow</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">
                Live mode
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {chatLines.map((line) => (
                <ChatBubble key={line.text} role={line.role} text={line.text} />
              ))}
            </div>

            <div className="rounded-[28px] bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Packaging type</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelected(option)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 ${selected.label === option.label ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quantity</p>
                <p className="mt-3 text-3xl font-black text-slate-900">2,500</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dimensions</p>
                <p className="mt-3 text-3xl font-black text-slate-900">400×300×120 mm</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-[32px] border border-slate-200 bg-slate-900/95 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.12)] text-white">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative space-y-6">
              <div className="rounded-3xl bg-slate-950/95 p-6 shadow-sm shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Live quote preview</p>
                <p className="mt-4 text-4xl font-black tracking-tight">{selected.price}</p>
                <p className="mt-2 text-sm text-slate-400">Estimated project cost for the selected configuration.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/90 p-5 shadow-sm border border-white/10">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Material</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selected.material}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/90 p-5 shadow-sm border border-white/10">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Timeline</p>
                  <p className="mt-3 text-lg font-semibold text-white">{selected.timeline}</p>
                </div>
              </div>

              <div className="rounded-[28px] bg-slate-950/90 p-6 shadow-sm border border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Delivery estimate</p>
                    <p className="mt-3 text-lg font-semibold text-white">Doorstep in 21 days</p>
                  </div>
                  <p className="rounded-full bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-200">Priority</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard value="450K" label="Monthly capacity" className="bg-slate-950/90 text-white" />
                <StatCard value="98%" label="On-time rate" className="bg-slate-950/90 text-white" />
                <StatCard value="24h" label="Quote speed" className="bg-slate-950/90 text-white" />
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-5 shadow-inner shadow-slate-900/10">
                <div className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-400">Visual preview</div>
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-4">
                  <BoxPreview />
                </div>
              </div>

              <PrimaryButton className="w-full">Start your quote</PrimaryButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
