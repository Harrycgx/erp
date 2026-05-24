import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, FileText, PackageCheck, UserRound, XCircle } from 'lucide-react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import QuoteStatusBadge from '../features/quotations/QuoteStatusBadge';
import { useAuth } from '../context/AuthContext';
import { approveCustomerQuotation, fetchCustomerPortalData, fetchCustomerQuotationDetail, rejectCustomerQuotation } from '../services/customerPortalService';
import { formatCurrency } from '../utils/formatters';

const orderStages = ['pending', 'confirmed', 'in_production', 'quality_check', 'dispatch_ready', 'dispatched', 'delivered'];

function Toast({ message, type, onClose }) {
  if (!message) return null;
  const classes = type === 'error' ? 'border-rose-600/30 bg-rose-600/15 text-rose-100' : 'border-emerald-600/30 bg-emerald-600/15 text-emerald-100';
  return (
    <div className={`fixed right-6 top-28 z-50 max-w-sm rounded-3xl border px-5 py-4 text-sm shadow-xl shadow-black/20 ${classes}`}>
      <div className="flex items-start justify-between gap-4">
        <p>{message}</p>
        <button type="button" onClick={onClose} className="text-xs uppercase tracking-[0.2em] opacity-70 hover:opacity-100">Close</button>
      </div>
    </div>
  );
}

