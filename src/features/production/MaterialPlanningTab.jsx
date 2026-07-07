import { useState, useEffect } from 'react';
import supabase from "../../lib/supabase";

const MaterialPlanningTab = ({ orderId, userRole }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('calculate_order_material_plan', { p_order_id: orderId });
    if (error) {
      setError(error.message);
    } else {
      setMaterials(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [orderId]);

  const handleCreateProcurement = async () => {
    if (!['Planner', 'Admin', 'Manager'].includes(userRole)) return alert("Unauthorized");

    // 1. Check existing open requests for this order to prevent duplicates
    const { data: existing } = await supabase
      .from('procurement_requests')
      .select('material_id')
      .eq('reference_order_id', orderId)
      .eq('status', 'pending');

    const existingIds = existing.map(e => e.material_id);
    const toCreate = materials.filter(m => m.shortage_qty > 0 && !existingIds.includes(m.material_id));

    if (toCreate.length === 0) return alert("All shortages already have pending requests.");

    // 2. Insert new requests
    const { error } = await supabase.from('procurement_requests').insert(
      toCreate.map(m => ({ 
        material_id: m.material_id, 
        required_qty: m.shortage_qty, 
        reference_order_id: orderId,
        status: 'pending' 
      }))
    );

    if (error) return alert("Error: " + error.message);
    
    // 3. Update order state
    await supabase.from('orders').update({ production_status: 'planning_review' }).eq('id', orderId);
    
    fetchData();
  };

  const kpis = {
    total: materials.length,
    shortages: materials.filter(m => m.status === 'red').length,
    lowStock: materials.filter(m => m.status === 'yellow').length
  };

  if (loading) return <div className="p-8 text-center">Refreshing MRP Data...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error} <button onClick={fetchData} className="ml-2 underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 border rounded text-center">Total Materials: <span className="font-bold">{kpis.total}</span></div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-center">Low Stock: <span className="font-bold text-yellow-700">{kpis.lowStock}</span></div>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-center">Critical Shortages: <span className="font-bold text-red-700">{kpis.shortages}</span></div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <button onClick={fetchData} className="px-4 py-2 border bg-white rounded hover:bg-gray-50">Refresh Plan</button>
        <button onClick={handleCreateProcurement} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Procurement Request</button>
        <button className="border border-red-200 text-red-600 px-4 py-2 rounded hover:bg-red-50">Approve Anyway</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Material</th><th>Req</th><th>Curr</th><th>Res</th><th>Incoming</th><th>Shortage</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.material_id} className={`border-b ${m.status === 'red' ? 'bg-red-50' : m.status === 'yellow' ? 'bg-yellow-50' : ''}`}>
                <td className="p-2 font-medium">{m.material_name}</td>
                <td className="p-2">{m.required_qty}</td>
                <td className="p-2">{m.current_stock}</td>
                <td className="p-2">{m.reserved_qty}</td>
                <td className="p-2">{m.incoming_qty}</td>
                <td className="p-2 font-bold text-red-600">{m.shortage_qty}</td>
                <td className="p-2 uppercase font-semibold text-xs">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialPlanningTab;