import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import QuoteDetails from '../features/quotations/QuoteDetails';
import {
  fetchCustomerPortalData,
  fetchCustomerQuotationDetail,
  approveCustomerQuotation,
  rejectCustomerQuotation,
  requestCustomerQuotationRevision,
} from '../services/customerPortalService';

export default function CustomerQuotationDetails() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [note, setNote] = useState('');

  const loadQuotation = async () => {
    setLoading(true);
    setError('');
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && user?.id) {
      const { data: portalData } = await fetchCustomerPortalData(user.id);
      resolvedCustomerId = portalData?.customer?.id || null;
      setCustomerId(resolvedCustomerId);
    }

    const { data, error: loadError } = await fetchCustomerQuotationDetail(quotationId, resolvedCustomerId);
    if (loadError) {
      setError(loadError.message || 'Unable to load quotation.');
      setQuotation(null);
    } else {
      setQuotation(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (quotationId) loadQuotation();
  }, [quotationId]);

  const handleSubmitAction = async () => {
    setActionLoading(true);
    setError('');

    let response;
    if (modalAction === 'approve') {
      response = await approveCustomerQuotation({ quotation, note, actorId: user?.id, customerId });
    } else if (modalAction === 'reject') {
      response = await rejectCustomerQuotation({ quotation, note, actorId: user?.id, customerId });
    } else {
      response = await requestCustomerQuotationRevision({ quotation, note, actorId: user?.id, customerId });
    }

    if (response.error) {
      setError(response.error.message || 'Unable to complete quotation action.');
    } else {
      setNote('');
      setModalAction('');
      await loadQuotation();
    }

    setActionLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Customer quotation"
            title="Quotation review"
            description="Approve, reject, or request a revision for this quote from your customer portal."
          />
          {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}
        </div>
        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center text-slate-300">Loading quotation details…</div>
        ) : quotation ? (
          <div className="space-y-6">
            <QuoteDetails
              quote={quotation}
              customer={null}
              onPrint={() => null}
              onPreview={() => null}
              onConvert={() => null}
              onEdit={() => null}
              onDelete={() => null}
              showActions={false}
              showApprovalPanel
              approvalProps={{
                onApprove: () => setModalAction('approve'),
                onReject: () => setModalAction('reject'),
                onRequestRevision: () => setModalAction('revision'),
                loading: actionLoading,
              }}
            />
            {modalAction ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6">
                <h3 className="text-lg font-bold text-white">
                  {modalAction === 'approve' ? 'Approve quotation' : modalAction === 'reject' ? 'Reject quotation' : 'Request revision'}
                </h3>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Add a note for staff"
                  className="mt-4 w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setModalAction('')} className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleSubmitAction}
                    className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${modalAction === 'approve' ? 'bg-emerald-500 hover:bg-emerald-400' : modalAction === 'reject' ? 'bg-rose-500 hover:bg-rose-400' : 'bg-cyan-500 hover:bg-cyan-400'}`}
                  >
                    {actionLoading
                      ? 'Saving…'
                      : modalAction === 'approve'
                      ? 'Approve quotation'
                      : modalAction === 'reject'
                      ? 'Reject quotation'
                      : 'Request revision'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center text-slate-300">Quotation not found.</div>
        )}
      </Container>
    </main>
  );
}
