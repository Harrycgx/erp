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
alter table public.quote_items enable row level security;
alter table public.quotation_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customer_notes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.inquiries enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.inventory_transaction_logs enable row level security;
alter table public.suppliers enable row level security;
alter table public.vendors enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.procurement_requests enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.production_jobs enable row level security;
alter table public.production_plans enable row level security;
alter table public.dispatch_records enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.customer_ledgers enable row level security;
alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;
alter table public.payroll enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.quotation_documents enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_select_own_or_internal on public.profiles;
create policy profiles_select_own_or_internal
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.has_role(array['admin', 'staff', 'hr', 'finance', 'procurement', 'sales']::public.app_role[])
);

drop policy if exists profiles_insert_self_customer on public.profiles;
create policy profiles_insert_self_customer
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'customer'
);

drop policy if exists profiles_update_own_or_admin_hr on public.profiles;
create policy profiles_update_own_or_admin_hr
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

drop policy if exists customers_select_own_or_internal on public.customers;
create policy customers_select_own_or_internal
on public.customers
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff', 'production', 'hr', 'finance', 'procurement', 'sales']::public.app_role[])
);

drop policy if exists customers_insert_own_or_staff on public.customers;
create policy customers_insert_own_or_staff
on public.customers
for insert
to authenticated
with check (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
);

drop policy if exists customers_update_own_or_staff on public.customers;
create policy customers_update_own_or_staff
on public.customers
for update
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
)
with check (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff']::public.app_role[])
);

drop policy if exists customers_delete_admin on public.customers;
create policy customers_delete_admin
on public.customers
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists employees_select_internal_or_self on public.employees;
create policy employees_select_internal_or_self
on public.employees
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.has_role(array['admin', 'staff', 'production', 'hr']::public.app_role[])
);

drop policy if exists employees_insert_admin_hr on public.employees;
create policy employees_insert_admin_hr
on public.employees
for insert
to authenticated
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists employees_update_admin_hr on public.employees;
create policy employees_update_admin_hr
on public.employees
for update
to authenticated
using (public.has_role(array['admin', 'hr']::public.app_role[]))
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists employees_delete_admin on public.employees;
create policy employees_delete_admin
on public.employees
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists quotations_select_own_or_internal on public.quotations;
create policy quotations_select_own_or_internal
on public.quotations
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'sales']::public.app_role[])
);

drop policy if exists quotations_insert_own_or_staff on public.quotations;
create policy quotations_insert_own_or_staff
on public.quotations
for insert
to authenticated
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
);

drop policy if exists quotations_update_draft_customer_or_staff on public.quotations;
create policy quotations_update_draft_customer_or_staff
on public.quotations
for update
to authenticated
using (
  public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
  or (public.owns_customer(customer_id) and lower(status) = 'draft')
)
with check (
  public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
  or (public.owns_customer(customer_id) and lower(status) = 'draft')
);

drop policy if exists quotations_delete_admin_staff_or_draft_customer on public.quotations;
create policy quotations_delete_admin_staff_or_draft_customer
on public.quotations
for delete
to authenticated
using (
  public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
  or (public.owns_customer(customer_id) and lower(status) = 'draft')
);

drop policy if exists quote_items_select_by_quote_access on public.quote_items;
create policy quote_items_select_by_quote_access
on public.quote_items
for select
to authenticated
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quote_items.quotation_id
      and (
        public.owns_customer(q.customer_id)
        or public.has_role(array['admin', 'staff', 'production']::public.app_role[])
      )
  )
);

drop policy if exists quote_items_write_by_quote_owner_or_staff on public.quote_items;
create policy quote_items_write_by_quote_owner_or_staff
on public.quote_items
for all
to authenticated
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quote_items.quotation_id
      and (
  public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
        or (public.owns_customer(q.customer_id) and lower(q.status) = 'draft')
      )
  )
)
with check (
  exists (
    select 1
    from public.quotations q
    where q.id = quote_items.quotation_id
      and (
        public.has_role(array['admin', 'staff']::public.app_role[])
        or (public.owns_customer(q.customer_id) and lower(q.status) = 'draft')
      )
  )
);

drop policy if exists quotation_items_select_by_quote_access on public.quotation_items;
create policy quotation_items_select_by_quote_access
on public.quotation_items
for select
to authenticated
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        public.owns_customer(q.customer_id)
        or public.has_role(array['admin', 'staff', 'production']::public.app_role[])
      )
  )
);

