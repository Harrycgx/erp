import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import CustomerForm from '../features/inquiries/CustomerForm';
import CustomerDetails from '../features/inquiries/CustomerDetails';
import { fetchCustomers, fetchInquiries, insertCustomer, updateCustomer } from '../services/inquiryService';
import { countRepeatCustomers } from '../utils/inquiryHelpers';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [customerResponse, inquiryResponse] = await Promise.all([fetchCustomers(), fetchInquiries()]);

    if (customerResponse.error) {
      setError(customerResponse.error.message);
      setLoading(false);
      return;
    }

    if (inquiryResponse.error) {
      setError(inquiryResponse.error.message);
      setLoading(false);
      return;
    }

    setCustomers(customerResponse.data || []);
    setInquiries(inquiryResponse.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const customerMetrics = useMemo(() => ({
    total: customers.length,
    repeat: countRepeatCustomers(customers, inquiries),
  }), [customers, inquiries]);

  const selectedCustomerInquiries = useMemo(() => {
    if (!selectedCustomer) return [];
    return inquiries.filter((item) => item.customer_id === selectedCustomer.id);
  }, [selectedCustomer, inquiries]);

  const handleSaveCustomer = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editingCustomer) {
        const { error: updateError } = await updateCustomer(editingCustomer.id, payload);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await insertCustomer(payload);
        if (insertError) throw insertError;
      }
      await loadData();
      setEditingCustomer(null);
    } catch (err) {
      setError(err.message || 'Unable to save customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditingCustomer(null);
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Customer management"
              title="Build stronger accounts with customer history"
              description="Track customer details, delivery history, and inquiry activity from a single enterprise panel."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={customerMetrics.total} label="Total customers" />
              <StatCard value={customerMetrics.repeat} label="Repeat customers" />
              <StatCard value={inquiries.length} label="Total inquiries" />
              <StatCard value={selectedCustomerInquiries.length} label="Selected history" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer health</p>
            <h3 className="mt-3 text-3xl font-black text-white">Account readiness</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Manage priority accounts, track repeat orders, and surface high-value prospects for sales follow-up.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Customer roster</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Accounts</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCustomer({})}
                  className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                >
                  Add customer
                </button>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full table-auto text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Repeat orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => {
                      const repeatCount = inquiries.filter((item) => item.customer_id === customer.id).length;
                      return (
                        <tr
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="cursor-pointer border-b border-slate-800 hover:bg-slate-900/80"
                        >
                          <td className="px-4 py-4 text-white">{customer.company_name}</td>
                          <td className="px-4 py-4 text-slate-300">{customer.full_name}</td>
                          <td className="px-4 py-4 text-slate-300">{customer.phone}</td>
                          <td className="px-4 py-4 text-slate-300">{repeatCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <CustomerForm
              customer={editingCustomer?.id ? editingCustomer : null}
              onSave={handleSaveCustomer}
              onCancel={() => setEditingCustomer(null)}
              saving={saving}
            />
            <CustomerDetails customer={selectedCustomer} inquiries={selectedCustomerInquiries} />
          </div>
        </div>
      </Container>
    </main>
  );
}
