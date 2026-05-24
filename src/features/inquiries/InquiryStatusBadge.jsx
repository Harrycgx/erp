import { statusClasses } from '../../utils/inquiryHelpers';

export default function InquiryStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusClasses(status)}`}>
      {status}
    </span>
  );
}
