export default function TopBar() {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      {/* Global Search */}
      <div className="w-96">
        <input 
          type="text" 
          placeholder="Search across all modules..." 
          className="w-full bg-background border border-border rounded px-4 py-2 text-sm text-textMain placeholder:text-textSub focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Global Context */}
      <div className="flex items-center gap-6 text-textSub text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold text-textSub/60">Location:</span>
          <span className="text-textMain font-medium">Plant A (Main)</span>
        </div>
        
        <div className="h-4 w-px bg-border" />
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-textMain text-xs font-bold">John Doe</p>
            <p className="text-[10px] uppercase tracking-wider text-primary">Admin</p>
          </div>
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}