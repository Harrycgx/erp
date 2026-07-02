ARTICLE I: THE SUPREME LAW OF ARCHITECTURAL INTEGRITY
This Constitution governs all architectural choices, development sprints, and pull requests for BoxIQ. It stands above all feature requests, UI iterations, and product roadmaps. Features may change; the Constitution does not.

+-------------------------------------------------------------+
|                     SHARED DATABASE LAYER                   |
|                  (Strict Supabase RLS Core)                 |
+------------------------------+------------------------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
+------------------------------+ +------------------------------+
|   SUPABASE EDGE FUNCTIONS    | |   SUPABASE EDGE FUNCTIONS    |
|   (Canonical Pricing API)    | | (Canonical Configurator API) |
+--------------+---------------+ +--------------+---------------+
               |                               |
               +---------------+---------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
+------------------------------+ +------------------------------+
|        APPLICATION A         | |        APPLICATION B         |
|         Internal ERP         | |   Customer Portal / Web      |
|    (Full Stateful Writes)    | |    (Read-Heavy RLS UI)       |
+------------------------------+ +------------------------------+
ARTICLE II: NON-NEGOTIABLE OPERATIONAL PRINCIPLES
1. Single Brain, Dual Presentation
BoxIQ comprises two applications—Application A (Internal ERP) and Application B (Customer Ordering Platform). They are strictly prohibited from maintaining separate business logic.

No Floating Logic: The Product Configurator and Pricing Engine must reside exclusively in unified database-level constructs or Supabase Edge Functions.

Zero Drift: Frontends may render distinct layouts, but they must invoke the exact same API endpoints for core mathematical calculations.

2. The Invariance of Historical Truth
BOM Versioning: Bill of Materials (BOM) configurations are completely immutable. Any adjustment to a product design, dimension, or substrate configuration must mint a new incremented version code (v1 -> v2 -> v3). Active production runs and historical orders must remain permanently pinned to their original BOM version ID.

Costing Ledgers: Item cost records are ledgered historically. Overwriting a baseline cost per kilogram on a material master is an architecture violation. Price movements must write to an append-only transaction history table.

3. Closed-Loop Inventory Automation
No Manual Overrides: Stock balances cannot be freely modified by client-side actions. Material consumption must be bound to shop floor production event states.

Database Enforced Consumption: Raw material lot deduction is triggered exclusively via backend webhooks or transaction RPCs when a production_jobs.status transitions strictly to COMPLETED.

4. Absolute Perimeter Security
Row-Level Security (RLS): All data access by Application B must be bottlenecked through native Supabase Row-Level Security policies tied directly to auth.uid().

Zero Trust Data Exposure: No customer profile, artwork file, quote ledger, or billing document shall be queryable without explicit identity verification at the Postgres layer.

5. AI Containment
Deterministic Guardrails: Any future Artificial Intelligence layer, LLM, or natural language interface is strictly defined as an auxiliary input layer.

Zero Direct Mutation: AI assistants cannot alter database state or calculate commercial pricing outside the boundaries of the deterministic Supabase Edge Functions and system validation rules.