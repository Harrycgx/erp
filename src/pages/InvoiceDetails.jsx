import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import InvoiceStatusBadge from '../features/finance/InvoiceStatusBadge';
import RecordPaymentForm from '../features/finance/RecordPaymentForm';
import { fetchCustomerById } from '../services/inquiryService';
import { fetchInvoiceWithDetails } from '../services/invoiceService';
import { recordPayment } from '../services/paymentService';
import { downloadInvoicePDF } from '../services/pdfService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/financeHelpers';

export default function InvoiceDetails() {
  const { invoiceId } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchInvoiceWithDetails(invoiceId);
    if (fetchError) {
      setError(fetchError.message || 'Unable to load invoice.');
      setLoading(false);
      return;
    }
    setInvoice(data);
    if (data?.customer_id) {
      const { data: customerData } = await fetchCustomerById(data.customer_id);
      setCustomer(customerData);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [invoiceId]);

  const handlePayment = async (payload) => {
    setPaying(true);
    setError('');
    const { error: payError } = await recordPayment({
      invoiceId,
      customerId: invoice.customer_id,
      ...payload,
      createdBy: user?.id || null,
    });
    if (payError) {
      setError(payError.message || 'Unable to record payment.');
    } else {
      await load();
    }
    setPaying(false);
  };

  const handleDownloadPdf = async () => {
    setPdfError('');
    try {
      await downloadInvoicePDF({ ...invoice, items: invoice.items }, customer || {});
    } catch (err) {
      setPdfError(err.message || 'Unable to download PDF.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12 text-sm text-slate-400">Loading invoice…</Container>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12">
          <p className="text-rose-200">{error || 'Invoice not found.'}</p>
          <Link to="/finance" className="mt-4 inline-block text-sm text-orange-400">
            Finance
          </Link>
        </Container>
      </main>
    );
  }

  const salesOrderId = invoice.sales_order_id || invoice.metadata?.sales_order_id;

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            eyebrow="Invoice"
            title={invoice.invoice_number}
            description={customer?.company_name || customer?.full_name || 'Customer'}
          />
          <div className="flex flex-wrap items-center gap-2">
            <InvoiceStatusBadge invoice={invoice} />
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
            >
              Download PDF
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}
        {pdfError ? (
          <div className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-300">{pdfError}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Invoice date</dt>
                  <dd>{formatDate(invoice.invoice_date || invoice.issue_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Due date</dt>
                  <dd>{formatDate(invoice.due_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sales order</dt>
                  <dd>
                    {salesOrderId ? (
                      <Link to={`/sales-orders/${salesOrderId}`} className="text-orange-400 hover:text-orange-300">
                        View SO
                      </Link>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">GSTIN / contact</dt>
                  <dd>{customer?.gstin || customer?.phone || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Line items</p>
              <table className="mt-3 w-full text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2 text-left">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2">Rate</th>
                    <th className="pb-2">GST</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item) => (
                    <tr key={item.id} className="border-t border-slate-800">
                      <td className="py-2 text-slate-200">{item.item_name}</td>
                      <td className="py-2 text-center text-slate-400">{item.quantity}</td>
                      <td className="py-2 text-slate-400">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2 text-slate-400">{((item.gst_percentage || 0) * 100).toFixed(0)}%</td>
                      <td className="py-2 text-right text-slate-200">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Payment history</p>
              {(invoice.payments || []).length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {invoice.payments.map((payment) => (
                    <li key={payment.id} className="flex justify-between gap-3 border-b border-slate-800 py-2">
                      <span className="text-slate-300">
                        {formatDate(payment.payment_date)} · {payment.payment_method || '—'}
                        {payment.transaction_reference ? ` · ${payment.transaction_reference}` : ''}
                      </span>
                      <span className="font-medium text-emerald-300">{formatCurrency(payment.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No payments recorded.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs uppercase text-slate-500">Totals</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(invoice.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>Discount</dt>
                  <dd>{formatCurrency(invoice.discount_amount)}</dd>
                </div>
                <div className="flex justify-between text-slate-400">
                  <dt>GST</dt>
                  <dd>{formatCurrency(invoice.gst_amount)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-semibold text-white">
                  <dt>Total</dt>
                  <dd>{formatCurrency(invoice.total_amount)}</dd>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <dt>Paid</dt>
                  <dd>{formatCurrency(invoice.paid_amount)}</dd>
                </div>
                <div className="flex justify-between text-amber-300">
                  <dt>Due</dt>
                  <dd>{formatCurrency(invoice.due_amount)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase text-slate-400">Record payment</p>
              <div className="mt-3">
                <RecordPaymentForm invoice={invoice} onSubmit={handlePayment} loading={paying} />
              </div>
            </div>
          </div>
        </div>

        <Link to="/finance" className="text-sm text-orange-400 hover:text-orange-300">
          ← Finance overview
        </Link>
      </Container>
    </main>
  );
}
