import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import StatCard from '../components/ui/StatCard';
import { fetchDispatchRecords, insertDispatchRecord } from '../services/dispatchService';
import { fetchProductionJobs, updateProductionJob } from '../services/productionService';
import { buildLrNumber } from '../utils/dispatchHelpers';
import { formatDate, normalizeStage } from '../utils/productionHelpers';

const initialForm = {
  orderId: '',
  vehicleNumber: '',
  driverName: '',
  driverPhone: '',
  deliveryStatus: 'In Transit',
  notes: '',
};

export default function Dispatch() {
  const [records, setRecords] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [jobsResult, recordsResult] = await Promise.all([fetchProductionJobs(), fetchDispatchRecords()]);
    if (jobsResult.error || recordsResult.error) {
      setError(jobsResult.error?.message || recordsResult.error?.message || 'Unable to load dispatch data.');
      setJobs([]);
      setRecords([]);
    } else {
      setJobs(jobsResult.data || []);
      setRecords(recordsResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const readyJobs = useMemo(() => jobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready'), [jobs]);
  const metrics = useMemo(
    () => [
      { value: readyJobs.length, label: 'Ready to dispatch' },
      { value: records.length, label: 'Dispatch history' },
      { value: jobs.filter((job) => normalizeStage(job.production_stage) === 'qc').length, label: 'QC items' },
    ],
    [jobs, readyJobs.length, records.length]
  );

  const handleSelectOrder = (job) => {
    setSelectedOrder(job);
    setForm({
      orderId: job.order_id || job.id,
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      deliveryStatus: 'In Transit',
      notes: '',
    });
  };

  const handleDispatch = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const dispatchRecord = {
      order_id: selectedOrder.order_id || selectedOrder.id,
      vehicle_number: form.vehicleNumber,
      driver_name: form.driverName,
      driver_phone: form.driverPhone,
      dispatch_date: new Date().toISOString(),
      delivery_status: form.deliveryStatus,
      lr_number: buildLrNumber(selectedOrder.order_id || selectedOrder.id),
      notes: form.notes,
      created_at: new Date().toISOString(),
    };

    const { error: dispatchError } = await insertDispatchRecord(dispatchRecord);
    if (dispatchError) {
      setError(dispatchError.message || 'Unable to create dispatch record.');
      setSaving(false);
      return;
    }

    const { error: jobError } = await updateProductionJob(selectedOrder.id, { production_stage: 'delivered', dispatch_status: 'Dispatched' });
    if (jobError) {
      setError(jobError.message || 'Unable to update job status.');
    }

    await loadData();
    setSelectedOrder(null);
    setForm(initialForm);
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.85fr] xl:items-start">
          <SectionHeading
            eyebrow="Dispatch operations"
            title="Manage shipping and delivery records"
            description="Assign vehicles, drivers and shipment records while tracking final delivery status."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Ready shipments</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Orders in dispatch queue</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{readyJobs.length} orders</span>
              </div>
              <div className="space-y-4">
                {readyJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectOrder(job)}
                    className="w-full rounded-[28px] border border-slate-800 bg-slate-900/90 p-4 text-left transition hover:border-orange-500"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{job.order_number || `Order ${job.order_id || job.id}`}</p>
                        <p className="mt-1 text-sm text-slate-400">{job.box_type || 'Corrugated packaging'} • {job.quantity || 0} pcs</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{job.priority || 'Normal'}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">ETA {formatDate(job.estimated_completion)}</div>
                  </button>
                ))}
                {!readyJobs.length && <p className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No dispatch-ready orders yet.</p>}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatch record</p>
                <h2 className="mt-2 text-2xl font-black text-white">New shipment</h2>
              </div>
              <div className="grid gap-4">
                <input
                  type="text"
                  value={form.vehicleNumber}
                  onChange={(event) => setForm({ ...form, vehicleNumber: event.target.value })}
                  placeholder="Vehicle number"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <input
                  type="text"
                  value={form.driverName}
                  onChange={(event) => setForm({ ...form, driverName: event.target.value })}
                  placeholder="Driver name"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <input
                  type="tel"
                  value={form.driverPhone}
                  onChange={(event) => setForm({ ...form, driverPhone: event.target.value })}
                  placeholder="Driver phone"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <select
                  value={form.deliveryStatus}
                  onChange={(event) => setForm({ ...form, deliveryStatus: event.target.value })}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                >
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  rows={4}
                  placeholder="Notes"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={saving || !selectedOrder}
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.18)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Dispatching…' : selectedOrder ? 'Create dispatch record' : 'Select an order to dispatch'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[32px] border border-slate-700 bg-slate-950/95 p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatch history</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Shipment records</h2>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{records.length}</span>
              </div>
              <div className="space-y-4">
                {records.length ? (
                  records.map((record) => (
                    <div key={record.id} className="rounded-3xl border border-slate-800 bg-slate-900/85 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{record.lr_number || 'LR pending'}</p>
                          <p className="mt-1 text-slate-400 text-sm">Order {record.order_id}</p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">{record.delivery_status || 'Pending'}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300">
                        <p>Vehicle: {record.vehicle_number || 'N/A'}</p>
                        <p>Driver: {record.driver_name || 'N/A'}</p>
                        <p>Date: {formatDate(record.dispatch_date)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 text-sm text-slate-400">No dispatch records are available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
