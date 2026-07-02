import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import PageContainer from "../components/ui/PageContainer";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bomComponents, setBomComponents] = useState([]);
  const [launchQty, setLaunchQty] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);



  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      if (data && data.length > 0) {
        handleProductSelect(data[0]);
      }
    } catch (err) {
      alert(`Master Data Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleProductSelect(product) {
    setSelectedProduct(product);
    try {
    const { data, error } = await supabase
  .from("product_boms")
  .select(`
    id,
    material_item_id,
    quantity_required,
    waste_allowance,
    inventory_items (item_name, unit, current_stock)
  `)
  .eq("product_id", product.id);

      if (error) throw error;
      setBomComponents(data || []);
    } catch (err) {
      console.error("BOM Retrieval Defect:", err.message);
    }
  }

  async function handleLaunchProduction() {
    if (!selectedProduct) return;
    if (launchQty <= 0) {
      alert("Operational Quantity must be greater than zero.");
      return;
    }

    setActioning(true);
    try {
      // 1. Generate a standardized job batch sequence number
      const batchNo = `JOB-${new Date().toISOString().slice(2,10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Insert the active, pending production sequence tracking row
      const { data: jobData, error: jobError } = await supabase
        .from("production_jobs")
        .insert([{
          id: crypto.randomUUID(),
          product_id: selectedProduct.id,
          planned_qty: launchQty,
          status: "Pending",
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (jobError) throw jobError;

      // 3. Automatically reserve required inventory elements via the BOM mapping rules
      const reservations = bomComponents.map((comp) => ({
        job_id: jobData.id,
        item_id: comp.material_id,
        quantity: comp.quantity_per_unit * launchQty,
        created_at: new Date().toISOString()
      }));

      if (reservations.length > 0) {
        const { error: resError } = await supabase
          .from("inventory_reservations")
          .insert(reservations);
        if (resError) throw resError;
      }

      alert(`Success: Production Job sequence initialized for Batch ${batchNo}`);
      setLaunchQty(1000);
    } catch (err) {
      alert(`Initialization Routine Aborted: ${err.message}`);
    } finally {
      setActioning(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-6 text-xs text-slate-400 font-mono">Loading core product master indices...</div>;

  return (
    <PageContainer title="Product Registry & Specification Manager" subtitle="System definitions, core variant items, and Bill of Material matrices">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Core Product Matrix Selection */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Item Classification Index</h3>
          <div className="space-y-2">
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => handleProductSelect(prod)}
                className={`p-3 rounded border text-left cursor-pointer transition-all ${
                  selectedProduct?.id === prod.id
                    ? "bg-blue-950/40 border-blue-500 text-blue-400"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold font-mono">{prod.sku || `SKU-${prod.id.slice(0, 5).toUpperCase()}`}</div>
                <div className="text-sm font-semibold mt-1">{prod.product_name || prod.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Selected Specification Details & Action Queue */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProduct ? (
            <>
              {/* BOM Spec Sheet View */}
              <div className="bg-slate-900 border border-slate-800 rounded p-6">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-200">{selectedProduct.product_name || selectedProduct.name}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">UUID: {selectedProduct.id}</p>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3">Formula Matrix (Bill of Materials)</h3>
                <div className="border border-slate-800 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-3">Material Asset</th>
                        <th className="p-3 text-right">Standard Draw Qty (Per FG)</th>
                        <th className="p-3 text-right">Available Stockpile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                      {bomComponents.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-slate-500 font-sans">No production components linked to this master profile.</td>
                        </tr>
                      ) : (
                        bomComponents.map((comp) => (
                          <tr key={comp.id} className="hover:bg-slate-950/40">
                            <td className="p-3 font-sans font-medium text-slate-400">
                              {comp.inventory_items?.item_name || comp.material_id}
                            </td>
                            <td className="p-3 text-right text-blue-400">{Number(comp.quantity_per_unit).toFixed(4)} {comp.inventory_items?.unit || "units"}</td>
                            <td className="p-3 text-right text-slate-400">{Number(comp.inventory_items?.current_stock || 0).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manufacturing Launch Module */}
              <div className="bg-slate-900 border border-slate-800 rounded p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initialize Manufacturing Work Order</h3>
                <p className="text-xs text-slate-500 mb-4">Launches an atomic run profile to the floor queue and isolates baseline material stock allocation formulas.</p>
                
                <div className="flex gap-4 items-center max-w-md">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Yield Goal</label>
                    <input
                      type="number"
                      value={launchQty}
                      onChange={(e) => setLaunchQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 text-slate-200 border border-slate-800 text-xs font-mono p-2 rounded focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleLaunchProduction}
                    disabled={actioning || bomComponents.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 h-9 rounded mt-5 transition-colors disabled:opacity-40"
                  >
                    {actioning ? "Spawning Run..." : "Authorize Shop Floor Run"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded p-6 text-center text-xs text-slate-500">
              Select an item profile from the tracking register to inspect structural metrics.
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}