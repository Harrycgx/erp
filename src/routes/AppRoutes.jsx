import { Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleProtectedRoute from '../components/auth/RoleProtectedRoute';
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Analytics from '../pages/Analytics';
import Employees from '../pages/Employees';
import Attendance from '../pages/Attendance';
import Payroll from '../pages/Payroll';
import HRDashboard from '../pages/HRDashboard';
import Inventory from '../pages/Inventory';
import Procurement from '../pages/Procurement';
import PurchaseOrders from '../pages/PurchaseOrders';
import ProductionPlanning from '../pages/ProductionPlanning';
import Suppliers from '../pages/Suppliers';
import Vendors from '../pages/Vendors';
import Finance from '../pages/Finance';
import Invoices from '../pages/Invoices';
import InvoiceDetails from '../pages/InvoiceDetails';
import Payments from '../pages/Payments';
import CustomerLedger from '../pages/CustomerLedger';
import Orders from '../pages/Orders';
import SalesOrders from '../pages/SalesOrders';
import SalesOrderDetails from '../pages/SalesOrderDetails';
import QuoteBuilder from '../pages/QuoteBuilder';
import Customers from '../pages/Customers';
import CustomerPortal from '../pages/CustomerPortal';
import CustomerQuotations from '../pages/CustomerQuotations';
import CustomerQuotationDetails from '../pages/CustomerQuotationDetails';
import Inquiries from '../pages/Inquiries';
import Quotations from '../pages/Quotations';
import QuotationDetails from '../pages/QuotationDetails';
import Production from '../pages/Production';
import ProductionJobDetails from '../pages/ProductionJobDetails';
import AdminDashboard from '../pages/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import CustomerDashboard from '../pages/CustomerDashboard';
import VendorDashboard from '../pages/VendorDashboard';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin']}>
                <StaffDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="customer"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="vendor"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="customer-portal"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['customer']}>
                <CustomerPortal />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="payroll"
          element={
            <ProtectedRoute>
              <Payroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="hr"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'production']}>
                <Inventory />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="procurement"
          element={
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          }
        />
        <Route
          path="purchase-orders"
          element={
            <ProtectedRoute>
              <PurchaseOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="production-planning"
          element={
            <ProtectedRoute>
              <ProductionPlanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="production"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'production']}>
                <Production />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="production/:jobId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'production']}>
                <ProductionJobDetails />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="suppliers"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="vendors"
          element={
            <ProtectedRoute>
              <Vendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'finance']}>
                <Finance />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'finance']}>
                <Invoices />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:invoiceId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin', 'staff', 'finance']}>
                <InvoiceDetails />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="ledger"
          element={
            <ProtectedRoute>
              <CustomerLedger />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="sales-orders"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin', 'finance']}>
                <SalesOrders />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="sales-orders/:salesOrderId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin', 'finance']}>
                <SalesOrderDetails />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="quote-builder"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin', 'sales']}>
                <QuoteBuilder />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin', 'sales']}>
                <Quotations />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/:quotationId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['staff', 'admin', 'sales']}>
                <QuotationDetails />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="customer/quotations"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['customer']}>
                <CustomerQuotations />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="customer/quotations/:quotationId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['customer']}>
                <CustomerQuotationDetails />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />
        <Route
          path="inquiries"
          element={
            <ProtectedRoute>
              <Inquiries />
            </ProtectedRoute>
          }
        />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