drop policy if exists quotation_items_write_by_quote_owner_or_staff on public.quotation_items;
create policy quotation_items_write_by_quote_owner_or_staff
on public.quotation_items
for all
to authenticated
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        public.has_role(array['admin', 'staff']::public.app_role[])
        or (public.owns_customer(q.customer_id) and lower(q.status) = 'draft')
      )
  )
)
with check (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_items.quotation_id
      and (
        public.has_role(array['admin', 'staff']::public.app_role[])
        or (public.owns_customer(q.customer_id) and lower(q.status) = 'draft')
      )
  )
);

drop policy if exists orders_select_own_or_internal on public.orders;
create policy orders_select_own_or_internal
on public.orders
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'hr', 'finance', 'sales']::public.app_role[])
);

drop policy if exists orders_insert_staff_admin on public.orders;
create policy orders_insert_staff_admin
on public.orders
for insert
to authenticated
with check (public.has_role(array['admin', 'staff', 'sales']::public.app_role[]));

drop policy if exists orders_update_internal on public.orders;
create policy orders_update_internal
on public.orders
for update
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'sales']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production', 'sales']::public.app_role[]));

drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin
on public.orders
for delete
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists order_items_select_by_order_access on public.order_items;
create policy order_items_select_by_order_access
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (
        public.owns_customer(o.customer_id)
        or public.has_role(array['admin', 'staff', 'production', 'hr']::public.app_role[])
      )
  )
);

drop policy if exists order_items_internal_write on public.order_items;
create policy order_items_internal_write
on public.order_items
for all
to authenticated
using (public.has_role(array['admin', 'staff']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'sales']::public.app_role[]));

drop policy if exists customer_notes_select_related on public.customer_notes;
create policy customer_notes_select_related
on public.customer_notes
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
);

drop policy if exists customer_notes_insert_related on public.customer_notes;
create policy customer_notes_insert_related
on public.customer_notes
for insert
to authenticated
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
);

drop policy if exists activity_logs_select_related on public.activity_logs;
create policy activity_logs_select_related
on public.activity_logs
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'hr', 'finance', 'procurement', 'sales']::public.app_role[])
);

drop policy if exists activity_logs_insert_internal_or_customer_event on public.activity_logs;
create policy activity_logs_insert_internal_or_customer_event
on public.activity_logs
for insert
to authenticated
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'hr']::public.app_role[])
);

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
on public.audit_logs
for select
to authenticated
using (public.has_role(array['admin']::public.app_role[]));

drop policy if exists audit_logs_no_direct_client_insert on public.audit_logs;
create policy audit_logs_no_direct_client_insert
on public.audit_logs
for insert
to authenticated
with check (false);

drop policy if exists audit_logs_no_client_update on public.audit_logs;
create policy audit_logs_no_client_update
on public.audit_logs
for update
to authenticated
using (false)
with check (false);

drop policy if exists audit_logs_no_client_delete on public.audit_logs;
create policy audit_logs_no_client_delete
on public.audit_logs
for delete
to authenticated
using (false);

drop policy if exists inquiries_select_own_or_internal on public.inquiries;
create policy inquiries_select_own_or_internal
on public.inquiries
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'production', 'sales']::public.app_role[])
);

drop policy if exists inquiries_write_own_or_staff on public.inquiries;
create policy inquiries_write_own_or_staff
on public.inquiries
for all
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'sales']::public.app_role[])
)
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff']::public.app_role[])
);

drop policy if exists inventory_internal_read on public.inventory_items;
create policy inventory_internal_read
on public.inventory_items
for select
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]));

drop policy if exists inventory_admin_staff_write on public.inventory_items;
create policy inventory_admin_staff_write
on public.inventory_items
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]));

drop policy if exists stock_movements_internal_read on public.stock_movements;
create policy stock_movements_internal_read
on public.stock_movements
for select
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]));

drop policy if exists stock_movements_internal_write on public.stock_movements;
create policy stock_movements_internal_write
on public.stock_movements
for insert
to authenticated
with check (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]));

drop policy if exists inventory_transaction_logs_internal_read on public.inventory_transaction_logs;
create policy inventory_transaction_logs_internal_read
on public.inventory_transaction_logs
for select
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]));

drop policy if exists suppliers_internal_access on public.suppliers;
create policy suppliers_internal_access
on public.suppliers
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]));

drop policy if exists vendors_internal_access on public.vendors;
create policy vendors_internal_access
on public.vendors
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]));

drop policy if exists purchase_orders_internal_access on public.purchase_orders;
create policy purchase_orders_internal_access
on public.purchase_orders
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'procurement']::public.app_role[]));

