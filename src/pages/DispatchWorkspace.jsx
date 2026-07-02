import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabase";
import ERPTable from "../components/ui/ERPTable";
import SearchBar from "../components/ui/SearchBar";
import KPIStrip from "../components/ui/KPIStrip";
import ActionDrawer, { DrawerSection } from "../components/ui/ActionDrawer";

const StatusBadge = ({ status }) => {
  const colors = {
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    in_transit: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/20"
  };
  const val = String(status || '').toLowerCase();
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[val] || 'bg-slate-500/10 text-slate-400'}`}>
      {val.replace("_", " ")}
    </span>
  );
};

export default function DispatchWorkspace() {
  const [dispatches, setDispatches] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State for Dispatch Management
  const [transitForm, setTransitForm] = useState({
    transporter_name: "",
    vehicle_number: "",
    lr_number: "",
    eway_bill_number: "",
    driver_name: "",
    driver_phone: ""
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase
      .from("dispatches")
      .select("*")
      .order("created_at", { ascending: false });
    setDispatches(data || []);
  }

  // Handle row selection and populate local sub-states safely
  const handleRowClick = (dispatch) => {
    setSelectedDispatch(dispatch);
    setTransitForm({
      transporter_name: dispatch.transporter_name || "",
      vehicle_number: dispatch.vehicle_number || "",
      lr_number: dispatch.lr_number || "",
      eway_bill_number: dispatch.eway_bill_number || "",
      driver_name: dispatch.driver_name || "",
      driver_phone: dispatch.driver_phone || ""
    });
    setDrawerOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransitForm(prev => ({ ...prev, [name]: value }));
  };

  // State Transition 1: Move to In Transit
  async function dispatchShipment() {
    if (!transitForm.vehicle_number.trim()) {
      alert("Vehicle Number is legally required for transit routing.");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("dispatches")
        .update({
          ...transitForm,
          status: "in_transit",
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("id", selectedDispatch.id);

      if (error) throw error;
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // State Transition 2: Move to Finalized Delivery
  async function markAsDelivered() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("dispatches")
        .update({
          status: "delivered",
          actual_delivery_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq("id", selectedDispatch.id);

      if (error) throw error;
      setDrawerOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Dynamic Contextual Action Routing
  const getDrawerActions = () => {
    const actions = [];
    if (!selectedDispatch) return actions;

    if (selectedDispatch.status === "pending") {
      actions.push({
        label: "Assign Logistics & Gate Pass",
        variant: "primary",
        loading: loading,
        onClick: dispatchShipment
      });
    }
    if (selectedDispatch.status === "in_transit") {
      actions.push({
        label: "Confirm Delivery Receipt",
        variant: "success",
        loading: loading,
        onClick: markAsDelivered
      });
    }
    return actions;
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return [
      { label: "Pending", value: dispatches.filter(d => d.status === "pending").length },
      { label: "In Transit", value: dispatches.filter(d => d.status === "in_transit").length },
      { label: "Shipped Today", value: dispatches.filter(d => new Date(d.created_at).toDateString() === today).length },
      { label: "Pending Qty", value: dispatches.filter(d => d.status === "pending").reduce((s, d) => s + (d.quantity || 0), 0) },
      { label: "Delivered", value: dispatches.filter(d => d.status === "delivered").length }
    ];
  }, [dispatches]);

  const filteredData = dispatches.filter(d => 
    d.dispatch_number?.toLowerCase().includes(search.toLowerCase()) ||
    d.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none";
  const labelClass = "block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-2";

  return (
    <div className="p-4 space-y-4 bg-slate-950 min-h-screen text-slate-200">
      <KPIStrip items={stats} />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-9">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase">Dispatch Register</h2>
            <SearchBar onSearch={setSearch} placeholder="Search dispatches..." />
          </div>
          
          <ERPTable 
            columns={[
              { key: "dispatch_number", label: "Dispatch #" },
              { key: "customer_name", label: "Customer" },
              { key: "quantity", label: "Qty" },
              { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
              { key: "created_at", label: "Date", render: (row) => new Date(row.created_at).toLocaleDateString("en-IN") }
            ]}
            data={filteredData}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Side Panels */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded p-3">
            <h3 className="text-[10px] font-bold text-red-400 uppercase mb-3">Exceptions & Alerts</h3>
            {dispatches.filter(d => !d.vehicle_number || (d.status === 'pending' && (Date.now() - new Date(d.created_at)) > 172800000)).map(d => (
              <div key={d.id} className="text-xs py-2 border-b border-slate-800 last:border-0 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-200">{d.dispatch_number}</div>
                  <div className="text-[10px] text-slate-500">{!d.vehicle_number ? "Missing Vehicle Registration" : "Stale Shipment > 48h"}</div>
                </div>
                <button onClick={() => handleRowClick(d)} className="text-[10px] text-blue-400 font-bold hover:underline">Fix</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Surface: Operations Drawer */}
      <ActionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Logistics Execution: ${selectedDispatch?.dispatch_number || ""}`}
        actions={getDrawerActions()}
      >
        {selectedDispatch && (
          <div className="space-y-4">
            <DrawerSection title="Manifest Summary">
              <div className="grid grid-cols-2 gap-2 text-xs border border-slate-800 bg-slate-950 p-2 rounded">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="text-slate-200 font-medium">{selectedDispatch.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Shipment Qty</span>
                  <span className="text-slate-200 font-medium">{selectedDispatch.quantity} units</span>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection title="Transport Regulatory Information">
              <label className={labelClass}>Transporter Corporate Name</label>
              <input 
                name="transporter_name" 
                value={transitForm.transporter_name} 
                onChange={handleInputChange} 
                disabled={selectedDispatch.status === "delivered"}
                className={inputClass} 
                placeholder="e.g. VRL Logistics Ltd"
              />

              <label className={labelClass}>Vehicle Number *</label>
              <input 
                name="vehicle_number" 
                value={transitForm.vehicle_number} 
                onChange={handleInputChange} 
                disabled={selectedDispatch.status === "delivered"}
                className={`${inputClass} uppercase`} 
                placeholder="e.g. HR-55-A-1234"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Lorry Receipt (LR) #</label>
                  <input 
                    name="lr_number" 
                    value={transitForm.lr_number} 
                    onChange={handleInputChange} 
                    disabled={selectedDispatch.status === "delivered"}
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>GST E-Way Bill #</label>
                  <input 
                    name="eway_bill_number" 
                    value={transitForm.eway_bill_number} 
                    onChange={handleInputChange} 
                    disabled={selectedDispatch.status === "delivered"}
                    className={inputClass} 
                    maxLength={12}
                  />
                </div>
              </div>
            </DrawerSection>

            <DrawerSection title="Driver Assignment Details">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Driver Name</label>
                  <input 
                    name="driver_name" 
                    value={transitForm.driver_name} 
                    onChange={handleInputChange} 
                    disabled={selectedDispatch.status === "delivered"}
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className={labelClass}>Driver Phone Contact</label>
                  <input 
                    name="driver_phone" 
                    value={transitForm.driver_phone} 
                    onChange={handleInputChange} 
                    disabled={selectedDispatch.status === "delivered"}
                    className={inputClass} 
                  />
                </div>
              </div>
            </DrawerSection>

            {selectedDispatch.status !== "pending" && (
              <DrawerSection title="Legal / Print Matrix">
                <button 
                  onClick={() => window.print()} 
                  className="w-full text-center bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-bold py-2 rounded transition-colors"
                >
                  📄 Generate Delivery Challan Layout
                </button>
              </DrawerSection>
            )}
          </div>
        )}
      </ActionDrawer>
    </div>
  );
}