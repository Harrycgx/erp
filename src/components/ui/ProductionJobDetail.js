import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../lib/supabase";
import PageContainer from "../components/ui/PageContainer";
import BOMConsumptionTab from "../components/ui/BOMConsumptionTab";

export default function ProductionJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [usage, setUsage] = useState([]);
  const [activeTab, setActiveTab] = useState("specifications");
  const [processing, setProcessing] = useState(false);
  const [inputQty, setInputQty] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  async function fetchJobDetails() {
    try {
      setError(null);
      const { data: jobData, error: jobError } = await supabase
        .from("production_jobs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (jobError) throw jobError;
      
      setJob(jobData);
      
      // Initialize input intelligently based on state
      if (jobData) {
        setInputQty(jobData.status === "Completed" ? jobData.actual_qty : jobData.planned_qty);
      }

      const { data: usageData, error: usageError } = await supabase
        .from("production_material_usage")
        .select("*")
        .eq("job_id", id);
      
      if (usageError) throw usageError;
      
      setUsage(usageData || []);
    } catch (err) {
      setError(err.message || "Failed to load production job data.");
    }
  }

  async function handleJobFinalization() {
    const numericYield = parseFloat(inputQty);
    if (isNaN(numericYield) || numericYield <= 0) {
      alert("Invalid Yield: Enter a valid, positive completed quantity.");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error: rpcError } = await supabase.rpc("complete_production_job", {
        p_job_id: id,
        p_user_id: user?.id,
        p_actual_qty: numericYield
      });

      if (rpcError) throw rpcError;

      await fetchJobDetails();
      setActiveTab("bom_consumption");
    } catch (err) {
      alert(`Execution Aborted: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  if (error) return <div className="p-6 text-red-400 font-bold border border-red-500 bg-red-900/20 m-4 rounded">{error}</div>;
  if (!job) return <div className="p-6 text-xs text-slate-400 font-mono">Loading active operational profile...</div>;

  return (
    <PageContainer title={`Production Profile: Job #${id.slice(0, 8)}`} subtitle="Floor Operations & Consumption Interface">
      <div className="space-y-4">
        
        {/* State Validation Matrix banner */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Operational Workflow State</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded inline-block mt-1 ${
              job.status === "Completed" ? "bg-emerald-950 border border-emerald-800 text-emerald-400" : "bg-amber-950 border border-amber-800 text-amber-400"
            }`}>
              {job.status}
            </span>
          </div>

          {job.status !== "Completed" && (
            <div className="flex gap-3 items-center">
              <div className="text-right">
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Confirmed Production Yield</label>
                <input 
                  type="number" 
                  value={inputQty} 
                  onChange={(e) => setInputQty(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-700 text-xs font-mono p-1 rounded w-32 mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleJobFinalization}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded h-8 self-end transition-colors disabled:opacity-40"
              >
                {processing ? "Executing..." : "Finalize & Consume BOM"}
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-800 gap-4 mt-6">
          <button 
            onClick={() => setActiveTab("specifications")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider ${activeTab === 'specifications' ? 'border-b-2 border-blue-500 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Specifications
          </button>
          <button 
            onClick={() => setActiveTab("bom_consumption")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider ${activeTab === 'bom_consumption' ? 'border-b-2 border-blue-500 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            BOM Consumption & Variance
          </button>
        </div>

        {/* Render Active View Layer */}
        <div className="bg-slate-900 border border-slate-800 rounded p-6">
          {activeTab === "specifications" ? (
            <div className="text-xs text-slate-400 space-y-2 font-mono">
              <p><span className="text-slate-600 font-bold font-sans uppercase mr-2 block sm:inline w-32">Target Volume:</span> {job.planned_qty} Units</p>
              <p><span className="text-slate-600 font-bold font-sans uppercase mr-2 block sm:inline w-32">Actual Yield:</span> {job.actual_qty || "Pending Data"}</p>
              <p><span className="text-slate-600 font-bold font-sans uppercase mr-2 block sm:inline w-32">Linked Base Product:</span> {job.product_id}</p>
            </div>
          ) : (
            <BOMConsumptionTab 
              usageData={usage} 
              jobActualQty={job.actual_qty} 
              jobPlannedQty={job.planned_qty} 
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}