drop policy if exists procurement_requests_internal_access on public.procurement_requests;
create policy procurement_requests_internal_access
on public.procurement_requests
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production', 'procurement']::public.app_role[]));

drop policy if exists goods_receipts_internal_access on public.goods_receipts;
create policy goods_receipts_internal_access
on public.goods_receipts
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production']::public.app_role[]));

drop policy if exists production_jobs_internal_access on public.production_jobs;
create policy production_jobs_internal_access
on public.production_jobs
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production']::public.app_role[]));

drop policy if exists production_plans_internal_access on public.production_plans;
create policy production_plans_internal_access
on public.production_plans
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production']::public.app_role[]));

drop policy if exists dispatch_records_internal_access on public.dispatch_records;
create policy dispatch_records_internal_access
on public.dispatch_records
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'production']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'production']::public.app_role[]));

drop policy if exists invoices_select_own_or_finance on public.invoices;
create policy invoices_select_own_or_finance
on public.invoices
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'finance']::public.app_role[])
);

drop policy if exists invoices_staff_write on public.invoices;
create policy invoices_staff_write
on public.invoices
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]));

drop policy if exists payments_select_own_or_finance on public.payments;
create policy payments_select_own_or_finance
on public.payments
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'finance']::public.app_role[])
);

drop policy if exists payments_staff_write on public.payments;
create policy payments_staff_write
on public.payments
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]));

drop policy if exists financial_transactions_finance_access on public.financial_transactions;
create policy financial_transactions_finance_access
on public.financial_transactions
for all
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'finance']::public.app_role[])
)
with check (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'finance']::public.app_role[])
);

drop policy if exists ledgers_select_own_or_finance on public.customer_ledgers;
create policy ledgers_select_own_or_finance
on public.customer_ledgers
for select
to authenticated
using (
  public.owns_customer(customer_id)
  or public.has_role(array['admin', 'staff', 'finance']::public.app_role[])
);

drop policy if exists ledgers_staff_write on public.customer_ledgers;
create policy ledgers_staff_write
on public.customer_ledgers
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'finance']::public.app_role[]));

drop policy if exists attendance_hr_access on public.attendance;
create policy attendance_hr_access
on public.attendance
for all
to authenticated
using (public.has_role(array['admin', 'hr']::public.app_role[]))
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists leave_requests_hr_access on public.leave_requests;
create policy leave_requests_hr_access
on public.leave_requests
for all
to authenticated
using (public.has_role(array['admin', 'hr']::public.app_role[]))
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists payroll_hr_access on public.payroll;
create policy payroll_hr_access
on public.payroll
for all
to authenticated
using (public.has_role(array['admin', 'hr']::public.app_role[]))
with check (public.has_role(array['admin', 'hr']::public.app_role[]));

drop policy if exists pricing_rules_staff_read_admin_write on public.pricing_rules;
create policy pricing_rules_staff_read_admin_write
on public.pricing_rules
for select
to authenticated
using (public.has_role(array['admin', 'staff', 'sales']::public.app_role[]));

drop policy if exists pricing_rules_admin_write on public.pricing_rules;
create policy pricing_rules_admin_write
on public.pricing_rules
for all
to authenticated
using (public.has_role(array['admin']::public.app_role[]))
with check (public.has_role(array['admin']::public.app_role[]));

drop policy if exists quotation_documents_select_by_quote_access on public.quotation_documents;
create policy quotation_documents_select_by_quote_access
on public.quotation_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.quotations q
    where q.id = quotation_documents.quotation_id
      and (
        public.owns_customer(q.customer_id)
        or public.has_role(array['admin', 'staff', 'production', 'sales']::public.app_role[])
      )
  )
);

drop policy if exists quotation_documents_staff_write on public.quotation_documents;
create policy quotation_documents_staff_write
on public.quotation_documents
for all
to authenticated
using (public.has_role(array['admin', 'staff', 'sales']::public.app_role[]))
with check (public.has_role(array['admin', 'staff', 'sales']::public.app_role[]));

drop policy if exists notifications_role_or_direct_read on public.notifications;
create policy notifications_role_or_direct_read
on public.notifications
for select
to authenticated
using (
  recipient_id = auth.uid()
  or public.current_user_role() = recipient_role
  or public.has_role(array['admin']::public.app_role[])
);

drop policy if exists notifications_internal_write on public.notifications;
create policy notifications_internal_write
on public.notifications
for insert
to authenticated
with check (public.has_role(array['admin', 'staff', 'production', 'procurement', 'finance', 'hr', 'sales']::public.app_role[]));
