import { useState } from 'react';
import PDFPreview from '../features/pdf/PDFPreview';
import PDFQuoteGenerator from '../features/pdf/PDFQuoteGenerator';
import QuoteStatusBadge from '../features/quotations/QuoteStatusBadge';
import QuoteToOrderModal from '../features/orders/QuoteToOrderModal';
import { formatCurrency } from '../utils/pdfHelpers';

export default function QuotePreview({ quote, customer, documents, onDownload, onSaveVersion, onConvert, onBack, loading, error }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quote lifecycle</p>
                <h1 className="mt-2 text-3xl font-black text-white">Professional quote output</h1>
                <p className="mt-2 text-sm text-slate-400">Download, version, and convert the selected quotation into a production order.</p>
              </div>
              <div className="space-y-2 text-right text-sm text-slate-300">
                <p>Quote status</p>
                <QuoteStatusBadge status={quote?.status || 'Draft'} />
              </div>
            </div>

            {error ? <div className="rounded-3xl border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

            <PDFPreview quote={quote} customer={customer} />
          </div>

          <div className="space-y-6">
            <PDFQuoteGenerator
              quote={quote}
              customer={customer}
              documents={documents}
              loading={loading}
              onDownload={onDownload}
              onSaveVersion={onSaveVersion}
              onConvert={() => setModalOpen(true)}
              onBack={onBack}
            />
            <div className="rounded-[28px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <h2 className="text-sm uppercase tracking-[0.3em] text-slate-400">Quote summary</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span>Customer</span>
                  <span className="font-semibold text-white">{customer?.company_name || 'Not selected'}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Total amount</span>
                  <span className="font-semibold text-white">{formatCurrency(quote?.total)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Created</span>
                  <span className="font-semibold text-white">{new Date(quote?.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuoteToOrderModal
        open={modalOpen}
        quote={quote}
        onClose={() => setModalOpen(false)}
        onConvert={() => {
          setModalOpen(false);
          onConvert();
        }}
      />
    </main>
  );
}
