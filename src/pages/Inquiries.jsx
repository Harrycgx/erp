import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import InquiryFilters from '../features/inquiries/InquiryFilters';
import InquiryTable from '../features/inquiries/InquiryTable';
import InquiryForm from '../features/inquiries/InquiryForm';
import InquiryCard from '../features/inquiries/InquiryCard';
import { fetchCustomers, fetchInquiries, insertInquiry, updateInquiry, deleteInquiry } from '../services/inquiryService';
import { buildInquirySummary } from '../utils/inquiryHelpers';

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [inquiryResponse, customerResponse] = await Promise.all([fetchInquiries(), fetchCustomers()]);

    if (inquiryResponse.error) {
      setError(inquiryResponse.error.message);
      setLoading(false);
      return;
    }

    if (customerResponse.error) {
      setError(customerResponse.error.message);
      setLoading(false);
      return;
    }

    setInquiries(inquiryResponse.data || []);
    setCustomers(customerResponse.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const searchMatch = [item.box_type, item.notes, item.assigned_to].some((value) =>
        value?.toString().toLowerCase().includes(search.toLowerCase())
      );
      const customerMatch = customers.some((customer) => customer.id === item.customer_id && customer.company_name.toLowerCase().includes(search.toLowerCase()));
      const statusMatch = status ? item.status === status : true;
      const priorityMatch = priority ? item.priority === priority : true;
      return (search ? searchMatch || customerMatch : true) && statusMatch && priorityMatch;
    });
  }, [inquiries, customers, search, status, priority]);

  const summary = buildInquirySummary(inquiries);

  const getCustomerById = (id) => customers.find((customer) => customer.id === id);

  const handleSaveInquiry = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editingInquiry) {
        const { error: updateError } = await updateInquiry(editingInquiry.id, payload);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await insertInquiry(payload);
        if (insertError) throw insertError;
      }
      await loadData();
      setEditingInquiry(null);
    } catch (err) {
      setError(err.message || 'Unable to save inquiry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInquiry = async (inquiry) => {
    if (!window.confirm('Delete this inquiry? This action cannot be undone.')) return;
    setError('');
    setLoading(true);
    const { error: deleteError } = await deleteInquiry(inquiry.id);
    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }
    await loadData();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Inquiry management"
              title="Customer requests and quote pipeline"
              description="Track inquiries from initial contact through costing, quote delivery, negotiation, and final confirmation."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={summary.total} label="Total inquiries" />
              <StatCard value={summary.followUps} label="Pending follow-ups" />
              <StatCard value={summary.quoteSent} label="Quotations sent" />
              <StatCard value={summary.confirmed} label="Confirmed orders" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Operational pulse</p>
              <h3 className="mt-3 text-3xl font-black text-white">Pipeline health</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">Use inquiry volume and status insights to keep sales, costing, and production teams aligned.</p>
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Target overview</p>
                <span className="rounded-full bg-slate-900/90 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">Live</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <p>Total inquiries: <span className="font-semibold text-white">{summary.total}</span></p>
                <p>Lost opportunities: <span className="font-semibold text-white">{summary.lost}</span></p>
                <p>Costing stage: <span className="font-semibold text-white">{summary.costing}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <InquiryFilters
            search={search}
            status={status}
            priority={priority}
            onSearch={setSearch}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onCreate={() => setEditingInquiry({})}
          />

          {error ? (
            <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
          ) : null}

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="block xl:hidden">
                <div className="space-y-4">
                  {filteredInquiries.map((inquiry) => (
                    <InquiryCard
                      key={inquiry.id}
                      inquiry={inquiry}
                      customer={getCustomerById(inquiry.customer_id)}
                      onEdit={setEditingInquiry}
                      onDelete={handleDeleteInquiry}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden xl:block">
                <InquiryTable
                  inquiries={filteredInquiries}
                  customers={customers}
                  onEdit={setEditingInquiry}
                  onDelete={handleDeleteInquiry}
                />
              </div>
            </div>

            <div className="space-y-6">
              <InquiryForm
                customers={customers}
                inquiry={editingInquiry?.id ? editingInquiry : null}
                onSave={handleSaveInquiry}
                onCancel={() => setEditingInquiry(null)}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
