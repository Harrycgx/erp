-- Sales order numbering: SO-YYYY-####
-- Run after schema.sql on Supabase.

create sequence if not exists public.sales_order_number_seq;

create or replace function public.generate_sales_order_number() returns text as $$
declare
  seqval bigint;
begin
  seqval := nextval('public.sales_order_number_seq');
  return format('SO-%s-%s', to_char(now(), 'YYYY'), lpad(seqval::text, 4, '0'));
end;
$$ language plpgsql stable;

create or replace function public.ensure_sales_order_numbers() returns trigger as $$
begin
  if new.sales_order_number is null or new.sales_order_number = '' then
    new.sales_order_number := public.generate_sales_order_number();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists before_insert_set_sales_order_numbers on public.sales_orders;
create trigger before_insert_set_sales_order_numbers
before insert on public.sales_orders
for each row execute function public.ensure_sales_order_numbers();
