-- Link production jobs to sales orders (run after schema.sql)
alter table public.production_jobs
  add column if not exists sales_order_id uuid references public.sales_orders(id) on delete set null;

create index if not exists idx_production_jobs_sales_order_id on public.production_jobs(sales_order_id);
