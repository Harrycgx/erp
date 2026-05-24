import { useEffect, useMemo, useState } from 'react';
import Container from '../components/ui/Container';
import SectionHeading from '../components/ui/SectionHeading';
import ProductionTable from '../features/production/ProductionTable';
import ProductionFilters from '../features/production/ProductionFilters';
import DispatchReadyBoard from '../features/production/DispatchReadyBoard';
import { fetchProductionJobs } from '../services/productionService';
import { isOverdue, normalizeStage, PRODUCTION_STAGES } from '../utils/productionHelpers';

export default function Production() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ stage: '', priority: '', staff: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    const { data, error: fetchError } = await fetchProductionJobs();
    if (fetchError) {
      setError(fetchError.message || 'Unable to load production jobs.');
      setJobs([]);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const stageMatch = filters.stage ? normalizeStage(job.production_stage) === filters.stage : true;
      const priorityMatch = filters.priority ? job.priority === filters.priority : true;
      const staffMatch = filters.staff
        ? [job.assigned_to, job.order_number, job.box_type, job.production_number].some((field) =>
            field?.toLowerCase().includes(filters.staff.toLowerCase())
          )
        : true;
      return stageMatch && priorityMatch && staffMatch;
    });
  }, [jobs, filters]);

  const queueSummary = useMemo(
    () => ({
      active: jobs.filter((j) => !['delivered', 'dispatched'].includes(normalizeStage(j.production_stage))).length,
      pending: jobs.filter((j) => normalizeStage(j.production_stage) === 'pending').length,
      dispatchReady: jobs.filter((j) => normalizeStage(j.production_stage) === 'dispatch_ready').length,
      delayed: jobs.filter((j) => isOverdue(j)).length,
    }),
    [jobs]
  );

  const dispatchReady = filteredJobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready');

  return (
    <main className="min-h-screen bg-[#090d16] pt-28 text-white">
      <Container className="space-y-6 py-12">
        <SectionHeading
          eyebrow="Factory floor"
          title="Production queue"
          description="Active jobs, stage progress, and dispatch readiness from confirmed sales orders."
        />

        {error ? (
          <div className="rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">{error}</div>
        ) : null}

        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5">
            Active: <strong className="text-white">{queueSummary.active}</strong>
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5">
            Pending: <strong className="text-white">{queueSummary.pending}</strong>
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5">
            Dispatch ready: <strong className="text-white">{queueSummary.dispatchReady}</strong>
          </span>
          <span className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-3 py-1.5">
            Delayed: <strong className="text-amber-100">{queueSummary.delayed}</strong>
          </span>
        </div>

        <ProductionFilters filters={filters} onChange={setFilters} />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            {loading ? (
              <p className="text-sm text-slate-400">Loading jobs…</p>
            ) : (
              <ProductionTable jobs={filteredJobs} linkToDetail />
            )}
          </div>

          <div className="space-y-6">
            <DispatchReadyBoard jobs={dispatchReady} linkToDetail />
            <div className="rounded-xl border border-slate-700 bg-slate-950/90 p-4 text-sm text-slate-400">
              <p className="font-medium text-slate-300">Stages</p>
              <p className="mt-2 text-xs leading-relaxed">
                {PRODUCTION_STAGES.map((s) => s.replace(/_/g, ' ')).join(' → ')}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
