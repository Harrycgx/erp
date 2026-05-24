/**
 * Shared loading / empty / error states for operational pages.
 */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-8 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export function EmptyState({ message = 'No records found.', action = null }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-center text-sm text-slate-500">
      <p>{message}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-rose-600/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
      <span>{message}</span>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} className="shrink-0 text-rose-300 hover:text-white">
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
