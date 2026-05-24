import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import FinanceInvoiceTable from '../features/finance/FinanceInvoiceTable';
import { fetchInvoices } from '../services/invoiceService';
import { fetchCustomers } from '../services/inquiryService';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [inv, cust] = await Promise.all([fetchInvoices(), fetchCustomers()]);
      if (inv.error || cust.error) {
        setError(inv.error?.message || cust.error?.message);
      } else {
        setInvoices(inv.data || []);
        setCustomers(cust.data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <SectionHeading
          eyebrow="Invoices"
          title="Customer invoices"
          description="Generated when production jobs reach dispatch ready. Open a row for payments and PDF."
        />
        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}
        <FinanceInvoiceTable invoices={invoices} customers={customers} loading={loading} />
      </Container>
    </main>
  );
}