function ApprovalModal({ quotation, action, loading, onCancel, onSubmit }) {
  const [note, setNote] = useState('');
  if (!quotation || !action) return null;
  const isApprove = action === 'approve';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          {isApprove ? <CheckCircle className="mt-1 h-6 w-6 text-emerald-400" /> : <XCircle className="mt-1 h-6 w-6 text-rose-400" />}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{isApprove ? 'Approve quotation' : 'Reject quotation'}</p>
            <h2 className="mt-2 text-2xl font-black">{quotation.quotation_number || quotation.box_type || 'Quotation'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {isApprove ? 'Approval will create an order and lock the current quotation pricing.' : 'Rejection will notify staff and keep your notes with the quotation.'}
            </p>
          </div>
        </div>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Add notes or comments"
          className="mt-6 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onSubmit(note)}
            className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${isApprove ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
          >
            {loading ? 'Saving...' : isApprove ? 'Approve and create order' : 'Reject quotation'}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuotationLayout({ quotation }) {
  if (!quotation) return null;
  return (
    <div className="rounded-[32px] border border-slate-700 bg-white p-6 text-slate-950 shadow-xl shadow-black/20 print:shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quotation</p>
          <h3 className="mt-2 text-3xl font-black">{quotation.quotation_number || quotation.id}</h3>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{new Date(quotation.created_at).toLocaleDateString()}</p>
          <p>Total {formatCurrency(Number(quotation.total || 0))}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Box</p>
          <p className="mt-1 font-semibold">{quotation.box_type || 'Packaging'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quantity</p>
          <p className="mt-1 font-semibold">{quotation.quantity || 0}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
          <p className="mt-1 font-semibold capitalize">{String(quotation.status || '').replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-3">Item</th>
              <th className="py-3">Qty</th>
              <th className="py-3">Unit</th>
              <th className="py-3">Discount</th>
              <th className="py-3">Tax</th>
              <th className="py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(quotation.items || []).map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 font-medium">{item.item_name}</td>
                <td className="py-3">{item.quantity}</td>
                <td className="py-3">{formatCurrency(Number(item.unit_price || 0))}</td>
                <td className="py-3">{formatCurrency(Number(item.discount_amount || 0))}</td>
                <td className="py-3">{formatCurrency(Number(item.tax_amount || 0))}</td>
                <td className="py-3 text-right font-semibold">{formatCurrency(Number(item.total || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-2 text-right text-sm">
        <p>Subtotal: <span className="font-semibold">{formatCurrency(Number(quotation.subtotal || 0))}</span></p>
        <p>Tax: <span className="font-semibold">{formatCurrency(Number(quotation.tax_amount || quotation.gst || 0))}</span></p>
        <p className="text-lg">Total: <span className="font-black">{formatCurrency(Number(quotation.total || 0))}</span></p>
      </div>
    </div>
  );
}

function OrderTimeline({ order }) {
  const currentIndex = Math.max(orderStages.indexOf(String(order.production_stage || order.status || 'pending').toLowerCase()), 0);
  return (
    <div className="space-y-3">
      {orderStages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${index <= currentIndex ? 'bg-orange-400' : 'bg-slate-700'}`} />
          <span className={`text-sm capitalize ${index <= currentIndex ? 'text-white' : 'text-slate-500'}`}>{stage.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}

export default function CustomerPortal() {
  const { user, profile } = useAuth();
  const [portalData, setPortalData] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [activeTab, setActiveTab] = useState('quotations');
  const [modalAction, setModalAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadPortal = async () => {
    setLoading(true);
    const { data, error } = await fetchCustomerPortalData(user?.id);
    if (error) {
      setToast({ message: error.message || 'Unable to load portal data.', type: 'error' });
      setPortalData(null);
    } else {
      setPortalData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPortal();
  }, [user?.id]);

  const metrics = useMemo(() => ({
    quotations: portalData?.quotations?.length || 0,
    activeOrders: portalData?.orders?.filter((order) => !['delivered', 'cancelled'].includes(String(order.status).toLowerCase())).length || 0,
    invoices: portalData?.invoices?.length || 0,
  }), [portalData]);

  const handleSelectQuote = async (quote) => {
    const { data, error } = await fetchCustomerQuotationDetail(quote.id);
    if (error) {
      setToast({ message: error.message || 'Unable to open quotation.', type: 'error' });
      return;
    }
    setSelectedQuote(data);
  };

  const handleApprovalSubmit = async (note) => {
    setActionLoading(true);
    const response = modalAction === 'approve'
      ? await approveCustomerQuotation({ quotation: selectedQuote, note, actorId: user?.id })
      : await rejectCustomerQuotation({ quotation: selectedQuote, note, actorId: user?.id });

    if (response.error) {
      setToast({ message: response.error.message || 'Unable to update quotation.', type: 'error' });
    } else {
      setToast({ message: modalAction === 'approve' ? 'Quotation approved and order created.' : 'Quotation rejected.', type: 'success' });
      setModalAction('');
      setSelectedQuote(null);
      await loadPortal();
    }
    setActionLoading(false);
  };

  const customer = portalData?.customer;
  const canActOnQuote = selectedQuote && ['sent', 'draft', 'revision_requested', 'revised'].includes(String(selectedQuote.status || '').toLowerCase());

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <SectionHeading
            eyebrow="Customer portal"
            title="Quotes, orders, invoices, and account details"
            description="Review quotations, approve confirmed pricing, track active orders, and view account records from one secure workspace."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard value={metrics.quotations} label="Quotations" />
            <StatCard value={metrics.activeOrders} label="Active orders" />
            <StatCard value={metrics.invoices} label="Invoices" />
          </div>
        </div>

        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-10 text-center text-slate-300">Loading customer workspace...</div>
        ) : !customer ? (
          <div className="rounded-[32px] border border-amber-500/20 bg-amber-500/10 p-8 text-amber-100">
            No customer account is linked to this login yet. Ask staff to connect your user profile to a customer record.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              {[
                ['quotations', FileText, 'Quotations'],
                ['orders', PackageCheck, 'Orders'],
                ['invoices', FileText, 'Invoices'],
                ['account', UserRound, 'Account'],
              ].map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${activeTab === key ? 'border-orange-400 bg-orange-500 text-white' : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900'}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'quotations' ? (
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
                  <h2 className="text-2xl font-black">Quotation history</h2>
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full text-left text-sm text-slate-300">
                      <thead className="border-b border-slate-800 text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Quote</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portalData.quotations.map((quote) => (
                          <tr key={quote.id} className="border-b border-slate-800">
                            <td className="px-4 py-4 text-white">{quote.quotation_number || quote.box_type || quote.id}</td>
                            <td className="px-4 py-4"><QuoteStatusBadge status={quote.status} /></td>
                            <td className="px-4 py-4">{formatCurrency(Number(quote.total || 0))}</td>
                            <td className="px-4 py-4">
                              <button type="button" onClick={() => handleSelectQuote(quote)} className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                        {!portalData.quotations.length ? (
                          <tr><td className="px-4 py-8 text-slate-500" colSpan={4}>No quotations are available.</td></tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <QuotationLayout quotation={selectedQuote} />
                  {selectedQuote ? (
                    <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6">
                      <div className="flex flex-wrap gap-3">
                        <button type="button" disabled={!canActOnQuote} onClick={() => setModalAction('approve')} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50">
                          Approve
                        </button>
                        <button type="button" disabled={!canActOnQuote} onClick={() => setModalAction('reject')} className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeTab === 'orders' ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {portalData.orders.map((order) => (
                  <div key={order.id} className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Order</p>
                        <h2 className="mt-2 text-2xl font-black">{order.order_number || order.id}</h2>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{order.status}</span>
                    </div>
                    <OrderTimeline order={order} />
                  </div>
                ))}
                {!portalData.orders.length ? <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-8 text-slate-400">No active orders are available.</div> : null}
              </div>
            ) : null}

            {activeTab === 'invoices' ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6">
                <h2 className="text-2xl font-black">Invoices</h2>
                <div className="mt-6 space-y-3">
                  {portalData.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
                      <span>{invoice.invoice_number || invoice.id}</span>
                      <span className="text-slate-400">{invoice.status}</span>
                      <span className="font-semibold">{formatCurrency(Number(invoice.total || 0))}</span>
                    </div>
                  ))}
                  {!portalData.invoices.length ? <p className="text-slate-500">No invoices are available.</p> : null}
                </div>
              </div>
            ) : null}

            {activeTab === 'account' ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6">
                <h2 className="text-2xl font-black">Account profile</h2>
                <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                  <p><span className="text-slate-500">Company:</span> {customer.company_name}</p>
                  <p><span className="text-slate-500">Contact:</span> {customer.contact_name || customer.full_name || profile?.full_name}</p>
                  <p><span className="text-slate-500">Phone:</span> {customer.phone || profile?.phone || 'Not provided'}</p>
                  <p><span className="text-slate-500">Email:</span> {customer.email || user?.email}</p>
                  <p><span className="text-slate-500">GST:</span> {customer.gst_number || 'Not provided'}</p>
                  <p><span className="text-slate-500">Status:</span> {customer.status}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Container>
      <ApprovalModal
        quotation={selectedQuote}
        action={modalAction}
        loading={actionLoading}
        onCancel={() => setModalAction('')}
        onSubmit={handleApprovalSubmit}
      />
    </main>
  );
}
