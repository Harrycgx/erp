create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'staff', 'production', 'hr', 'customer', 'finance', 'procurement', 'sales', 'vendor');
  end if;
end $$;

alter type public.app_role add value if not exists 'finance';
alter type public.app_role add value if not exists 'procurement';
alter type public.app_role add value if not exists 'sales';
alter type public.app_role add value if not exists 'vendor';

do $$
begin
  if not exists (select 1 from pg_type where typname = 'production_stage') then
    create type public.production_stage as enum (
      'pending',
      'paper_ordered',
      'printing',
      'punching',
      'pasting',
      'qc',
      'dispatch_ready',
      'dispatched',
      'delivered'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  company_name text,
  role public.app_role not null default 'customer',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  billing_address text,
  shipping_address text,
  gst_number text,
  status text not null default 'active',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  employee_code text unique,
  full_name text not null,
  email text,
  phone text,
  department text not null default 'Operations',
  designation text,
  shift text,
  status text not null default 'Active',
  employment_status text not null default 'active',
  salary numeric(12,2) not null default 0,
  joining_date date,
  emergency_contact text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees add column if not exists shift text;
alter table public.employees add column if not exists status text not null default 'Active';

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text unique,
  quote_number text unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  inquiry_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'draft',
  box_type text not null default '',
  length numeric(12,2) not null default 0,
  width numeric(12,2) not null default 0,
  height numeric(12,2) not null default 0,
  quantity integer not null default 0 check (quantity >= 0),
  flute_type text,
  ply text,
  gsm numeric(12,2),
  printing_type text,
  lamination text,
  tooling_cost numeric(14,2) not null default 0,
  stitching text,
  urgency text,
  subtotal numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  gst numeric(14,2) not null default 0,
  gst_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  revision_number integer not null default 0,
  parent_quotation_id uuid references public.quotations(id) on delete set null,
  approved_at timestamptz,
  rejected_at timestamptz,
  converted_at timestamptz,
  assigned_staff text,
  valid_until date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.quotation_number_seq;

create or replace function public.generate_quotation_number() returns text as $$
declare
  seqval bigint;
begin
  seqval := nextval('public.quotation_number_seq');
  return format('QTN-%s-%s', to_char(now(), 'YYYY'), lpad(seqval::text, 4, '0'));
end;
$$ language plpgsql stable;

create or replace function public.ensure_quotation_numbers() returns trigger as $$
begin
  if new.quotation_number is null or new.quotation_number = '' then
    new.quotation_number := public.generate_quotation_number();
  end if;
  if new.quote_number is null or new.quote_number = '' then
    new.quote_number := new.quotation_number;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_set_quotation_numbers on public.quotations;
create trigger before_insert_set_quotation_numbers
before insert on public.quotations
for each row execute function public.ensure_quotation_numbers();

update public.quotations
set status = lower(replace(status, ' ', '_'))
where status is not null;

update public.quotations
set status = 'converted'
where status in ('converted_to_order', 'converted to order');

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  item_name text not null,
  description text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  item_name text not null,
  description text,
  box_type text,
  dimensions text,
  gsm numeric(12,2),
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  tax_rate numeric(8,4) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_comments (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  comment_type text not null default 'comment',
  comment text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_activity_logs (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references public.quotations(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  sales_order_id uuid references public.sales_orders(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  assigned_staff text,
  status text not null default 'Pending',
  production_stage text not null default 'Pending',
  payment_status text not null default 'Pending',
  priority text not null default 'Normal',
  box_type text,
  quantity integer not null default 0 check (quantity >= 0),
  total numeric(14,2) not null default 0,
  due_date date,
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  quotation_item_id uuid references public.quotation_items(id) on delete set null,
  item_name text not null,
  description text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  tax_rate numeric(8,4) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  sales_order_number text unique,
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending',
  production_stage text not null default 'pending',
  payment_status text not null default 'pending',
  priority text not null default 'normal',
  box_type text,
  quantity integer not null default 0 check (quantity >= 0),
  subtotal numeric(14,2) not null default 0,
  gst_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  due_date date,
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_order_items (
  id uuid primary key default gen_random_uuid(),
  sales_order_id uuid not null references public.sales_orders(id) on delete cascade,
  quotation_item_id uuid references public.quotation_items(id) on delete set null,
  item_name text not null,
  description text,
  box_type text,
  dimensions text,
  gsm numeric(12,2),
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  tax_rate numeric(8,4) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  quotation_id uuid references public.quotations(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note_type text not null default 'general',
  note text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  activity_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  box_type text,
  quantity integer not null default 0,
  status text not null default 'New',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quotations
  drop constraint if exists quotations_inquiry_id_fkey;

alter table public.quotations
  add constraint quotations_inquiry_id_fkey
  foreign key (inquiry_id) references public.inquiries(id) on delete set null;

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  item_code text,
  material_name text not null,
  item_name text,
  category text,
  supplier_id uuid,
  supplier text,
  current_stock numeric(14,3) not null default 0,
  stock_quantity numeric(14,3) not null default 0,
  reserved_stock numeric(14,3) not null default 0,
  reserved_quantity numeric(14,3) not null default 0,
  available_quantity numeric(14,3) not null default 0,
  minimum_stock numeric(14,3) not null default 0,
  reorder_level numeric(14,3) not null default 0,
  unit text,
  gsm numeric(12,2),
  dimensions text,
  cost_per_unit numeric(14,2) not null default 0,
  warehouse_location text,
  storage_location text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items add column if not exists reserved_stock numeric(14,3) not null default 0;

create or replace function public.sync_inventory_item_legacy_fields() returns trigger as $$
begin
  new.item_name := coalesce(new.item_name, new.material_name);
  new.stock_quantity := coalesce(new.stock_quantity, new.current_stock);
  new.reserved_quantity := coalesce(new.reserved_quantity, new.reserved_stock);
  new.reorder_level := coalesce(new.reorder_level, new.minimum_stock);
  new.warehouse_location := coalesce(new.warehouse_location, new.storage_location);
  new.available_quantity := new.stock_quantity - new.reserved_quantity;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_update_inventory_item_sync on public.inventory_items;
create trigger before_insert_update_inventory_item_sync
  before insert or update on public.inventory_items
  for each row execute function public.sync_inventory_item_legacy_fields();

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  movement_type text not null,
  quantity numeric(14,3) not null default 0,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  movement_type text not null,
  quantity numeric(14,3) not null default 0,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.bill_of_materials (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bom_items (
  id uuid primary key default gen_random_uuid(),
  bom_id uuid not null references public.bill_of_materials(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity_required numeric(14,3) not null default 0,
  unit text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_transaction_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,
  transaction_type text not null,
  quantity numeric(14,3) not null default 0,
  stock_before numeric(14,3),
  stock_after numeric(14,3),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items
  drop constraint if exists inventory_items_supplier_id_fkey;

alter table public.inventory_items
  add constraint inventory_items_supplier_id_fkey
  foreign key (supplier_id) references public.suppliers(id) on delete set null;

create or replace view public.inventory as
select *
from public.inventory_items;

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  vendor_name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  vendor_type text,
  gst_number text,
  payment_terms text,
  category text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text unique,
  vendor_id uuid references public.vendors(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  status text not null default 'Draft',
  total numeric(14,2) not null default 0,
  expected_delivery date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procurement_requests (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid references public.inventory_items(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  request_type text not null default 'low_stock',
  status text not null default 'open',
  required_quantity numeric(14,3) not null default 0,
  priority text not null default 'normal',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goods_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references public.purchase_orders(id) on delete set null,
  received_at timestamptz not null default now(),
  status text not null default 'Received',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.production_jobs (
  id uuid primary key default gen_random_uuid(),
  production_number text unique,
  order_id uuid references public.orders(id) on delete set null,
  order_number text,
  box_type text,
  quantity integer not null default 0,
  production_stage text not null default 'Pending',
  status text not null default 'Pending',
  dispatch_status text,
  priority text not null default 'Normal',
  assigned_to text,
  estimated_completion timestamptz,
  estimated_completion_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.production_number_seq;

create or replace function public.generate_production_number() returns text as $$
declare
  seqval bigint;
begin
  seqval := nextval('public.production_number_seq');
  return format('PRD-%s-%s', to_char(now(), 'YYYY'), lpad(seqval::text, 4, '0'));
end;
$$ language plpgsql stable;

create or replace function public.ensure_production_number() returns trigger as $$
begin
  if new.production_number is null or new.production_number = '' then
    new.production_number := public.generate_production_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_set_production_number on public.production_jobs;
create trigger before_insert_set_production_number
  before insert on public.production_jobs
  for each row execute function public.ensure_production_number();

create table if not exists public.production_stages (
  id uuid primary key default gen_random_uuid(),
  production_job_id uuid not null references public.production_jobs(id) on delete cascade,
  stage_name text not null,
  status text not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.production_plans (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  assigned_machine text,
  production_status text not null default 'Planned',
  planned_start timestamptz,
  planned_end timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dispatch_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  vehicle_number text,
  driver_name text,
  driver_phone text,
  dispatch_date timestamptz not null default now(),
  delivery_status text not null default 'In Transit',
  lr_number text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  invoice_number text unique,
  status text not null default 'Draft',
  invoice_date date not null default current_date,
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  gst_rate numeric(5,2) not null default 0,
  gst_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  paid_amount numeric(14,2) not null default 0,
  payment_status text not null default 'Due',
  total numeric(14,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  transaction_type text not null,
  amount numeric(14,2) not null default 0,
  transaction_date date not null default current_date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  amount numeric(14,2) not null default 0,
  payment_date date not null default current_date,
  payment_method text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_ledgers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  entry_date date not null default current_date,
  entry_type text not null,
  debit numeric(14,2) not null default 0,
  credit numeric(14,2) not null default 0,
  amount numeric(14,2) not null default 0,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  attendance_date date not null default current_date,
  attendance_status text not null default 'Present',
  status text not null default 'Present',
  check_in timestamptz,
  check_out timestamptz,
  overtime_hours numeric(10,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.attendance add column if not exists attendance_status text not null default 'Present';
alter table public.attendance add column if not exists overtime_hours numeric(10,2) not null default 0;

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  leave_type text,
  start_date date,
  end_date date,
  approval_status text not null default 'Pending',
  status text not null default 'Pending',
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leave_requests add column if not exists approval_status text not null default 'Pending';

create table if not exists public.payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete cascade,
  payroll_month text,
  salary_period text,
  base_salary numeric(14,2) not null default 0,
  overtime_hours numeric(10,2) not null default 0,
  overtime_amount numeric(14,2) not null default 0,
  leave_deductions numeric(14,2) not null default 0,
  bonus numeric(14,2) not null default 0,
  gross_amount numeric(14,2) not null default 0,
  deductions numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  net_salary numeric(14,2) not null default 0,
  payment_status text not null default 'Pending',
  status text not null default 'Draft',
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payroll add column if not exists payroll_month text;
alter table public.payroll add column if not exists base_salary numeric(14,2) not null default 0;
alter table public.payroll add column if not exists overtime_hours numeric(10,2) not null default 0;
alter table public.payroll add column if not exists overtime_amount numeric(14,2) not null default 0;
alter table public.payroll add column if not exists leave_deductions numeric(14,2) not null default 0;
alter table public.payroll add column if not exists bonus numeric(14,2) not null default 0;
alter table public.payroll add column if not exists net_salary numeric(14,2) not null default 0;
alter table public.payroll add column if not exists payment_status text not null default 'Pending';

create table if not exists public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  material_rate numeric(14,2) not null default 0,
  print_rate numeric(14,2) not null default 0,
  lamination_rate numeric(14,2) not null default 0,
  tooling_rate numeric(14,2) not null default 0,
  labor_rate numeric(14,2) not null default 0,
  rush_charge numeric(14,2) not null default 0,
  gst_rate numeric(8,4) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_documents (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  version integer not null default 1,
  file_name text,
  file_path text,
  public_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_role public.app_role,
  recipient_id uuid references public.profiles(id) on delete cascade,
  activity_log_id bigint references public.activity_logs(id) on delete set null,
  title text not null,
  message text not null,
  notification_type text not null default 'info',
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
