import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import QuoteHistory from '../features/quotations/QuoteHistory';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerPortalData } from '../services/customerPortalService';

export default function CustomerQuotations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCustomerQuotations = async () => {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await fetchCustomerPortalData(user?.id);
    if (loadError) {
      setError(loadError.message || 'Unable to load customer quotations.');
      setQuotations([]);
      setCustomer(null);
    } else {
      setCustomer(data.customer);
      setQuotations(data.quotations || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadCustomerQuotations();
    }
  }, [user?.id]);

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Customer quotations"
            title="Review your quotations"
            description="View active quotes and requested revisions for your registered customer account."
          />
          {error ? (
            <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
          ) : null}
        </div>
        {loading ? (
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-12 text-center text-slate-300">Loading your quotations…</div>
        ) : (
          <QuoteHistory
            quotations={quotations}
            customers={customer ? [customer] : []}
            search={search}
            status={status}
            onSearch={setSearch}
            onStatusChange={setStatus}
            onView={(quote) => navigate(`/customer/quotations/${quote.id}`)}
          />
        )}
      </Container>
    </main>
  );
}
