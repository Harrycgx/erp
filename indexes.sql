create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_active_role on public.profiles(is_active, role);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);

create index if not exists idx_customers_profile_id on public.customers(profile_id);
create index if not exists idx_customers_company_name on public.customers(company_name);
create index if not exists idx_customers_status on public.customers(status);
create index if not exists idx_customers_created_at on public.customers(created_at desc);

create index if not exists idx_employees_profile_id on public.employees(profile_id);
create index if not exists idx_employees_department on public.employees(department);
create index if not exists idx_employees_status on public.employees(employment_status);
create index if not exists idx_employees_created_at on public.employees(created_at desc);

create index if not exists idx_quotations_customer_id on public.quotations(customer_id);
create index if not exists idx_quotations_created_by on public.quotations(created_by);
create index if not exists idx_quotations_status on public.quotations(status);
create index if not exists idx_quotations_created_at on public.quotations(created_at desc);
create index if not exists idx_quotations_customer_status on public.quotations(customer_id, status);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_quotation_id on public.orders(quotation_id);
create index if not exists idx_orders_assigned_employee_id on public.orders(assigned_employee_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_production_stage on public.orders(production_stage);
create index if not exists idx_orders_due_date on public.orders(due_date);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_status on public.orders(customer_id, status);

create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
