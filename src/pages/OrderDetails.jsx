import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import MaterialPlanningTab from "../features/production/MaterialPlanningTab";
import supabase from "../lib/supabase";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [actionLoading, setActionLoading] = useState(false);

  // Workspace State Tracking
  const [customerData, setCustomerData] = useState(null);
  const [productionJob, setProductionJob] = useState(null);
  const [dispatchData, setDispatchData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    // Intercept "new" route strings to prevent executing invalid UUID queries
    if (id && id !== "new") {
      loadWorkspaceData();
    } else {
      setLoading(false);
    }
  }, [id]);

  async function loadWorkspaceData() {
    if (!id || id === "new") return;
    
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Primary Order details cleanly without PostgREST auto-join parsing
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderErr) throw orderErr;

      // Account for potential naming variants in schema (quotation_id or quote_id)
      const targetQuoteId = orderData.quotation_id || orderData.quote_id;
      let quoteData = null;

      // 2. Fetch the linked quotation explicitly only requesting guaranteed columns
      if (targetQuoteId) {
        const { data: qData, error: qErr } = await supabase
          .from("quotations")
          .select("id, customer_id, product_id")
          .eq("id", targetQuoteId)
          .single();
        
        if (!qErr) {
          quoteData = qData;
        }
      }

      // Reconstruct UI dependency path safely 
      if (quoteData) {
        orderData.quotations = quoteData;
      }
      
      setOrder(orderData);

      // 3. Parallel Secondary Entity Hydration
      const customerId = quoteData?.customer_id || orderData.customer_id;
      
      const [custRes, prodRes, dispRes, finRes, timeRes] = await Promise.all([
        customerId ? supabase.from("customers").select("*").eq("id", customerId).single() : Promise.resolve({ data: null }),
        supabase.from("production_jobs").select("*").eq("order_id", id).maybeSingle(),
        supabase.from("dispatch_line_items").select("*, dispatches(*)").eq("order_id", id).maybeSingle(),
        supabase.from("financial_ledger").select("*").eq("reference_id", id).maybeSingle(),
        supabase.from("activity_logs").select("*").eq("record_id", id).order("created_at", { ascending: true })
      ]);

      setCustomerData(custRes.data || { outstanding: 0, credit_limit: 500000, last_payment: "N/A", payment_terms: "Net 30" });
      setProductionJob(prodRes.data);
      setDispatchData(dispRes.data);
      setFinanceData(finRes.data);
      setTimeline(timeRes.data || [
        { id: 1, action: "Order Confirmed", created_at: orderData.created_at, user_name: "System" },
        { id: 2, action: `Status moved to ${orderData.production_status || 'Pending'}`, created_at: new Date().toISOString(), user_name: "Planner" }
      ]);

    } catch (err) {
      console.error("ERP Core Hydration Failure:", err);
      setError(err); 
    } finally {
      setLoading(false);
    }
  }

  // --- WORKFLOW ACTION BAR HANDLERS ---
  const handleCreateProductionJob = async () => {
    if (productionJob) return alert("Production Job already initiated.");
    setActionLoading(true);
    
    const { data, error } = await supabase.from("production_jobs").insert([{
      order_id: order.id,
      planned_quantity: order.quantity,
      status: "queued",
      stage: "BOM Verification"
    }]).select().single();

    if (error) {
      alert(error.message);
    } else {
      alert("Production Job Queued Successfully.");
      setProductionJob(data);
    }
    setActionLoading(false); 
  };

  const handlePutOnHold = async () => {
    setActionLoading(true);
    const targetStatus = order.status === "Hold" ? "Active" : "Hold";
    const { error } = await supabase.from("orders").update({ status: targetStatus }).eq("id", order.id);
    if (error) alert(error.message);
    else await loadWorkspaceData();
    setActionLoading(false);
  };

  // --- PRE-RENDER RISK GUARD CLAUSES ---
  if (loading) {
    return (
      <PageContainer title="Order Workspace">
        <div className="p-8 text-center text-slate-400 animate-pulse">Hydrating 360 Workspace Matrices...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Database Error">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
          <h3 className="font-bold text-lg">ERP Relationship Embedding Blocked</h3>
          <p className="mt-2 text-sm text-slate-300">{error.message || "An unexpected system error occurred."}</p>
          <button onClick={loadWorkspaceData} className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition">
            Retry Connection Sequence
          </button>
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer title="Not Found">
        <div className="p-8 text-center text-slate-500">Specified order target identifier could not be verified.</div>
      </PageContainer>
    );
  }

  const daysRemaining = order.delivery_date 
    ? Math.ceil((new Date(order.delivery_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <PageContainer title={order.order_number || "Order Workspace"} subtitle={`ERP Workspace — Status: ${order.status || 'Active'}`}>
      
      {/* ACTION BAR COMPONENT */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
        <button onClick={loadWorkspaceData} className="px-4 py-2 border border-slate-600 text-white rounded-xl hover:bg-white/10 text-sm font-medium transition">
          🔄 Run / Refresh MRP
        </button>
        <button onClick={handleCreateProductionJob} disabled={actionLoading || productionJob} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition disabled:opacity-50">
          🏭 Create Production Job
        </button>
        <button onClick={handlePutOnHold} disabled={actionLoading} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${order.status === 'Hold' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'}`}>
          ⚠️ {order.status === "Hold" ? "Release Order Hold" : "Put On Hold"}
        </button>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Target Quantity</p>
          <h2 className="mt-2 text-4xl font-bold text-white">{order.quantity}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Order Gross Value</p>
          <h2 className="mt-2 text-4xl font-bold text-green-400">₹{Number(order.total_amount || 0).toLocaleString()}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Production Lifecycle</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-400 capitalize">{order.production_status || "Unscheduled"}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <p className="text-slate-400 text-sm">Payment State</p>
          <h2 className="mt-2 text-2xl font-bold text-blue-400 capitalize">{order.payment_status || "Unpaid"}</h2>
        </div>
      </div>

      {/* QUADRANT OPERATIONAL PANELS */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        
        {/* 1. CUSTOMER SUMMARY CARD */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">👤 Customer Financial Profile</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Account Name</p>
              <p className="text-white font-medium mt-0.5">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-slate-400">Outstanding Ledger Balance</p>
              <p className="text-red-400 font-medium mt-0.5">₹{Number(customerData?.outstanding || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Assigned Credit Limit</p>
              <p className="text-white font-medium mt-0.5">₹{Number(customerData?.credit_limit || 500000).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Payment Terms</p>
              <p className="text-blue-400 font-medium mt-0.5">{order.payment_terms || customerData?.payment_terms || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* 2. DELIVERY PLANNING CARD */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">🚚 Logistics & Delivery Matrix</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Customer PO Ref Number</p>
              <p className="text-white font-mono mt-0.5">{order.customer_po_number || "NOT_PROVIDED"}</p>
            </div>
            <div>
              <p className="text-slate-400">Committed Delivery Date</p>
              <p className="text-white font-medium mt-0.5">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "TBD"}</p>
            </div>
            <div>
              <p className="text-slate-400">Days Remaining</p>
              <p className={`font-bold mt-0.5 text-base ${daysRemaining !== null && daysRemaining < 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                {daysRemaining !== null ? `${daysRemaining} Days` : "Unscheduled"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Dispatch Track Route</p>
              <p className="text-white font-medium mt-0.5 capitalize">{order.dispatch_status || "Pending Allocation"}</p>
            </div>
          </div>
        </div>

        {/* 3. PRODUCTION SUMMARY CARD */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">🏭 Shop Floor Execution Summary</h3>
          {productionJob ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Job Card Reference</p>
                <p className="text-white font-mono mt-0.5">{productionJob.job_number || productionJob.id?.slice(0,8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-slate-400">Current Facility Stage</p>
                <p className="text-orange-400 font-bold mt-0.5">{productionJob.stage || "In Queue"}</p>
              </div>
              <div>
                <p className="text-slate-400">Metrics (Planned vs Actual)</p>
                <p className="text-white font-medium mt-0.5">{productionJob.planned_quantity} / {productionJob.actual_quantity || 0} Units</p>
              </div>
              <div>
                <p className="text-slate-400">QC Review Status</p>
                <p className={`font-semibold mt-0.5 uppercase text-xs ${productionJob.qc_status === 'passed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {productionJob.qc_status || "Pending Structural Inspection"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm py-4 italic text-center">No active production job initiated for this tracking number. Trigger "Create Production Job" to begin deployment.</div>
          )}
        </div>

        {/* 4. DISPATCH SUMMARY CARD */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">📦 Outbound Delivery Logs</h3>
          {dispatchData ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Dispatch Sequence</p>
                <p className="text-white font-mono mt-0.5">{dispatchData.dispatches?.dispatch_number || "DSP-PENDING"}</p>
              </div>
              <div>
                <p className="text-slate-400">Delivery Challan (DC)</p>
                <p className="text-white font-medium mt-0.5">{dispatchData.dispatches?.delivery_challan || "Pending Generation"}</p>
              </div>
              <div>
                <p className="text-slate-400">Assigned Logistics Vehicle</p>
                <p className="text-white font-medium mt-0.5">{dispatchData.dispatches?.vehicle_number || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-slate-400">Transit Tracking State</p>
                <p className="text-blue-400 font-medium mt-0.5 capitalize">{dispatchData.status || "Staging Area"}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm py-4 italic text-center">No outbound dispatch records generated for this tracking code.</div>
          )}
        </div>

        {/* 5. FINANCE AR SUMMARY */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">💵 Accounts Receivable & Invoicing</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Tax Invoice Number</p>
              <p className="text-white font-mono font-medium mt-0.5">{financeData?.invoice_number || "Draft Generated"}</p>
            </div>
            <div>
              <p className="text-slate-400">Invoiced Value</p>
              <p className="text-white font-medium mt-0.5">₹{Number(financeData?.amount || order.total_amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Recognized Outstanding</p>
              <p className="text-red-400 font-bold mt-0.5">₹{Number(financeData?.balance_due || order.total_amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400">Total Payments Cleared</p>
              <p className="text-emerald-400 font-medium mt-0.5">₹{Number(financeData?.paid_amount || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 6. LINKED COMPLIANCE DOCUMENTS PANEL */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">📂 Compliance System Documents</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-slate-300 font-medium">📋 Core System Quotation</span>
              <span className="text-blue-400 font-mono text-xs">{order.quotation_number || order.quotation_id?.slice(0,8)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-slate-300 font-medium">📄 Structural Product BOM</span>
              <span className="text-slate-400 text-xs">Linked via Quote Product</span>
            </div>
            {financeData?.invoice_id && (
              <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-300 font-medium">🧾 Authorized Commercial Invoice</span>
                <span className="text-emerald-400 font-mono text-xs">Active Link</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WORKFLOW TIMELINE COMPONENT */}
      <div className="mt-8 rounded-2xl bg-white/5 p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 mb-4">⏱️ Operational Audit & States</h3>
        <div className="relative border-l border-slate-700 ml-3 space-y-6 py-2">
          {timeline.map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute -left-[6.5px] top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-slate-900" />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{log.action || log.message}</p>
                <span className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Operator Authenticated: {log.user_name || "Identity Assured"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FULL MATERIAL PLAN REQUIREMENTS MATRIX */}
      <div className="mt-8 rounded-2xl bg-white/5 p-6 border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6">⚙️ Material Requirements Plan Engine</h3>
        <MaterialPlanningTab orderId={order.id} userRole="Planner" />
      </div>

    </PageContainer>
  );
}