export default function ChatMessage({ author = 'User', message = 'Chat message goes here.' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{author}</div>
      <p className="mt-2 text-slate-600">{message}</p>
    </div>
  );
}
