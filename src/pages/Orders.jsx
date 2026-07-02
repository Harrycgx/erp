import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import DataTable from "../components/tables/DataTable";
import { fetchOrders } from "../services/orderService";

const orderColumns = [
  { key: "order_number", label: "Order No" },
  { key: "customer_name", label: "Customer" },
  { key: "customer_po", label: "Customer PO" },
  { key: "box_type", label: "Box Type" },
  { key: "quantity", label: "Quantity" },
  { key: "total_amount", label: "Amount" },
  { key: "delivery_date", label: "Delivery Date" },
  { 
    key: "material_status", 
    label: "Material Plan",
    render: (value) => (
      <span className={`font-semibold ${value === 'shortage' ? 'text-red-400' : 'text-green-400'}`}>
        {value ? value.toUpperCase() : 'PENDING'}
      </span>
    )
  },
  { key: "production_status", label: "Production" },
  { key: "workflow_status", label: "Workflow Status" },
  { 
    key: "credit_risk", 
    label: "Credit Risk",
    render: (value) => (
      <span className={`font-semibold ${value === 'high' ? 'text-red-500' : value === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
        {value ? value.toUpperCase() : 'LOW'}
      </span>
    )
  },
  { 
    key: "is_overdue", 
    label: "Overdue Status",
    render: (_, row) => {
      const isOverdue = new Date(row.delivery_date) < new Date() && row.production_status !== "completed";
      return isOverdue ? <span className="text-red-500 font-bold">OVERDUE</span> : <span className="text-slate-400">ON TIME</span>;
    }
  },
];

export default function Orders() {
  const navigate = useNavigate(); // FIX: Initialized missing hook
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const result = await fetchOrders();
      if (result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Order Register Fetch Defect:", error);
    }
  }

  // Manufacturing KPI Engine Calculations
  const awaitingPlanning = orders.filter(o => !o.material_status || o.material_status === "pending").length;
  const materialShortage = orders.filter(o => o.material_status === "shortage" || o.material_status === "red").length;
  const readyForProduction = orders.filter(o => o.material_status === "green" && o.production_status === "pending").length;
  const readyForDispatch = orders.filter(o => o.production_status === "completed" && o.dispatch_status !== "dispatched").length;
  const overdueDeliveries = orders.filter(o => new Date(o.delivery_date) < new Date() && o.production_status !== "completed").length;

  // Real-time Search and Advanced Filtering Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.order_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (order.customer_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (order.customer_po?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      statusFilter === "all" ||
      (statusFilter === "shortage" && (order.material_status === "shortage" || order.material_status === "red")) ||
      (statusFilter === "overdue" && new Date(order.delivery_date) < new Date() && order.production_status !== "completed") ||
      order.production_status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  const handleExportExcel = () => {
    // Pipeline link placeholder for data array parsing to CSV/Excel open standard
    console.log("Exporting register stream to CSV format...", filteredOrders);
    alert(`Exported ${filteredOrders.length} records to Excel layout.`);
  };

  const handleBulkAction = (action) => {
    console.log(`Executing execution dispatch sequence: ${action} on orders:`, selectedOrders);
    alert(`Bulk ${action} dispatched for selected rows.`);
  };

  return (
    <PageContainer
      title="Orders Register"
      subtitle="Operational hub for demand processing, engineering assessment, and inventory allocation blocks."
    >
      {/* Manufacturing Execution KPIs */}
      <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Awaiting Planning</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-400">{awaitingPlanning}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Material Shortage</p>
          <h2 className="mt-2 text-3xl font-bold text-red-400">{materialShortage}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ready For Production</p>
          <h2 className="mt-2 text-3xl font-bold text-green-400">{readyForProduction}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ready For Dispatch</p>
          <h2 className="mt-2 text-3xl font-bold text-purple-400">{readyForDispatch}</h2>
        </div>
        <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overdue Deliveries</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-500">{overdueDeliveries}</h2>
        </div>
      </div>

      {/* Control Console Area */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white/5 p-4 border border-white/5">
        <div className="flex flex-1 min-w-[300px] gap-3">
          <input
            type="text"
            placeholder="Search Order No, Customer, PO..."
            className="w-full max-w-sm rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="bg-slate-900">All Workflow Statuses</option>
            <option value="pending" className="bg-slate-900">Production Pending</option>
            <option value="shortage" className="bg-slate-900">Material Shortage</option>
            <option value="overdue" className="bg-slate-900">Overdue Schedules</option>
            <option value="completed" className="bg-slate-900">Completed Batches</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBulkAction("Approve Materials")}
            className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/20"
          >
            Bulk Run MRP
          </button>
          <button
            onClick={handleExportExcel}
            className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/30"
          >
            Export Excel
          </button>
          <button
            onClick={() => navigate("/orders/new")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Order
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <DataTable
        columns={orderColumns}
        data={filteredOrders}
        onRowClick={(order) => navigate(`/orders/${order.id}`)}
      />
    </PageContainer>
  );
}