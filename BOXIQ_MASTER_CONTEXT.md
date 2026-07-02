# BOXIQ MASTER CONTEXT

## Project Status

Project Name: BoxIQ ERP

Industry: Corrugated Box Manufacturing

Tech Stack:

* React
* Vite
* TailwindCSS
* Supabase

Development Status:

MVP ERP operational and being stabilized.

Future roadmap includes:

* Customer Ordering Website
* Shared Supabase Database
* Shared Pricing Engine
* Shared Product Catalog
* Shared Artwork Library

The customer website MUST NOT duplicate ERP business logic.

---

# Current Business Workflow

Customer
→ Quotation
→ Order
→ Production Job
→ Dispatch
→ Invoice
→ Payment

Current implemented automation:

Quotation Approved
→ Order Created

Order Created
→ Production Job Created

Production Completed
→ Dispatch Created

Dispatch Delivered
→ Invoice Created

---

# Existing Database Tables

customers

products

artworks

quotations

orders

production_jobs

dispatches

invoices

inventory

procurement_requests

---

# Production Module

Current statuses:

Scheduled

In Progress

QC

Completed

Production completion currently generates dispatch records.

Known issue previously fixed:

status field was used incorrectly as stage.

Current production workflow operational.

---

# Dispatch Module

Current statuses:

pending

delivered

Dispatch delivery currently generates invoices.

Known historical data issue:

Some dispatch rows contain order UUIDs instead of order_number.

New records use correct order_number values.

---

# Invoice Module

Current statuses:

pending

partial

paid

Invoices are currently generated from dispatch completion.

Revenue dashboard calculations use invoice_amount.

Finance workflow still incomplete.

Missing:

Payment collection

Receipt management

Overdue tracking

Customer statements

---

# Inventory Module

Inventory system exists.

Reservation services exist.

Inventory consumption workflow is incomplete.

Production does not yet fully consume inventory according to BOM requirements.

Future work required.

---

# Procurement Module

Procurement requests exist.

Automatic procurement workflow requires further development.

Desired workflow:

Low Stock
→ Procurement Request
→ Purchase Order
→ Goods Receipt
→ Inventory Update

---

# Product Module

Products exist.

Products are linked to quotations.

Future customer website will consume products directly.

Products should become customer-facing catalog items.

---

# Artwork Module

Artwork management exists.

Artworks are linked to products.

Future customer portal must support artwork reuse and artwork approval workflows.

---

# Dashboard

Current KPIs:

Customers

Orders

Invoices

Dispatches

Revenue

Production Jobs

Dashboard currently queries live Supabase data.

---

# Authentication

Protected routes implemented.

Role architecture exists but requires future expansion.

Future roles:

Admin

Sales

Production

Procurement

Finance

Customer

---

# Future Customer Portal Requirements

Customer Login

Browse Products

Browse Approved Artworks

Request Quotation

Place Order

Track Production

Track Dispatch

Download Invoices

Reorder Previous Products

All functionality must use same database as ERP.

No duplicated pricing logic allowed.

No duplicated workflow logic allowed.

---

# Architectural Rules

1. Business workflows belong in services, not page components.

2. ERP and customer portal must share core services whenever possible.

3. Pricing must be centralized.

4. Future mobile apps must use same backend architecture.

5. Avoid duplicate service files.

6. Audit trails required for critical actions.

---

# Current Known Technical Debt

Duplicate production service implementations exist.

Historical dispatch data inconsistencies exist.

Inventory consumption workflow incomplete.

Finance workflow incomplete.

Audit logs not implemented.

Pricing management not implemented.

---

# High Priority Remaining Modules

1. Pricing Management
2. Payment Collection Workflow
3. Audit Logs
4. Inventory Consumption
5. Vendor Management
6. Purchase Orders
7. Customer Portal

Everything should be designed assuming ERP + Customer Website will share the same Supabase database.
