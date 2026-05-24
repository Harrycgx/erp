import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import SupplierCard from '../features/inventory/SupplierCard';
import SupplierForm from '../features/inventory/SupplierForm';
import { fetchSuppliers, insertSupplier } from '../services/supplierService';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSuppliers = async () => {
    setLoading(true);
    const result = await fetchSuppliers();
    if (result.error) {
      setError(result.error.message);
      setSuppliers([]);
    } else {
      setSuppliers(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleAddSupplier = async (supplier) => {
    setLoading(true);
    const { error } = await insertSupplier({ ...supplier, created_at: new Date().toISOString() });
    if (error) {
      setError(error.message);
    } else {
      await loadSuppliers();
    }
    setLoading(false);
  };

  const metrics = useMemo(
    () => [
      { value: suppliers.length, label: 'Suppliers onboarded' },
      { value: suppliers.filter((supplier) => supplier.payment_terms?.toLowerCase().includes('net 30')).length, label: 'Net 30 terms' },
      { value: suppliers.filter((supplier) => supplier.notes).length, label: 'Performance notes' },
    ],
    [suppliers]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.6fr_0.95fr] xl:items-start">
          <SectionHeading
            eyebrow="Supplier network"
            title="Supplier and procurement partner management"
            description="Track supplier relationships, payment terms, and procurement performance notes in a factory-ready workspace."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-10 text-center text-slate-400">Loading suppliers…</div>
            ) : suppliers.length ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-10 text-center text-slate-400">No suppliers found. Add a supplier to begin procurement tracking.</div>
            )}
          </div>

          <SupplierForm onSubmit={handleAddSupplier} loading={loading} />
        </div>
      </Container>
    </main>
  );
}
