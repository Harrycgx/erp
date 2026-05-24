create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_identifier text;
begin
  record_identifier = coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, '');

  insert into public.audit_logs (
    actor_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data
  )
  values (
    auth.uid(),
    tg_table_name,
    record_identifier,
    lower(tg_op),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

drop trigger if exists set_quotations_updated_at on public.quotations;
create trigger set_quotations_updated_at
before update on public.quotations
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists audit_profiles_changes on public.profiles;
create trigger audit_profiles_changes
after insert or update or delete on public.profiles
for each row execute function public.write_audit_log();

drop trigger if exists audit_customers_changes on public.customers;
create trigger audit_customers_changes
after insert or update or delete on public.customers
for each row execute function public.write_audit_log();

drop trigger if exists audit_employees_changes on public.employees;
create trigger audit_employees_changes
after insert or update or delete on public.employees
for each row execute function public.write_audit_log();

drop trigger if exists audit_quotations_changes on public.quotations;
create trigger audit_quotations_changes
after insert or update or delete on public.quotations
for each row execute function public.write_audit_log();

drop trigger if exists audit_orders_changes on public.orders;
create trigger audit_orders_changes
after insert or update or delete on public.orders
for each row execute function public.write_audit_log();
