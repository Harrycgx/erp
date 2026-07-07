# BOXIQ ERP — Issue #7: `react-hooks/set-state-in-effect` Classification

**Recovery Phase:** 7
**Status:** CLASSIFICATION COMPLETE — NO FILES MODIFIED, NO RULES DISABLED, NO REFACTORING PERFORMED
**Date:** Continuous Recovery Mode (V2)
**Scope:** Every remaining `react-hooks/set-state-in-effect` error in the ERP codebase

---

## 1. Methodology

Every file flagged by ESLint with `react-hooks/set-state-in-effect` was read in full
around the flagged line. Each error was classified into one of six categories (A–F)
based on the *actual code pattern* observed — not the lint message text.

The categories are:

| Cat | Name | Meaning |
|-----|------|---------|
| **A** | Derived state | State is *computed* from other state/props and should be `useMemo` or derived during render. |
| **B** | Form init from props | Form state is *seeded* from a prop when the prop changes (edit drawer pattern). |
| **C** | Sync with external data | `setState` happens inside an async fetch callback (after `await`) on mount/filter change. |
| **D** | Reset logic | State is *reset* to a default when a prop/dep changes (notes, loading flags). |
| **E** | Potential runtime bug | A genuine bug where setState-in-effect causes incorrect behavior. |
| **F** | False positive | The lint rule flags the pattern, but the setState is NOT synchronous (it is inside an async callback). |

> **Note on C vs F:** Category C and Category F overlap. The `react-hooks/set-state-in-effect`
> rule flags *any* `setState` call that appears textually inside a `useEffect`, even when the
> call is reached only after an `await` (i.e. it is NOT synchronous with the effect body).
> In this codebase, **all Category C entries are arguably Category F (false positives)** because
> the `setState` calls occur inside `.then()`/`await` callbacks, not in the synchronous effect body.
> They are listed under C (their *intent*) with an F annotation where applicable.

---

## 2. Complete Classification Table

Columns: **File | Component | Line | Category | Current pattern | Recommended fix | Risk | Architecture change required?**

### Category B — Form init from props (10 files)

