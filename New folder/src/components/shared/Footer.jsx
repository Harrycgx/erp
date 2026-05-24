export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">© {new Date().getFullYear()} BoxIQ. Premium packaging intelligence.</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
}
