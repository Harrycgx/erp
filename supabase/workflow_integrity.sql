-- Workflow integrity constraints (run after schema + extension scripts)

-- One active sales order per quotation (when quotation_id is set)
create unique index if not exists uq_sales_orders_quotation_id
  on public.sales_orders (quotation_id)
  where quotation_id is not null;

-- One invoice per sales order (when sales_order_id column exists)
create unique index if not exists uq_invoices_sales_order_id
  on public.invoices (sales_order_id)
  where sales_order_id is not null;

-- One production job per sales order (when sales_order_id column exists)
create unique index if not exists uq_production_jobs_sales_order_id
  on public.production_jobs (sales_order_id)
  where sales_order_id is not null;

-- Status consistency on quotations
update public.quotations
set status = lower(replace(trim(status), ' ', '_'))
where status is not null and status ~ '[A-Z ]';
