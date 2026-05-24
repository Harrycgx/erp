create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true
  limit 1
$$;

create or replace function public.has_role(allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = any(allowed_roles), false)
$$;

create or replace function public.owns_customer(customer_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.customers
    where id = customer_uuid
      and profile_id = auth.uid()
  )
$$;

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.employees enable row level security;
alter table public.quotations enable row level security;
alter table public.orders enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_select_own_or_internal" on public.profiles;
create policy "profiles_select_own_or_internal"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_role(array['admin', 'hr', 'staff']::public.app_role[])
);

drop policy if exists "profiles_insert_self_customer" on public.profiles;
create policy "profiles_insert_self_customer"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'customer'
);

drop policy if exists "profiles_update_own_basic_or_admin_hr" on public.profiles;
create policy "profiles_update_own_basic_or_admin_hr"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or public.has_role(array['admin', 'hr']::public.app_role[])
)
with check (
  id = auth.uid()
  or public.has_role(array['admin', 'hr']::public.app_role[])
);

drop policy if exists "customers_select_by_role" on public.customers;
create policy "customers_select_by_role"
on public.customers
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff', 'production', 'hr']::public.app_role[])
);

drop policy if exists "customers_insert_internal" on public.customers;
create policy "customers_insert_internal"
on public.customers
for insert
to authenticated
with check (
  public.has_role(array['admin', 'staff']::public.app_role[])
  or profile_id = auth.uid()
);

drop policy if exists "customers_update_by_role" on public.customers;
create policy "customers_update_by_role"
on public.customers
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff']::public.app_role[])
)
with check (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff']::public.app_role[])
);

drop policy if exists "customers_delete_admin" on public.customers;
create policy "customers_delete_admin"
on public.customers
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "employees_select_internal" on public.employees;
create policy "employees_select_internal"
on public.employees
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'hr', 'staff', 'production']::public.app_role[])
);

drop policy if exists "employees_insert_admin_hr" on public.employees;
create policy "employees_insert_admin_hr"
on public.employees
for insert
to authenticated
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists "employees_update_admin_hr" on public.employees;
create policy "employees_update_admin_hr"
on public.employees
for update
to authenticated
using (public.has_role(array['admin', 'hr']::public.app_role[]))
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists "employees_delete_admin" on public.employees;
create policy "employees_delete_admin"
on public.employees
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "quotations_select_by_role" on public.quotations;
create policy "quotations_select_by_role"
on public.quotations
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production']::public.app_role[])
);

drop policy if exists "quotations_insert_customer_or_sales" on public.quotations;
create policy "quotations_insert_customer_or_sales"
on public.quotations
for insert
to authenticated
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff']::public.app_role[])
);

drop policy if exists "quotations_update_customer_draft_or_sales" on public.quotations;
create policy "quotations_update_customer_draft_or_sales"
on public.quotations
for update
to authenticated
using (
  public.has_role(array['admin', 'staff']::public.app_role[])
  or (public.owns_customer(customer_id) and status = 'draft')
)
with check (
  public.has_role(array['admin', 'staff']::public.app_role[])
  or (public.owns_customer(customer_id) and status = 'draft')
);

drop policy if exists "quotations_delete_admin_staff_draft_customer" on public.quotations;
create policy "quotations_delete_admin_staff_draft_customer"
on public.quotations
for delete
to authenticated
using (
  public.has_role(array['admin', 'staff']::public.app_role[])
  or (public.owns_customer(customer_id) and status = 'draft')
);

drop policy if exists "orders_select_by_role" on public.orders;
create policy "orders_select_by_role"
on public.orders
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'hr']::public.app_role[])
);

drop policy if exists "orders_insert_internal" on public.orders;
create policy "orders_insert_internal"
on public.orders
for insert
to authenticated
with check (public.has_role(array['admin', 'staff']::public.app_role[]));

drop policy if exists "orders_update_internal" on public.orders;
create policy "orders_update_internal"
on public.orders
for update
to authenticated
using (public.has_role(array['admin', 'staff', 'production']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production']::public.app_role[]));

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin"
on public.orders
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
on public.audit_logs
for select
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists "audit_logs_insert_system_only" on public.audit_logs;
create policy "audit_logs_insert_system_only"
on public.audit_logs
for insert
to authenticated
with check (false);
