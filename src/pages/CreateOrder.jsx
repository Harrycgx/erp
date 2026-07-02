import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import supabase from "../lib/supabase";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    box_type: "Regular Slotted Container (RSC)",
    quantity: "",
    total_amount: "",
    delivery_date: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: formData.customer_name,
            box_type: formData.box_type,
            quantity: parseInt(formData.quantity, 10),
            total_amount: parseFloat(formData.total_amount),
            delivery_date: formData.delivery_date || null,
            status: "Active",
            production_status: "pending",
            payment_status: "unpaid"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      alert("Order Created Successfully!");
      navigate(`/orders/${data.id}`); // Redirect back to dashboard view
    } catch (err) {
      console.error(err);
      alert(`Submission Failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Create New Order" subtitle="Initialize a new production tracking file">
      <form onSubmit={handleSubmit} className="max-w-2xl rounded-2xl bg-white/5 p-6 border border-white/10 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300">Customer Name</label>
          <input required type="text" className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Box Configuration Type</label>
          <select className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white focus:outline-none" value={formData.box_type} onChange={e => setFormData({...formData, box_type: e.target.value})}>
            <option>Regular Slotted Container (RSC)</option>
            <option>Die-Cut Box</option>
            <option>Corrugated Tray</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Target Quantity</label>
            <input required type="number" className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Order Gross Value (₹)</label>
            <input required type="number" step="0.01" className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300">Committed Delivery Date</label>
          <input type="date" className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white" value={formData.delivery_date} onChange={e => setFormData({...formData, delivery_date: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition disabled:opacity-50">
          {loading ? "Committing Records..." : "Provision Core Order"}
        </button>
      </form>
    </PageContainer>
  );
}