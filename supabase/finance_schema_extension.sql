-- Finance workflow extensions (run after schema.sql)

alter table public.invoices
  add column if not exists sales_order_id uuid references public.sales_orders(id) on delete set null;

alter table public.invoices
  add column if not exists discount_amount numeric(14,2) not null default 0;

alter table public.invoices
  add column if not exists total_amount numeric(14,2) not null default 0;

alter table public.invoices
  add column if not exists due_amount numeric(14,2) not null default 0;

create index if not exists idx_invoices_sales_order_id on public.invoices(sales_order_id);
create index if not exists idx_invoices_customer_id on public.invoices(customer_id);
create index if not exists idx_invoices_status on public.invoices(status);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  sales_order_item_id uuid references public.sales_order_items(id) on delete set null,
  item_name text not null,
  description text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  gst_percentage numeric(8,4) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoice_items_invoice_id on public.invoice_items(invoice_id);

alter table public.payments
  add column if not exists transaction_reference text;

create sequence if not exists public.invoice_number_seq;

create or replace function public.generate_invoice_number() returns text as $$
declare
  seqval bigint;
begin
  seqval := nextval('public.invoice_number_seq');
  return format('INV-%s-%s', to_char(now(), 'YYYY'), lpad(seqval::text, 4, '0'));
end;
$$ language plpgsql stable;

create or replace function public.ensure_invoice_numbers() returns trigger as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := public.generate_invoice_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_set_invoice_numbers on public.invoices;
create trigger before_insert_set_invoice_numbers
before insert on public.invoices
for each row execute function public.ensure_invoice_numbers();
