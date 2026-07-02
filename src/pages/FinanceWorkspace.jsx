import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import ERPTable from "../components/ui/ERPTable";
import SearchBar from "../components/ui/SearchBar";
import KPIStrip from "../components/ui/KPIStrip";

export default function FinanceWorkspace() {
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [invRes, ledRes] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("financial_ledger").select("*").order("created_at", { ascending: false }).limit(5)
    ]);
    // Format dates and status for raw table compatibility
    setInvoices((invRes.data || []).map(i => ({
      ...i,
      formatted_date: new Date(i.due_date).toLocaleDateString("en-IN"),
      display_amount: `₹${Number(i.invoice_amount || 0).toLocaleString()}`
    })));
    setLedger(ledRes.data || []);
  }

  const stats = useMemo(() => {
    const revenue = invoices.reduce((s, i) => s + Number(i.invoice_amount || 0), 0);
    const outstanding = invoices.reduce((s, i) => s + Number(i.due_amount || 0), 0);
    const collected = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
    const overdueCount = invoices.filter(i => new Date(i.due_date) < new Date() && Number(i.due_amount) > 0).length;

    return [
      { label: "Revenue", value: `₹${(revenue/100000).toFixed(1)}L` },
      { label: "Outstanding", value: `₹${(outstanding/100000).toFixed(1)}L` },
      { label: "Collected", value: `₹${(collected/100000).toFixed(1)}L` },
      { label: "Overdue", value: overdueCount },
      { label: "Invoices", value: invoices.length }
    ];
  }, [invoices]);

  return (
    <div className="p-4 space-y-4 bg-slate-950 min-h-screen text-slate-200">
      <KPIStrip items={stats} />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-9">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase">Invoice Register</h2>
            <SearchBar onSearch={setSearch} />
          </div>
          <ERPTable 
            columns={[
              { key: "invoice_number", label: "Invoice #" },
              { key: "customer_name", label: "Customer" },
              { key: "display_amount", label: "Total" },
              { key: "formatted_date", label: "Due Date" },
              { key: "payment_status", label: "Status" }
            ]}
            data={invoices.filter(i => i.invoice_number?.includes(search))}
          />
        </div>
        
        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded p-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Recent Ledger Activity</h3>
            {ledger.map(l => (
              <div key={l.id} className="text-xs py-2 border-b border-slate-800 last:border-0 flex justify-between">
                <span>{l.account_name}</span>
                <span className="font-mono">₹{Number(l.amount).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="bg-blue-600 text-[10px] font-bold py-2 rounded">Create Invoice</button>
              <button className="bg-slate-800 text-[10px] font-bold py-2 rounded">Record Payment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}