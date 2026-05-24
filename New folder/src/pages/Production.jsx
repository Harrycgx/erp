import { useEffect, useMemo, useState } from 'react';
import ProductionBoard from '../features/production/ProductionBoard';
import ProductionTable from '../features/production/ProductionTable';
import ProductionDetails from '../features/production/ProductionDetails';
import ProductionFilters from '../features/production/ProductionFilters';
import MachineStatus from '../features/production/MachineStatus';
import ProductionAlerts from '../features/production/ProductionAlerts';
import DispatchReadyBoard from '../features/production/DispatchReadyBoard';
import { fetchProductionJobs, updateProductionJob } from '../services/productionService';
import { normalizeStage, PRODUCTION_STAGES } from '../utils/productionHelpers';
import SectionHeading from '../components/ui/SectionHeading';
import Container from '../components/ui/Container';
import StatCard from '../components/ui/StatCard';

export default function Production() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({ stage: '', priority: '', staff: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
      if (!selectedJob && data?.length) setSelectedJob(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleUpdateJob = async (id, updates) => {
    setSaving(true);
    const { error: updateError } = await updateProductionJob(id, updates);
    if (updateError) {
      setError(updateError.message || 'Unable to update production job.');
    } else {
      await loadJobs();
      const refreshed = jobs.find((job) => job.id === id);
      if (refreshed) setSelectedJob({ ...refreshed, ...updates });
    }
    setSaving(false);
  };

  const handleStageChange = async (job, stage) => {
    setSaving(true);
    const { error: updateError } = await updateProductionJob(job.id, { production_stage: stage });
    if (updateError) {
      setError(updateError.message || 'Unable to move production job.');
    } else {
      await loadJobs();
      setSelectedJob((current) => (current?.id === job.id ? { ...current, production_stage: stage } : current));
    }
    setSaving(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const stageMatch = filters.stage ? normalizeStage(job.production_stage) === filters.stage : true;
      const priorityMatch = filters.priority ? job.priority === filters.priority : true;
      const staffMatch = filters.staff
        ? [job.assigned_staff, job.machine_name, job.order_number, job.box_type].some((field) =>
            field?.toLowerCase().includes(filters.staff.toLowerCase())
          )
        : true;
      return stageMatch && priorityMatch && staffMatch;
    });
  }, [jobs, filters]);

  const metrics = useMemo(
    () => [
      { value: jobs.length, label: 'Jobs in production' },
      { value: jobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready').length, label: 'Ready to dispatch' },
      { value: jobs.filter((job) => normalizeStage(job.production_stage) === 'qc').length, label: 'QC queue' },
    ],
    [jobs]
  );

  return (
    <main className="min-h-screen bg-[#0B1020] text-white pt-28">
      <Container className="space-y-10 py-16">
        <div className="grid gap-10 xl:grid-cols-[1.5fr_0.85fr] xl:items-start">
          <SectionHeading
            eyebrow="Factory operations"
            title="Production workflow management"
            description="Track order progress on the shop floor, assign staff, monitor machine status, and manage dispatch readiness."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard key={metric.label} value={metric.value} label={metric.label} />
            ))}
          </div>
        </div>

        {error ? <div className="rounded-[28px] border border-rose-600/20 bg-rose-600/10 p-4 text-sm text-rose-100">{error}</div> : null}

        <ProductionFilters filters={filters} onChange={setFilters} />

        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.85fr]">
          <div className="space-y-8">
            <ProductionBoard jobs={filteredJobs} onStageChange={handleStageChange} onSelectJob={setSelectedJob} selectedJob={selectedJob} />
            <ProductionTable jobs={filteredJobs} onSelectJob={setSelectedJob} />
          </div>

          <div className="space-y-8">
            <MachineStatus jobs={jobs} />
            <ProductionAlerts jobs={jobs} />
            <DispatchReadyBoard jobs={jobs.filter((job) => normalizeStage(job.production_stage) === 'dispatch_ready')} onSelectJob={setSelectedJob} />
            {selectedJob ? <ProductionDetails job={selectedJob} onUpdateJob={handleUpdateJob} /> : null}
          </div>
        </div>
      </Container>
    </main>
  );
}
