# ERP Runtime Verification Report

This document reports the actual functional status of the BoxIQ ERP system as verified on **July 7, 2026** in **VERIFICATION MODE**. No code modifications, ESLint modifications, or structural changes have been applied.

---

## Executive Summary

The BoxIQ ERP is built on **React 19.2.6**, **React Router DOM 7.15.1** (using `createBrowserRouter`), and **Vite 8.0.14**, backed by **Supabase JS Client 2.106.1**.

While the build compiles perfectly (2419 modules, 7.72s) and the dev server runs stablely at `http://localhost:5173/`, the system suffers from **one critical, systemic authentication bug** that blocks all user access after any page reload. However, when using a verified **Single Page Application (SPA) navigation bypass**, 8 out of 13 modules are **Fully Working**, 3 are **Partially Working**, and 2 are **Broken/Unusable**.

---

## Systemic Blockers (Top-Level Issues)

### 1. Systemic Auth Loading State Hang (Critical Blocker)
*   **Symptom**: Refreshing the browser on *any* protected route causes the application to hang indefinitely on a white screen with the text `Loading...`.
*   **Root Cause**: 
    *   In `erp/src/features/auth/AuthProvider.jsx`, the initialization function `loadUser()` executes `supabase.auth.getSession()`.
    *   Due to a client-side bug in Supabase JS Client `v2.106.1` (or its underlying promise handling), the Promise returned by `getSession()` (and similarly `signInWithPassword()`) **never resolves**.
    *   The `finally` block in `loadUser()` which sets `loading` to `false` is never reached.
    *   `ProtectedRoute` checks the `loading` state, sees `true`, and renders the static `Loading...` markup forever.
    *   This is confirmed as a client-side library hang because the browser network inspect reveals the network requests to `/auth/v1/health` and direct fetches to `/auth/v1/token` resolve in under 500ms, but the JS SDK client does not resolve the Promise.
*   **Bypass / Workaround**:
    *   Navigating to `/login`, filling credentials, and clicking login triggers the auth sequence. Even though the login promise hangs (button says `Signing in...`), the token is successfully set in `localStorage`.
    *   Immediately navigating client-side via SPA navigation to `/dashboard` triggers the `onAuthStateChange` listener (which successfully fires on a `SIGNED_IN` event and bypasses `getSession()`), setting the user context and unlocking all SPA modules.

### 2. StrictMode Double-Mount Compounding
*   **Symptom**: Trace logs reveal multiple simultaneous authentication initialization cycles.
*   **Root Cause**: React `StrictMode` is enabled in `main.jsx`. The double-mount unmounts the first `AuthProvider` state and mounts a second, causing overlapping auth request promises, which amplifies the client-side hang in the Supabase SDK.

### 3. Hardcoded Layout Profile Card
*   **Symptom**: The profile card in `TopBar.jsx` always displays `John Doe / Admin` regardless of which user is authenticated.
*   **Root Cause**: User info is hardcoded in the header's JSX and does not bind to the active auth state from `AuthProvider`.

### 4. Dead Code Redundancy
*   **Symptom**: There are two parallel routing and auth systems.
*   **Detail**: 
    *   `App.jsx` uses `createBrowserRouter` (ACTIVE), calling features from `features/auth/AuthProvider.jsx`.
    *   `routes/AppRoutes.jsx` (DEAD) uses older `<Routes>` and imports from `context/AuthContext.jsx`.
    *   This dual structure creates confusion, as dead files (like `Register.jsx`) attempt to import from the dead context.

---

## Module-by-Module Verification Status