| File | Component | Line | Cat | Current pattern | Recommended fix | Risk | Arch? |
|------|-----------|------|-----|-----------------|-----------------|------|-------|
| `src/components/ui/EditCustomerDrawer.jsx` | EditCustomerDrawer | 13 | B | `setFormData({...customer})` in `useEffect([customer])` | Add `key={customer?.id}` to remount, OR derive initial state via lazy `useState(() => {...})` | LOW | NO |
| `src/components/forms/EmployeeForm.jsx` | EmployeeForm | 27 | B | `setForm({...employee})` in `useEffect([employee])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/CustomerForm.jsx` | CustomerForm | 19 | B | `setFormData({...customer})` in `useEffect([customer])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/InquiryForm.jsx` | InquiryForm | 21 | B | `setFormData({...inquiry})` in `useEffect([inquiry])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/MaterialForm.jsx` | MaterialForm | 21 | B | `setForm({...item})` in `useEffect([item])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/SupplierForm.jsx` | SupplierForm | 20 | B | `setForm({...supplier})` in `useEffect([supplier])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/VendorForm.jsx` | VendorForm | 21 | B | `setForm({...vendor})` in `useEffect([vendor])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/forms/ProductForm.jsx` | ProductForm | 67 | B | `setForm({...initialData})` in `useEffect([initialData])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/quote/PricingEditor.jsx` | PricingEditor | 18 | B | `setFormData({...rule})` in `useEffect([rule])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |
| `src/components/production/ProductionPlanner.jsx` | ProductionPlanner | 16 | B | `setPlan({...order})` in `useEffect([order])` | `key` prop remount OR lazy `useState` initializer | LOW | NO |

### Category C — Sync with external data / async fetch on mount (17 files)

| File | Component | Line | Cat | Current pattern | Recommended fix | Risk | Arch? |
|------|-----------|------|-----|-----------------|-----------------|------|-------|
| `src/components/layout/NotificationBell.jsx` | NotificationBell | 35 | C/F | `loadNotifications()` — async fetch + realtime subscription in `useEffect([])` | Extract to custom hook `useNotifications()` OR keep with justified `eslint-disable` (setState is post-`await`) | LOW-MED | NO* |
| `src/features/ai/AIInsights.jsx` | AIInsights | 22 | C/F | `loadForecast()` — async fetch in `useEffect([])` | Custom hook `useForecast()` OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Analytics.jsx` | Analytics | 31 | C/F | `loadAnalytics()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/AuditLogs.jsx` | AuditLogs | 43 | C/F | `loadLogs()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Employees.jsx` | Employees | 57 | C/F | `loadEmployees()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Finance.jsx` | Finance | 57 | C/F | `loadInvoices()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/FinanceLedger.jsx` | FinanceLedger | 21 | C/F | `loadEntries()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/FinanceWorkspace.jsx` | FinanceWorkspace | 26 | C/F | `loadData()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/InventoryLedger.jsx` | InventoryLedger | 24 | C/F | `loadLedger()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Orders.jsx` | Orders | 63 | C/F | `loadOrders()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Procurement.jsx` | Procurement | 63 | C/F | `loadPurchaseOrders()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Production.jsx` | Production | 108 | C/F | `fetchProducts()` — async fetch in `useEffect([])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/components/production/MaterialPlanningTab.jsx` | MaterialPlanningTab | 21 | C/F | `fetchData()` — async fetch in `useEffect([orderId])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/PricingManagement.jsx` | PricingManagement | 596 | C/F | `load()` — async fetch in `useEffect([tableFilter])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/PricingManagement.jsx` | PricingManagement | 671 | C/F | `load()` (useCallback) — async fetch in `useEffect([load])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/ProductMaster.jsx` | ProductMaster | 163 | C/F | `load()` (useCallback) — async fetch in `useEffect([load])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |
| `src/pages/Inventory.jsx` | Inventory | 215 | C/F | `load()` (useCallback) — async fetch in `useEffect([load])` | Custom hook OR justified `eslint-disable` | LOW-MED | NO* |

> *The `NO*` in the Arch column means: **no architecture change is strictly required** to make the
> lint pass. Two options exist — (1) a mechanical `eslint-disable` with justification (the setState
> is post-`await`, so it is a false positive), or (2) extracting a custom data-fetch hook
> (`useXxxData()`), which is a *pattern standardization* but not an architecture decision.
> **The choice between (1) and (2) is the one decision that requires user input.**

### Category A — Derived state (1 error)

| File | Component | Line | Cat | Current pattern | Recommended fix | Risk | Arch? |
|------|-----------|------|-----|-----------------|-----------------|------|-------|
| `src/components/quote/QuoteForm.jsx` | QuoteForm | 224 | A | `setPricing({...calculated})` in `useEffect` — pricing derived from spec + commercial inputs | Replace with `useMemo` computing pricing from inputs during render | MED | NO |

### Category C — QuoteForm external sync (2 errors)

| File | Component | Line | Cat | Current pattern | Recommended fix | Risk | Arch? |
|------|-----------|------|-----|-----------------|-----------------|------|-------|
| `src/components/quote/QuoteForm.jsx` | QuoteForm | 182 | C/F | `setProducts([])` + fetch products on `customer_id` change | Custom hook OR justified `eslint-disable` (post-`await`) | LOW-MED | NO* |
| `src/components/quote/QuoteForm.jsx` | QuoteForm | 192 | C/F | `setArtworks([])` + fetch artworks on `product_id` change | Custom hook OR justified `eslint-disable` (post-`await`) | LOW-MED | NO* |

### Category D — Reset logic (3 files)

| File | Component | Line | Cat | Current pattern | Recommended fix | Risk | Arch? |
|------|-----------|------|-----|-----------------|-----------------|------|-------|
| `src/components/inventory/InventoryDetails.jsx` | InventoryDetails | 31 | D | `setNotes(item?.notes \|\| '')` in `useEffect([item])` — reset notes when item changes | `key` prop remount OR derive `notes` during render with `useState` reset via key | LOW | NO |
| `src/components/production/ProductionDetails.jsx` | ProductionDetails | 11 | D | `setNotes(job?.notes \|\| '')` in `useEffect([job])` — reset notes when job changes | `key` prop remount OR derive during render | LOW | NO |
| `src/components/orders/OrderDetails.jsx` | OrderDetails | 26 | D | `setLoading(false)` in else branch of `useEffect` — reset loading flag | Move reset into the conditional render path OR use `key` | LOW | NO |

### Category E — Potential runtime bug (0 errors)

**None found.** No error in this set represents a genuine runtime bug caused by setState-in-effect.

### Category F — False positive (0 standalone)

**None standalone.** All Category C entries are annotated `C/F` because the `setState` calls
occur after `await` (inside async callbacks), not synchronously in the effect body. The
`react-hooks/set-state-in-effect` rule flags them textually, but they are not the synchronous
anti-pattern the rule is designed to catch.

---

## 3. Summary by Category

| Category | Count | Mechanical fix? | Architecture change? |
|----------|-------|-----------------|----------------------|
| A — Derived state | 1 | YES (`useMemo`) | NO |
| B — Form init from props | 10 | YES (`key` / lazy init) | NO |
| C — Sync external data (async fetch) | 19 | YES (see note) | NO* |
| D — Reset logic | 3 | YES (`key` / derive) | NO |
| E — Runtime bug | 0 | — | — |
| F — False positive (standalone) | 0 | — | — |
| **TOTAL** | **33** | | |

---

## 4. Mechanical vs Architecture

### Mechanical fixes (33 of 33 errors — 100%)

Every `set-state-in-effect` error in this codebase can be resolved with a **mechanical** fix:

- **Category A (1 error):** Convert `useEffect` + `setState` to `useMemo`. Pure refactor, no
  behavior change. Risk: MEDIUM (pricing calc logic must be preserved exactly).
- **Category B (10 errors):** Either (a) add a `key` prop to the form component so it remounts
  when the entity prop changes, or (b) use a lazy `useState(() => deriveFromProp())` initializer.
  Both are standard React patterns. Risk: LOW.
- **Category D (3 errors):** Same as B — `key` prop or derive during render. Risk: LOW.
- **Category C (19 errors):** Two mechanical options:
  1. **`eslint-disable-next-line react-hooks/set-state-in-effect`** with a justification
     comment ("setState is inside async callback, post-`await` — not synchronous"). This is
     the *lowest-risk* option and is arguably correct since the rule is a false positive here.
  2. **Extract a custom hook** (`useNotifications`, `useForecast`, `useAnalytics`, etc.) that
     encapsulates the fetch + setState. This is a *pattern standardization* — it does not
     change data flow, auth, schema, or component hierarchy. Risk: LOW-MEDIUM.

### Architecture decisions required: **ZERO**

No error in this set requires a change to:
- Database schema
- Auth flow
- Component hierarchy / routing
- Data model
- API contracts
- State management architecture

The only *judgment call* is **which mechanical option to apply to Category C** (disable-comment
vs custom-hook extraction). This is a **style/consistency decision**, not an architecture
decision. It does not trigger a STOP condition.

---

## 5. Recommended Execution Order (when fixes are authorized)

1. **Category A (1 file, 1 error)** — QuoteForm.jsx line 224 → `useMemo`. Highest risk, do first
   while context is fresh. Verify pricing output unchanged.
2. **Category B (10 files)** — Add `key` props at the *parent* call sites (one line each).
   Lowest risk, fast wins.
3. **Category D (3 files)** — Same `key` approach. Batch with B.
4. **Category C (19 errors, 17 files)** — Apply the chosen option (disable-comment OR custom
   hook) uniformly. **This is the one decision that needs user input before proceeding.**

---

## 6. Open Question for User (NOT an architecture decision)

For **Category C** (19 errors, 17 files — async fetch on mount/filter change):

- **Option 1:** Add `eslint-disable-next-line react-hooks/set-state-in-effect` with a
  justification comment to each effect. Fastest, lowest risk, arguably correct (false positive).
- **Option 2:** Extract a custom data-fetch hook per page (`useInventoryData`,
  `useOrdersData`, etc.). More idiomatic, more code churn, standardizes the pattern.

**This choice does not affect runtime behavior, schema, auth, or architecture.**
It is a code-style consistency decision. Awaiting user preference before applying.

---

## 7. Compliance with STOP Directive

- ✅ NO files modified (this document is a new classification artifact, not a source change)
- ✅ NO ESLint rules disabled
- ✅ NO refactoring performed
- ✅ EVERY remaining `set-state-in-effect` error classified into A–F
- ✅ Mechanical vs Architecture determination complete
- ✅ `SET_STATE_CLASSIFICATION.md` created

**Classification complete. Awaiting direction.**
