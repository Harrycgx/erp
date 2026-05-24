import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import VendorForm from '../features/procurement/VendorForm';
import VendorTable from '../features/procurement/VendorTable';
import VendorCard from '../features/procurement/VendorCard';
import { fetchVendors, insertVendor, updateVendor, deleteVendor } from '../services/vendorService';
import { fetchPurchaseOrders } from '../services/purchaseOrderService';
import { fetchGoodsReceipts } from '../services/procurementService';
import { calculateVendorScore, getPerformanceLabel } from '../utils/supplierAnalytics';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    const [vendorResp, poResp, receiptResp] = await Promise.all([fetchVendors(), fetchPurchaseOrders(), fetchGoodsReceipts()]);
    if (vendorResp.error || poResp.error || receiptResp.error) {
      setError(vendorResp.error?.message || poResp.error?.message || receiptResp.error?.message || 'Unable to load vendor data.');
      setVendors([]);
      setPurchaseOrders([]);
      setGoodsReceipts([]);
    } else {
      setVendors(vendorResp.data || []);
      setPurchaseOrders(poResp.data || []);
      setGoodsReceipts(receiptResp.data || []);
      if (!selectedVendor && vendorResp.data?.length) setSelectedVendor(vendorResp.data[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveVendor = async (vendor) => {
    setSaving(true);
    setError('');
    try {
      if (editingVendor?.id) {
        const { error: updateError } = await updateVendor(editingVendor.id, vendor);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await insertVendor({ ...vendor, created_at: new Date().toISOString() });
        if (insertError) throw insertError;
      }
      await loadData();
      setEditingVendor(null);
    } catch (err) {
      setError(err.message || 'Unable to save vendor.');
    }
    setSaving(false);
  };

  const handleDeleteVendor = async (id) => {
    setSaving(true);
    setError('');
    const { error } = await deleteVendor(id);
    if (error) {
      setError(error.message);
    } else {
      await loadData();
      if (selectedVendor?.id === id) setSelectedVendor(null);
    }
    setSaving(false);
  };

  const filteredVendors = useMemo(
    () => vendors.filter((vendor) => vendor.vendor_name.toLowerCase().includes(search.toLowerCase()) || vendor.contact_person?.toLowerCase().includes(search.toLowerCase()) || vendor.supplied_materials?.toLowerCase().includes(search.toLowerCase())),
    [vendors, search]
  );

  const selectedVendorOrders = useMemo(
    () => purchaseOrders.filter((order) => order.vendor_id === selectedVendor?.id),
    [purchaseOrders, selectedVendor]
  );

  const selectedVendorReceipts = useMemo(
    () => goodsReceipts.filter((receipt) => selectedVendorOrders.some((order) => order.id === receipt.purchase_order_id)),
    [goodsReceipts, selectedVendorOrders]
  );

  const selectedScore = useMemo(
    () => calculateVendorScore(selectedVendorOrders, selectedVendorReceipts),
    [selectedVendorOrders, selectedVendorReceipts]
  );

  return (
    <main className="min-h-screen bg-[#090d16] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.9fr] xl:items-start">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Vendor management"
              title="Manage suppliers, payment terms, and procurement history"
              description="Track vendor relationships, supplier materials, and procurement performance across raw material sourcing workflows."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard value={vendors.length} label="Vendors onboarded" />
              <StatCard value={purchaseOrders.length} label="Purchase orders" />
              <StatCard value={selectedVendorOrders.length} label="Selected vendor POs" />
              <StatCard value={selectedVendorReceipts.length} label="Receipt records" />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor snapshot</p>
            <h3 className="mt-3 text-3xl font-black text-white">Supplier sourcing</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">Search and review vendor terms, material coverage, and supplier score to keep procurement aligned with factory demand.</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vendor roster</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Supplier directory</h2>
                </div>
                <div className="relative max-w-sm">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search vendors, materials, terms"
                    className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <VendorTable
                  vendors={filteredVendors}
                  onEdit={(vendor) => { setEditingVendor(vendor); setSelectedVendor(vendor); }}
                  onDelete={handleDeleteVendor}
                  onSelect={(vendor) => setSelectedVendor(vendor)}
                  selectedVendor={selectedVendor}
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/90 p-6 shadow-xl shadow-black/20">
              <VendorCard vendor={selectedVendor} score={selectedScore} performanceLabel={getPerformanceLabel(selectedScore)} />
            </div>
          </div>

          <VendorForm
            vendor={editingVendor}
            onSubmit={handleSaveVendor}
            onCancel={() => setEditingVendor(null)}
            saving={saving}
          />
        </div>
      </Container>
    </main>
  );
}
