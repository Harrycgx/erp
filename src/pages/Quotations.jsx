import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import QuoteForm from '../features/quotations/QuoteForm';
import QuoteHistory from '../features/quotations/QuoteHistory';
import QuoteSummary from '../features/quotations/QuoteSummary';
import QuoteBreakdown from '../features/quotations/QuoteBreakdown';
import QuotePreviewCard from '../features/quotations/QuotePreviewCard';
import PDFPreview from '../features/pdf/PDFPreview';
import PDFQuoteGenerator from '../features/pdf/PDFQuoteGenerator';
import { fetchCustomers, fetchInquiries } from '../services/inquiryService';
import { createQuotationWithItems, fetchQuotations, fetchQuotationWithItems, insertQuotation, updateQuotation, updateQuotationWithItems, deleteQuotation } from '../services/quotationService';
import { approveQuotationWorkflow } from '../services/quotationApprovalService';
import { downloadQuotePDF, fetchQuoteDocuments, saveQuoteDocument } from '../services/pdfService';
import { fetchPricingRule } from '../services/pricingService';
import { calculateQuotePricing } from '../utils/pricingCalculations';
import { QUOTE_STATUSES } from '../utils/quotationHelpers';

const defaultQuote = {
  customer_id: '',
  inquiry_id: '',
  box_type: '',
  length: '',
  width: '',
  height: '',
  quantity: '',
  flute_type: '',
  ply: '',
  gsm: '',
  printing_type: 'None',
  lamination: 'None',
  tooling_cost: '',
  stitching: '',
  urgency: 'Standard',
  status: 'draft',
};

