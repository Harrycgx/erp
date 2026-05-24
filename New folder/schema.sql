create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'staff', 'production', 'hr', 'customer');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'quotation_status') then
    create type public.quotation_status as enum ('draft', 'sent', 'approved', 'rejected', 'expired', 'converted');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending', 'confirmed', 'in_production', 'quality_check', 'dispatch_ready', 'dispatched', 'delivered', 'cancelled');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  company_name text,
  phone text,
  role public.app_role not null default 'customer',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
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
  department text not null,
  designation text,
  employment_status text not null default 'active',
  salary numeric(12,2) not null default 0,
  joining_date date,
  emergency_contact text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  status public.quotation_status not null default 'draft',
  box_type text not null,
  length numeric(12,2) not null default 0,
  width numeric(12,2) not null default 0,
  height numeric(12,2) not null default 0,
  quantity integer not null default 0 check (quantity >= 0),
  material_spec text,
  printing_type text,
  lamination text,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  valid_until date,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  assigned_employee_id uuid references public.employees(id) on delete set null,
  status public.order_status not null default 'pending',
  production_stage text not null default 'pending',
  payment_status text not null default 'pending',
  priority text not null default 'normal',
  total numeric(14,2) not null default 0,
  due_date date,
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
