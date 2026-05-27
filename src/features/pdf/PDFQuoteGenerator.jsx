import DownloadQuoteButton from './DownloadQuoteButton';

export default function PDFQuoteGenerator({ quote, customer, documents, onDownload, onSaveVersion, onConvert, loading, onBack }) {
  return (
    <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quotation document</p>
          <h2 className="mt-2 text-2xl font-black text-white">PDF generator</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <DownloadQuoteButton onClick={onDownload} loading={loading} />
          <button
            type="button"
            onClick={onSaveVersion}
            disabled={loading}
            className="rounded-full border border-slate-700 bg-slate-900/90 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save version
          </button>
          <button
            type="button"
            onClick={onConvert}
            disabled={loading || !['approved', 'sent'].includes(String(quote.status || '').toLowerCase())}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.18)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Convert to order
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-4 text-sm text-slate-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold text-white">Quote status</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{quote.status || 'Draft'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Latest version</span>
          <span className="font-semibold text-white">{documents?.[0]?.version || 1}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Customer</span>
          <span className="font-semibold text-white">{customer?.company_name || 'Unknown'}</span>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Document versions</h3>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-slate-300 underline underline-offset-4 transition hover:text-white"
          >
            Back to quotes
          </button>
        </div>
        <div className="space-y-3">
          {documents?.length ? (
            documents.map((doc) => (
              <div key={doc.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">Version {doc.version}</p>
                    <p className="text-slate-500">{new Date(doc.created_at).toLocaleString()}</p>
                  </div>
                  {doc.pdf_url ? (
                    <a
                      href={doc.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-700 bg-slate-950/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                    >
                      Open PDF
                    </a>
                  ) : (
                    <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-400">No file available</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 text-sm text-slate-400">No saved PDF versions yet. Generate the first version to track quote history.</p>
          )}
        </div>
      </div>
    </div>
  );
}
