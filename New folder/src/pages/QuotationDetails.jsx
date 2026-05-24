import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import QuoteDetails from '../features/quotations/QuoteDetails';
import { fetchQuotationWithItems } from '../services/quotationService';
import { fetchCustomerById } from '../services/inquiryService';
import { downloadQuotePDF } from '../services/pdfService';
import { approveQuotationAndCreateOrder } from '../services/orderService';

export default function QuotationDetailsPage() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quote, setQuote] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');

  const loadQuotation = async () => {
    if (!quotationId) return;
    setLoading(true);
    setError('');
    const { data, error: quoteError } = await fetchQuotationWithItems(quotationId);
    if (quoteError) {
      setError(quoteError.message || 'Unable to load quotation details.');
      setLoading(false);
      return;
    }

    setQuote(data);
    if (data?.customer_id) {
      const { data: customerData, error: customerError } = await fetchCustomerById(data.customer_id);
      if (customerError) {
        setError(customerError.message || 'Unable to load quotation customer.');
      } else {
        setCustomer(customerData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuotation();
  }, [quotationId]);

  const handlePreview = async () => {
    try {
      setPdfError('');
      await downloadQuotePDF(quote, customer || {});
    } catch (downloadError) {
      setPdfError(downloadError.message || 'Unable to download quotation PDF.');
    }
  };

  const handleConvert = async () => {
    try {
      setActionLoading(true);
      setError('');
      const { error: orderError } = await approveQuotationAndCreateOrder({
        quotationId: quote.id,
        customerNote: `Converted from quotation ${quote.quotation_number || quote.quote_number || quote.id}`,
        actorId: user?.id || null,
      });
      if (orderError) {
        throw orderError;
      }
      await loadQuotation();
    } catch (orderError) {
      setError(orderError.message || 'Unable to convert quotation to order.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/quotations');
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Quotation detail"
            title="Quotation lifecycle details"
            description="Review quote metadata, download the latest PDF, or move the quotation into the order workflow."
          />
          {error ? (
            <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
          ) : null}
          {pdfError ? (
            <div className="rounded-[28px] border border-slate-700/20 bg-slate-900/90 p-4 text-sm text-slate-200">{pdfError}</div>
          ) : null}
        </div>
        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center text-slate-300">Loading quotation details…</div>
        ) : quote ? (
          <QuoteDetails
            quote={quote}
            customer={customer}
            onPrint={handlePreview}
            onPreview={handlePreview}
            onConvert={handleConvert}
            onEdit={handleEdit}
            onDelete={() => null}
          />
        ) : (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center text-slate-300">Quotation not found.</div>
        )}
      </Container>
    </main>
  );
}
