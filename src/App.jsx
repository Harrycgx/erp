import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Components & Layouts
import WorkspaceShell from "./components/layout/WorkspaceShell";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AI from "./pages/AI";
import Login from "./pages/auth/Login";

// Lazy-loaded pages
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const PricingManagement = lazy(() => import("./pages/PricingManagement"));
const Dispatch = lazy(() => import("./pages/Dispatch"));
const Quotations = lazy(() => import("./pages/Quotations"));
const Production = lazy(() => import("./pages/Production")); 
const Analytics = lazy(() => import("./pages/Analytics"));
const AIInsights = lazy(() => import("./pages/AIInsights"));
const Employees = lazy(() => import("./pages/Employees"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Orders = lazy(() => import("./pages/Orders"));
const CreateOrder = lazy(() => import("./pages/CreateOrder"));
const Finance = lazy(() => import("./pages/Finance"));
const Procurement = lazy(() => import("./pages/Procurement"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetails = lazy(() => import("./pages/CustomerDetails"));
const ImportCenter = lazy(() => import("./pages/ImportCenter"));
const InventoryLedger = lazy(() => import("./pages/InventoryLedger"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const FinanceLedger = lazy(() => import("./pages/FinanceLedger"));
const ProductMaster = lazy(() => import("./pages/ProductMaster")); 
const ArtworkMaster = lazy(() => import("./pages/ArtworkMaster"));
const Settings = lazy(() => import("./pages/Settings"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <WorkspaceShell />,
    errorElement: (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-red-400">
        <p>Critical Error: Page structure failed to load.</p>
      </div>
    ),
    children: [
      { index: true, element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
      { path: "pricing", element: <ProtectedRoute><PricingManagement /></ProtectedRoute> },
      { path: "artworks", element: <ProtectedRoute><ArtworkMaster /></ProtectedRoute> },
      { path: "customers", element: <ProtectedRoute><Customers /></ProtectedRoute> },
      { path: "customers/:id", element: <ProtectedRoute><CustomerDetails /></ProtectedRoute> },
      { path: "products", element: <ProtectedRoute><ProductMaster /></ProtectedRoute> },
      { path: "quotations", element: <ProtectedRoute><Quotations /></ProtectedRoute> },
      { path: "orders", element: <ProtectedRoute><Orders /></ProtectedRoute> },
      { path: "orders/new", element: <ProtectedRoute><CreateOrder /></ProtectedRoute> },
      { path: "orders/:id", element: <ProtectedRoute><OrderDetails /></ProtectedRoute> },
      { path: "production", element: <ProtectedRoute><Production /></ProtectedRoute> },
      { path: "inventory", element: <ProtectedRoute><Inventory /></ProtectedRoute> },
      { path: "inventory-ledger", element: <ProtectedRoute><InventoryLedger /></ProtectedRoute> },
      { path: "finance", element: <ProtectedRoute><Finance /></ProtectedRoute> },
      { path: "finance-ledger", element: <ProtectedRoute><FinanceLedger /></ProtectedRoute> },
      { path: "analytics", element: <ProtectedRoute><Analytics /></ProtectedRoute> },
      { path: "ai-insights", element: <ProtectedRoute><AIInsights /></ProtectedRoute> },
      { path: "ai", element: <ProtectedRoute><AI /></ProtectedRoute> },
      { path: "employees", element: <ProtectedRoute><Employees /></ProtectedRoute> },
      { path: "procurement", element: <ProtectedRoute><Procurement /></ProtectedRoute> },
      { path: "dispatch", element: <ProtectedRoute><Dispatch /></ProtectedRoute> },
      { path: "imports", element: <ProtectedRoute><ImportCenter /></ProtectedRoute> },
      { path: "audit-logs", element: <ProtectedRoute><AuditLogs /></ProtectedRoute> }
    ],
  },
]);

export default function App() {
  return (
    <Suspense
      fallback = {
        <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
          <div className="animate-pulse font-bold tracking-widest text-slate-500">
            INITIALIZING BOXIQ...
          </div>
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
} 