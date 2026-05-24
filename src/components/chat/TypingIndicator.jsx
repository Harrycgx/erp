export default function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-600">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-slate-500" />
      Typing...
    </div>
  );
}
