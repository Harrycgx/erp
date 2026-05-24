export default function DownloadQuoteButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded-full border border-orange-500 bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? 'Preparing PDF…' : 'Download PDF'}
    </button>
  );
}
