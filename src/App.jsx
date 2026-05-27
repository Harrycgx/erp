import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AppLayout from "./AppLayout";

import AI from "./pages/AI";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Orders from "./pages/Orders";
import Quotations from "./pages/Quotations";
import Finance from "./pages/Finance";
import Procurement from "./pages/Procurement";
import Customers from "./pages/Customers";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import ImportCenter from "./pages/ImportCenter";
import InventoryLedger from "./pages/InventoryLedger";
import FinanceLedger from "./pages/FinanceLedger";
import AIInsights from "./pages/AIInsights";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "finance-ledger",
       element: <FinanceLedger />,
      },
      {
        path: "ai-insights",
        element: <AIInsights />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "ai",
        element: <AI />,
      },
      {
        path: "inventory-ledger",
        element: <InventoryLedger />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "employees",
        element: <Employees />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "production",
        element: <Production />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "quotations",
        element: <Quotations />,
      },
      {
        path: "finance",
        element: <Finance />,
      },
      {
        path: "procurement",
        element: <Procurement />,
      },
      {
        path: "customers",
        element: <Customers />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}