export default function Quotations() {
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [pricingRule, setPricingRule] = useState(null);
  const [activeQuote, setActiveQuote] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [customerRes, inquiryRes, quoteRes, pricingRes] = await Promise.all([
      fetchCustomers(),
      fetchInquiries(),
      fetchQuotations(),
      fetchPricingRule(),
    ]);

    if (customerRes.error || inquiryRes.error || quoteRes.error || pricingRes.error) {
      setError(
        customerRes.error?.message || inquiryRes.error?.message || quoteRes.error?.message || pricingRes.error?.message || 'Failed to load quotation data.'
      );
      setLoading(false);
      return;
    }

    setCustomers(customerRes.data || []);
    setInquiries(inquiryRes.data || []);
    setQuotations(quoteRes.data || []);
    setPricingRule(pricingRes.data || null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuotes = useMemo(() => {
    return quotations.filter((quote) => {
      const searchLower = search.toLowerCase();
      const customer = customers.find((item) => item.id === quote.customer_id);
      const searchMatch = [customer?.company_name, quote.box_type, quote.printing_type].some((field) =>
        field?.toLowerCase().includes(searchLower)
      );
      const statusMatch = statusFilter ? quote.status === statusFilter : true;
      return (search ? searchMatch : true) && statusMatch;
    });
  }, [quotations, customers, search, statusFilter]);

  const currentQuote = activeQuote || defaultQuote;
  const currentPricing = pricingRule ? calculateQuotePricing(currentQuote, pricingRule) : {
    materialCost: 0,
    printCost: 0,
    laminationCost: 0,
    toolingCost: 0,
    laborCost: 0,
    wastageCost: 0,
    rushCharge: 0,
    subtotal: 0,
    gst: 0,
    total: 0,
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setError('');
    const { quotation_items: quotationItems = [], ...quotePayload } = payload;
    const pricing = pricingRule ? calculateQuotePricing(payload, pricingRule) : null;

    try {
      const record = {
        ...quotePayload,
        subtotal: pricing?.subtotal || 0,
        gst: pricing?.gst || 0,
        total: pricing?.total || 0,
      };
      if (activeQuote?.id) {
        const { error: updateError } = quotationItems.length
          ? await updateQuotationWithItems(activeQuote.id, record, quotationItems)
          : await updateQuotation(activeQuote.id, record);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = quotationItems.length
          ? await createQuotationWithItems(record, quotationItems)
          : await insertQuotation(record);
        if (insertError) throw insertError;
      }
      await loadData();
      setActiveQuote(null);
      setSelectedQuote(null);
    } catch (err) {
      setError(err.message || 'Unable to save quotation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quote) => {
    if (!window.confirm('Delete this quotation?')) return;
    setError('');
    setLoading(true);
    const { error: deleteError } = await deleteQuotation(quote.id);
    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }
    await loadData();
  };
  
  const loadQuoteDocuments = async (quoteId) => {
    setPreviewLoading(true);
    const { data, error: docError } = await fetchQuoteDocuments(quoteId);
    if (docError) {
      setPreviewError(docError.message || 'Unable to load document history.');
      setDocuments([]);
    } else {
      setDocuments(data || []);
    }
    setPreviewLoading(false);
  };

  const handleViewQuote = async (quote) => {
    const { data: quoteWithItems, error: quoteError } = await fetchQuotationWithItems(quote.id);
    const nextQuote = quoteError ? quote : quoteWithItems;
    setSelectedQuote(nextQuote);
    setActiveQuote(nextQuote);
    setPreviewError('');
    await loadQuoteDocuments(quote.id);
  };

  const handleClosePreview = () => {
    setSelectedQuote(null);
    setDocuments([]);
    setPreviewError('');
  };

  const handleDownloadQuote = async (quote) => {
    try {
      setPdfLoading(true);
      const customer = customers.find((item) => item.id === quote.customer_id);
      await downloadQuotePDF(quote, customer || {});
    } catch (downloadError) {
      setPreviewError(downloadError.message || 'Unable to download PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSaveQuoteVersion = async (quote) => {
    try {
      setPdfLoading(true);
      const version = documents.length + 1;
      const customer = customers.find((item) => item.id === quote.customer_id);
      const { error: saveError } = await saveQuoteDocument(quote.id, quote, customer || {}, version);
      if (saveError) {
        throw saveError;
      }
      await loadQuoteDocuments(quote.id);
    } catch (saveError) {
      setPreviewError(saveError.message || 'Unable to save quote version.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleConvertQuoteToOrder = async (payload = {}) => {
    try {
      setOrderLoading(true);
      setPreviewError('');
      const { data, error: orderError } = await approveQuotationWorkflow({
        quotationId: selectedQuote.id,
        note: payload.notes || selectedQuote.notes || '',
        actorId: user?.id || null,
      });
      if (orderError) {
        throw orderError;
      }
      await loadData();
      setSelectedQuote(null);
      if (data?.productionError) {
        setPreviewError(`Sales order created. Production start: ${data.productionError.message || data.productionError}`);
      }
      const salesOrderId = data?.salesOrder?.id;
      if (salesOrderId) {
        navigate(`/sales-orders/${salesOrderId}`);
      }
    } catch (orderError) {
      setPreviewError(orderError.message || 'Unable to approve and convert quotation.');
    } finally {
      setOrderLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.85fr] xl:items-start">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Quotation engine"
              title="Build dynamic quotes for corrugated packaging"
              description="Collect specifications, calculate costs, and manage quote status from one operational panel."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={quotations.length} label="Total quotes" />
              <StatCard value={quotations.filter((item) => String(item.status).toLowerCase() === 'sent').length} label="Sent" />
              <StatCard value={quotations.filter((item) => String(item.status).toLowerCase() === 'approved').length} label="Approved" />
              <StatCard value={quotations.filter((item) => String(item.status).toLowerCase() === 'expired').length} label="Expired" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Pricing rule</p>
            {pricingRule ? (
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p>Material rate: ₹{pricingRule.material_rate}/kg</p>
                <p>Print rate: ₹{pricingRule.print_rate}/unit</p>
                <p>Lamination rate: ₹{pricingRule.lamination_rate}/m²</p>
                <p>Labor rate: ₹{pricingRule.labor_rate}/unit</p>
                <p>GST: {Number(pricingRule.gst_rate) * 100}%</p>
              </div>
            ) : (
              <p className="mt-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">No pricing rules are configured yet.</p>
            )}
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.25fr_0.85fr]">
          <div className="space-y-6">
            <QuoteForm
              customers={customers}
              inquiries={inquiries}
              quote={activeQuote}
              onSave={handleSave}
              onCancel={() => setActiveQuote(null)}
              loading={saving}
            />

            <QuoteHistory
              quotations={filteredQuotes}
              customers={customers}
              search={search}
              status={statusFilter}
              onSearch={setSearch}
              onStatusChange={setStatusFilter}
              onView={handleViewQuote}
            />
          </div>

          <div className="space-y-6">
            <QuotePreviewCard quote={activeQuote || defaultQuote} customer={customers.find((item) => item.id === (activeQuote?.customer_id || defaultQuote.customer_id))} />
            <QuoteSummary quote={activeQuote || defaultQuote} pricing={currentPricing} />
            <QuoteBreakdown pricing={currentPricing} />
          </div>
        </div>
      </Container>
      {selectedQuote ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-6xl rounded-3xl overflow-hidden">
            <div className="grid gap-6 md:grid-cols-[1fr_420px]">
              <PDFPreview quote={selectedQuote} customer={customers.find((item) => item.id === selectedQuote.customer_id)} />
              <PDFQuoteGenerator
                quote={selectedQuote}
                customer={customers.find((item) => item.id === selectedQuote.customer_id)}
                documents={documents}
                loading={pdfLoading || previewLoading || orderLoading}
                onDownload={() => handleDownloadQuote(selectedQuote)}
                onSaveVersion={() => handleSaveQuoteVersion(selectedQuote)}
                onConvert={(payload) => handleConvertQuoteToOrder(payload)}
                onBack={handleClosePreview}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
