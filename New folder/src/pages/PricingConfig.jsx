import { useEffect, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import PricingEditor from '../features/quotations/PricingEditor';
import { fetchPricingRule, insertPricingRule, updatePricingRule } from '../services/pricingService';

export default function PricingConfig() {
  const [pricingRule, setPricingRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadRule = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchPricingRule();
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }
    setPricingRule(data || null);
    setLoading(false);
  };

  useEffect(() => {
    loadRule();
  }, []);

  const handleSave = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (pricingRule?.id) {
        const { error: updateError } = await updatePricingRule(pricingRule.id, {
          ...formData,
          updated_at: new Date().toISOString(),
        });
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await insertPricingRule({
          ...formData,
          updated_at: new Date().toISOString(),
        });
        if (insertError) throw insertError;
      }
      await loadRule();
    } catch (err) {
      setError(err.message || 'Unable to save pricing configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <SectionHeading
          eyebrow="Admin pricing"
          title="Configure pricing rules for quote calculations"
          description="Manage material, print, lamination, tooling, labor, rush, and GST rates from one secure admin panel."
        />

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <PricingEditor rule={pricingRule} onSave={handleSave} saving={saving} />
          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Latest pricing snapshot</p>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>Material: ₹{pricingRule?.material_rate || '--'} / kg</p>
              <p>Print: ₹{pricingRule?.print_rate || '--'} / unit</p>
              <p>Lamination: ₹{pricingRule?.lamination_rate || '--'} / m²</p>
              <p>Tooling: ₹{pricingRule?.tooling_rate || '--'} / setup</p>
              <p>Labor: ₹{pricingRule?.labor_rate || '--'} / unit</p>
              <p>Rush: ₹{pricingRule?.rush_charge || '--'} / unit</p>
              <p>GST: {pricingRule?.gst_rate ? `${Number(pricingRule.gst_rate) * 100}%` : '--'}</p>
              <p className="text-slate-500">Updated at: {pricingRule?.updated_at ? new Date(pricingRule.updated_at).toLocaleString() : '—'}</p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
