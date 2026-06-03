import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import {
  lazy,
  Suspense,
} from "react";

import AppLayout from "./AppLayout";

const AuditLogs = lazy(() =>
  import("./pages/AuditLogs")
);

import AI from "./pages/AI";

import ProtectedRoute from "./features/auth/ProtectedRoute";

const Dispatch = lazy(() =>
  import("./pages/Dispatch")
);

// Lazy-loaded pages
const Dashboard = lazy(() =>
  import("./pages/Dashboard")
);

const Quotations = lazy(() =>
  import("./pages/Quotations")
);

const Production = lazy(() =>
  import("./pages/Production")
);

const Analytics = lazy(() =>
  import("./pages/Analytics")
);

const AIInsights = lazy(() =>
  import("./pages/AIInsights")
);

const Employees = lazy(() =>
  import("./pages/Employees")
);

const Inventory = lazy(() =>
  import("./pages/Inventory")
);

const Orders = lazy(() =>
  import("./pages/Orders")
);

const Finance = lazy(() =>
  import("./pages/Finance")
);

const Procurement = lazy(() =>
  import("./pages/Procurement")
);

const Customers = lazy(() =>
  import("./pages/Customers")
);
const CustomerDetails = lazy(() =>
  import("./pages/CustomerDetails")
);

const ImportCenter = lazy(() =>
  import("./pages/ImportCenter")
);

const InventoryLedger = lazy(() =>
  import("./pages/InventoryLedger")
);
const OrderDetails = lazy(() =>
  import("./pages/OrderDetails")
);

const FinanceLedger = lazy(() =>
  import("./pages/FinanceLedger")
);
const ProductMaster = lazy(() => import("./pages/ProductMaster"));

const router =
  createBrowserRouter([
    {
      path: "/",

      element: <AppLayout />,

      children: [

        {
          index: true,

          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
  path: "customers/:id",

  element: (
    <ProtectedRoute>
      <CustomerDetails />
    </ProtectedRoute>
  ),
},
{
  path: "orders/:id",

  element: (
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  ),
},

        {
          path: "dashboard",

          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },

        {
          path: "quotations",

          element: (
            <ProtectedRoute>
              <Quotations />
            </ProtectedRoute>
          ),
        },
        {
  path: "audit-logs",

  element: (
    <ProtectedRoute>
      <AuditLogs />
    </ProtectedRoute>
  ),
},

        {
          path: "production",

          element: (
            <ProtectedRoute>
              <Production />
            </ProtectedRoute>
          ),
        },

        {
          path: "inventory",

          element: (
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          ),
        },

        {
          path: "inventory-ledger",

          element: (
            <ProtectedRoute>
              <InventoryLedger />
            </ProtectedRoute>
          ),
        },

        {
          path: "finance",

          element: (
            <ProtectedRoute>
              <Finance />
            </ProtectedRoute>
          ),
        },

        {
          path: "finance-ledger",

          element: (
            <ProtectedRoute>
              <FinanceLedger />
            </ProtectedRoute>
          ),
        },

        {
          path: "analytics",

          element: (
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          ),
        },

        {
          path: "ai-insights",

          element: (
            <ProtectedRoute>
              <AIInsights />
            </ProtectedRoute>
          ),
        },

        {
          path: "employees",

          element: (
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          ),
        },

        {
          path: "orders",

          element: (
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          ),
        },

        {
          path: "procurement",

          element: (
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          ),
        },
           {
  path: "dispatch",

  element: (
    <ProtectedRoute>
      <Dispatch />
    </ProtectedRoute>
  ),
},
        {
          path: "customers",

          element: (
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          ),
        },
        { path: "products", element: (<ProtectedRoute><ProductMaster /></ProtectedRoute>) },

        {
          path: "imports",

          element: (
            <ProtectedRoute>
              <ImportCenter />
            </ProtectedRoute>
          ),
        },

        {
          path: "ai",

          element: (
            <ProtectedRoute>
              <AI />
            </ProtectedRoute>
          ),
        },

      ],
    },
  ]);

export default function App() {

  return (
    <Suspense
      fallback={
        <div
          className="
            flex min-h-screen
            items-center justify-center
            bg-[#020617]
            text-white
          "
        >
          Loading ERP...
        </div>
      }
    >
      <RouterProvider
        router={router}
      />
    </Suspense>
  );
}