import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import ERPTable from "../components/ui/ERPTable";
import SearchBar from "../components/ui/SearchBar";
import KPIStrip from "../components/ui/KPIStrip";
import ActionDrawer, { DrawerSection } from "../components/ui/ActionDrawer";

export default function InventoryWorkspace() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qty, setQty] = useState(100);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [iRes, tRes, rRes] = await Promise.all([
      supabase.from("inventory_items").select("*"),
      supabase.from("inventory_transactions").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("inventory_reservations").select("*").eq("status", "active")
    ]);
    setItems(iRes.data || []);
    setTransactions(tRes.data || []);
    setReservations(rRes.data || []);
  }

  async function reserveStock(item, qty) {
    if (!item) return;
    setLoadingStates({ reserve: true });
    try {
      const { error } = await supabase.from("inventory_reservations").insert({
        item_id: item.id,
        quantity: Number(qty),
        reference_type: "production",
        status: "active",
      });
      if (error) throw error;
      await loadData();
      setSelectedItem(null);
      setDrawerOpen(false);
    } catch (err) { alert(err.message); } finally { setLoadingStates({}); }
  }

  async function handleAction(actionType, amount) {
    if (actionType === 'reserve') return reserveStock(selectedItem, amount);
    
    setLoadingStates({ [actionType]: true });
    try {
      const qty = Number(amount);
      if (actionType === 'issue' && Number(selectedItem.current_stock) < qty) throw new Error("Insufficient stock.");
      
      const newStock = actionType === 'receive' ? Number(selectedItem.current_stock) + qty : Number(selectedItem.current_stock) - qty;
      
      await supabase.from("inventory_items").update({ current_stock: newStock }).eq("id", selectedItem.id);
      await supabase.from("inventory_transactions").insert({
        inventory_item_id: selectedItem.id,
        transaction_type: actionType === 'receive' ? 'receipt' : 'issue',
        quantity: qty,
        reference_id: crypto.randomUUID()
      });
      
      await loadData();
      setSelectedItem(null);
      setDrawerOpen(false);
    } catch (err) { alert(err.message); } finally { setLoadingStates({}); }
  }

  const inventoryData = useMemo(() => items.map(item => {
    const reserved = reservations.filter(r => r.item_id === item.id).reduce((sum, r) => sum + (r.quantity || 0), 0);
    let status = (item.current_stock <= item.minimum_stock) ? "Critical" : (item.current_stock <= item.minimum_stock * 1.25) ? "Low" : "Healthy";
    return { ...item, reserved, available: (item.current_stock || 0) - reserved, status };
  }), [items, reservations]);

  const stats = useMemo(() => [
    { label: "Inventory Value", value: `₹${items.reduce((s, i) => s + (i.current_stock * i.cost_per_unit), 0).toLocaleString()}` },
    { label: "Low Stock", value: inventoryData.filter(i => i.status !== "Healthy").length },
    { label: "Active Res.", value: reservations.length },
    { label: "Materials", value: items.length }
  ], [items, inventoryData, reservations]);

  return (
    <div className="p-4 space-y-4 bg-slate-950 min-h-screen text-slate-200">
      <KPIStrip items={stats} />
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500">Inventory Master</h2>
            <SearchBar placeholder="Search materials..." onSearch={setSearch} />
          </div>
          <ERPTable 
            columns={[
              { key: "material_name", label: "Material" },
              { key: "material_code", label: "Code" },
              { key: "current_stock", label: "Stock" },
              { key: "available", label: "Available" },
              { key: "status", label: "Status", render: (r) => <span className={r.status === 'Critical' ? 'text-red-400 font-bold' : r.status === 'Low' ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{r.status}</span> },
            ]}
            data={inventoryData.filter(i => i.material_name?.toLowerCase().includes(search.toLowerCase()))}
            onRowClick={(item) => { setSelectedItem(item); setDrawerOpen(true); }}
          />
        </div>

        <div className="col-span-3 space-y-4">
          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Recent Movements</h3>
            {transactions.length === 0 ? <div className="text-xs text-slate-500">No transactions</div> : transactions.map(t => (
              <div key={t.id} className="text-xs py-1 flex justify-between border-b border-slate-800">
                <span className="capitalize">{t.transaction_type}</span>
                <span className={t.transaction_type === 'receipt' ? 'text-emerald-400' : 'text-red-400'}>{t.transaction_type === 'receipt' ? '+' : '-'}{t.quantity}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 p-3 rounded border border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Reserved Stock</h3>
            {reservations.length === 0 ? <div className="text-xs text-slate-500">No reservations</div> : reservations.slice(0,5).map(r => (
              <div key={r.id} className="text-xs py-1 flex justify-between cursor-pointer hover:text-white" onClick={() => { setSelectedItem(items.find(i => i.id === r.item_id)); setDrawerOpen(true); }}>
                <span>{items.find(i => i.id === r.item_id)?.material_name}</span>
                <span>{r.quantity}kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ActionDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedItem?.material_name}
        actions={[
          { label: "Receive", variant: "success", loading: loadingStates.receive, onClick: () => handleAction('receive', qty) },
          { label: "Issue", variant: "warning", loading: loadingStates.issue, onClick: () => handleAction('issue', qty) },
          { label: "Reserve", variant: "primary", loading: loadingStates.reserve, onClick: () => handleAction('reserve', qty) }
        ]}
      >
        <DrawerSection title="Metrics">
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div><p className="text-slate-500">Current</p>{selectedItem?.current_stock}</div>
            <div><p className="text-slate-500">Available</p>{selectedItem?.available}</div>
            <div><p className="text-slate-500">Reserved</p>{selectedItem?.reserved}</div>
            <div><p className="text-slate-500">Status</p>{selectedItem?.status}</div>
          </div>
        </DrawerSection>
        <DrawerSection title="Financials">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><p className="text-slate-500">Cost/Unit</p>₹{selectedItem?.cost_per_unit}</div>
            <div><p className="text-slate-500">Value</p>₹{(selectedItem?.current_stock * selectedItem?.cost_per_unit)?.toLocaleString()}</div>
          </div>
        </DrawerSection>
        <DrawerSection title="Adjustment">
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-sm" />
        </DrawerSection>
      </ActionDrawer>
    </div>
  );
}