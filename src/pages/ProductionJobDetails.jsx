import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductionStageBadge from '../features/production/ProductionStageBadge';
import ProductionTimeline from '../features/production/ProductionTimeline';
import InventoryReservationPanel from '../features/sales/InventoryReservationPanel';
import {
  completeProductionJob,
  fetchProductionJobWithDetails,
  updateProductionStage,
} from '../services/productionService';
import { PRODUCTION_STAGES, formatDateTime, formatStageLabel } from '../utils/productionHelpers';

export default function ProductionJobDetails() {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [consumeOnAdvance, setConsumeOnAdvance] = useState(true);

  const load = async () => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchProductionJobWithDetails(jobId);
    if (fetchError) {
      setError(fetchError.message || 'Unable to load production job.');
      setJob(null);
    } else {
      setJob(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [jobId]);

  const handleStageChange = async (nextStage) => {
    setSaving(true);
    setError('');
    const { data, error: stageError } = await updateProductionStage(jobId, nextStage, {
      actorId: user?.id || null,
      consumeMaterials: consumeOnAdvance && nextStage === 'printing',
    });
    if (stageError) {
      setError(stageError.message || 'Unable to update stage.');
    } else {
      await load();
      if (data) setJob((prev) => ({ ...prev, ...data }));
    }
    setSaving(false);
  };

  const handleComplete = async () => {
    setSaving(true);
    const { error: completeError } = await completeProductionJob(jobId, { actorId: user?.id || null });
    if (completeError) {
      setError(completeError.message || 'Unable to complete job.');
    } else {
      await load();
    }
    setSaving(false);
  };

  const currentIndex = PRODUCTION_STAGES.indexOf(job?.production_stage || 'pending');
  const nextStage = currentIndex >= 0 && currentIndex < PRODUCTION_STAGES.length - 1 ? PRODUCTION_STAGES[currentIndex + 1] : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12 text-sm text-slate-400">Loading production job…</Container>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-[#090d16] pt-28 text-white">
        <Container className="py-12">
          <p className="text-rose-200">{error || 'Job not found.'}</p>
          <Link to="/production" className="mt-4 inline-block text-sm text-orange-400">
            Back to production
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            eyebrow="Production job"
            title={job.production_number || 'Production job'}
            description={job.order_number || job.metadata?.sales_order_number || 'Manufacturing execution'}
          />
          <ProductionStageBadge stage={job.production_stage} />
        </header>

        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Sales order</dt>
                  <dd>
                    {job.sales_order_id || job.metadata?.sales_order_id ? (
                      <Link
                        to={`/sales-orders/${job.sales_order_id || job.metadata?.sales_order_id}`}
                        className="text-orange-400 hover:text-orange-300"
                      >
                        {job.metadata?.sales_order_number || job.order_number}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Box / quantity</dt>
                  <dd className="text-slate-200">
                    {job.box_type || '—'} · {job.quantity || 0} pcs
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assigned</dt>
                  <dd className="text-slate-200">{job.assigned_to || 'Unassigned'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">ETA</dt>
                  <dd className="text-slate-200">{formatDateTime(job.estimated_completion)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Started</dt>
                  <dd className="text-slate-200">{formatDateTime(job.started_at)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Priority</dt>
                  <dd className="text-slate-200">{job.priority || 'Normal'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stage log</p>
              <ul className="mt-3 space-y-2">
                {(job.stages || []).map((stage) => (
                  <li key={stage.id} className="flex items-center justify-between gap-3 border-b border-slate-800 py-2 text-sm">
                    <span className="capitalize text-slate-300">{formatStageLabel(stage.stage_name)}</span>
                    <span className="text-slate-500">{stage.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ProductionTimeline currentStage={job.production_stage} />

            {job.metadata?.materials_consumed_at ? (
              <p className="text-xs text-emerald-400">
                Materials consumed at {formatDateTime(job.metadata.materials_consumed_at)}
              </p>
            ) : null}

            {job.metadata?.invoice_id ? (
              <p className="text-sm">
                <Link to={`/invoices/${job.metadata.invoice_id}`} className="text-orange-400 hover:text-orange-300">
                  Invoice {job.metadata.invoice_number || 'view'}
                </Link>
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4">
              <p className="text-xs uppercase text-slate-500">Actions</p>
              {nextStage ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleStageChange(nextStage)}
                  className="mt-3 w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  Advance to {formatStageLabel(nextStage)}
                </button>
              ) : null}
              <label className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={consumeOnAdvance}
                  onChange={(e) => setConsumeOnAdvance(e.target.checked)}
                />
                Consume reserved stock when entering printing
              </label>
              {job.production_stage !== 'delivered' ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleComplete}
                  className="mt-2 w-full rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-60"
                >
                  Mark delivered
                </button>
              ) : null}
            </div>

            <InventoryReservationPanel
              movements={job.reservation_movements || []}
              loading={false}
              error=""
            />
          </div>
        </div>

        <Link to="/production" className="text-sm text-orange-400 hover:text-orange-300">
          ← Production queue
        </Link>
      </Container>
    </main>
  );
}
