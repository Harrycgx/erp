import QuoteTemplate from './QuoteTemplate';

export default function PDFPreview({ quote, customer }) {
  return (
    <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Preview</p>
          <h2 className="mt-2 text-2xl font-black text-white">Quotation preview</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Print-friendly layout</span>
      </div>
      <QuoteTemplate quote={quote} customer={customer} />
    </div>
  );
}
