import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import QuotationHeaderForm from '../features/quotations/QuotationHeaderForm';
import QuotationItemEditor from '../features/quotations/QuotationItemEditor';
import QuotationTotalsPanel from '../features/quotations/QuotationTotalsPanel';
import { useAuth } from '../context/AuthContext';
import { useQuotationBuilder } from '../hooks/useQuotationBuilder';
import { fetchCustomers, fetchInquiries } from '../services/inquiryService';
import { fetchQuotationWithItems } from '../services/quotationService';

export default function QuoteBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const builder = useQuotationBuilder();

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);
      setLoadError('');

      const [customerRes, inquiryRes, previewNumber] = await Promise.all([
        fetchCustomers(),
        fetchInquiries(),
        builder.loadPreviewNumber(),
      ]);

      if (!active) return;

      if (customerRes.error || inquiryRes.error) {
        setLoadError(customerRes.error?.message || inquiryRes.error?.message || 'Failed to load reference data.');
        setLoading(false);
        return;
      }

      setCustomers(customerRes.data || []);
      setInquiries(inquiryRes.data || []);

      if (editId) {
        const { data: quote, error } = await fetchQuotationWithItems(editId);
        if (!active) return;
        if (error) {
          setLoadError(error.message || 'Unable to load quotation.');
        } else if (quote) {
          builder.setQuotationState(quote, quote.items);
        }
      } else if (previewNumber) {
        builder.setField('quotation_number', previewNumber);
      }

      setLoading(false);
    };

    bootstrap();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleSaveDraft = async () => {
    setSaveMessage('');
    const result = await builder.save({ persist: false, actorId: user?.id || null });
    if (result.error) return;
    setSaveMessage(`Draft prepared (${result.data?.quotation_number || builder.quotationNumberPreview}). Not saved to database.`);
  };

  const handleSave = async () => {
    setSaveMessage('');
    const result = await builder.save({
      persist: true,
      actorId: user?.id || null,
    });

    if (result.error) return;

    setSaveMessage(`Quotation saved: ${result.data?.quotation_number || result.data?.quote_number || 'OK'}`);
    if (result.data?.id) {
      navigate(`/quotations/${result.data.id}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 pt-24">
        <Container className="py-8">
          <p className="text-sm text-slate-600">Loading quote builder…</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pt-24 text-slate-900">
      <Container className="space-y-4 py-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quotations</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {editId ? 'Edit quotation' : 'New quotation'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Build line items, review GST totals, then save to the quotation register.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link to="/quotations" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50">
              All quotations
            </Link>
          </div>
        </header>

        {loadError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{loadError}</div>
        ) : null}

        {builder.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{builder.error}</div>
        ) : null}

        {builder.validationErrors.length ? (
          <ul className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {builder.validationErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}

        {saveMessage ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{saveMessage}</div>
        ) : null}

        <form
          className="grid gap-4 xl:grid-cols-[1fr_280px]"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <QuotationHeaderForm
              quotation={builder.quotation}
              customers={customers}
              inquiries={inquiries}
              onFieldChange={builder.setField}
            />

            <QuotationItemEditor
              items={builder.items}
              calculatedItems={builder.calculatedItems}
              onItemChange={builder.updateItem}
              onAddItem={builder.addItem}
              onRemoveItem={builder.removeItem}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={builder.saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {builder.saving ? 'Saving…' : 'Save quotation'}
              </button>
              <button
                type="button"
                disabled={builder.saving}
                onClick={handleSaveDraft}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Validate & preview payload
              </button>
              <button
                type="button"
                onClick={builder.reset}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Reset form
              </button>
            </div>
          </div>

          <QuotationTotalsPanel
            totals={builder.totals}
            quotationNumber={builder.quotation.quotation_number || builder.quotationNumberPreview}
          />
        </form>

        {user?.id ? (
          <p className="text-xs text-slate-500">Prepared by user {user.id.slice(0, 8)}…</p>
        ) : null}
      </Container>
    </main>
  );
}
