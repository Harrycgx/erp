import { getProductionBadgeClasses } from '../../utils/productionHelpers';

export default function ProductionStageBadge({ stage }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${getProductionBadgeClasses(stage)}`}>
      {stage || 'Pending'}
    </span>
  );
}