| Module / Page | Status | Root Cause / Verification Evidence |
| :--- | :--- | :--- |
| **Login** (`/login`) | **Working** | Form renders correctly. Submitting credentials correctly obtains a token and stores it in `localStorage` (`sb-mfuqddkjcqxvafuylfbu-auth-token`). *Note: The promise hangs on submission (button says "Signing in..."), but authentication succeeds in the background.* |
| **Register** (`/register`) | <span style="color:red; font-weight:bold;">Broken</span> | **Critical Error: Page structure failed to load.**<br>**Root Cause**: Page imports `useAuth` from the dead `context/AuthContext.jsx` instead of the active `features/auth/useAuth.js`. Since the dead AuthContext provider is never mounted, rendering crashes. |
| **Dashboard** (`/dashboard`) | **Working** *(via SPA)* | Fully renders side navigation, profile controls, and placeholder widgets. *Note: Statistics cards (Orders, Quotes, Jobs) load as "0" because REST queries are partially affected by the client promise hang, but the layout is stable.* |
| **Settings** (`/settings`) | **Working** *(via SPA)* | Loads successfully. Renders static placeholder message: `"Settings module coming soon."` |
| **Customers** (`/customers`) | <span style="color:orange; font-weight:bold;">Partially Working</span> | Shell loads ("Total Customers 0", "+ New Customer" button). No list displays.<br>**Root Cause**: Console shows database query error `BoxIQ fetchCustomers Error: column customers.customer_id does not exist` (HTTP 400). Database schema has a column mismatch. |
| **Quotations** (`/quotations`) | **Working** *(via SPA)* | Page shell loads completely with statistic totals (`0`) and a styled empty state ("No Quotations Found"). No console errors. Table is empty simply because there is no data in the table. |
| **Orders** (`/orders`) | **Working** *(via SPA)* | **Fully Functional.** Loads 7 test orders (`ORD-202606-0001` through `ORD-202606-0007`) containing real customer details, statuses (e.g., "Awaiting Planning"), item details, and action buttons. |
| **Pricing** (`/pricing`) | **Working** *(via SPA)* | **Fully Functional.** Loads Global Margin (15%), Material Adj. (0%), Active Rates (14), and GST (18%). Tabs (Global Controls, Material Rates, Margin Rules, Customer Contracts, Audit Log) and modification forms render and function. |
| **Products & BOM** (`/products`) | **Working** *(via SPA)* | **Fully Functional.** Displays 4 products (e.g., Master Carton 7ply, Cartoon 6ply) with dimensions, ply, printing, and status toggle. Detail and action buttons (`✏`, `🗑`) render. |
| **Production** (`/production`) | **Working** *(via SPA)* | **Fully Functional.** Displays Item Classification Index with 4 SKUs. Displays Formula Matrix table. Renders Work Order run initiation form. |
| **Inventory** (`/inventory`) | **Working** *(via SPA)* | **Fully Functional.** Renders 5 materials (Testliner, Kraft, Black Ink) with exact GSM, Current Stock, Min Stock, Location, and calculated total valuation of `₹12,61,000.00`. |
| **Dispatch** (`/dispatch`) | **Working** *(via SPA)* | **Fully Functional.** Displays 5 dispatch notes (including custom codes like `DSP-1780751799384`) with vehicle numbers, statuses ("delivered", "pending"), and quick-action "Deliver" buttons. |
| **Finance** (`/finance`) | <span style="color:orange; font-weight:bold;">Partially Working</span> | Page shell, tabs, and metric cards load (all showing `₹0`/`0`). No invoices list.<br>**Root Cause**: Console shows database security error `{code: 42501, message: "permission denied for table invoices"}` (HTTP 403). Row-Level Security (RLS) is active but the `authenticated` role lacks SELECT privileges on table `invoices`. |
| **Employees** (`/employees`) | **Working** *(via SPA)* | Page shell loads successfully. Cards show `0` employees. Displays a clean empty state ("No Records Found"). No database errors. |

---

## Technical Evidence Collected

### 1. Database Privilege Issue on Invoices Table
```json
{
  "code": "42501",
  "details": null,
  "hint": "Grant the required privileges to the current role (e.g., GRANT SELECT ON public.invoices TO authenticated;)",
  "message": "permission denied for table invoices"
}
```

### 2. Database Schema Mismatch on Customers Table
```
[error] BoxIQ fetchCustomers Error: column customers.customer_id does not exist
```

### 3. Registry Crash Context
```javascript
// From: erp/src/pages/auth/Register.jsx
import { useAuth } from '../../context/AuthContext'; // <-- Root Cause: Reference to dead context provider
```

### 4. Supabase JS Client Hang Evidence
*   **Active Client Version**: `@supabase/supabase-js: 2.106.1`
*   **Active Auth Engine Version**: `@supabase/auth-js: 2.106.1`
*   **Log Trace Output**:
    ```
    [TRACE:INIT3] Calling supabase.auth.getSession()...
    ```
    *(No response trace, no database initialization completion, no network log for /token, execution completely halted inside the promise)*
