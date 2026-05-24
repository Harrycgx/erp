create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    company_name,
    phone,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

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

create or replace function public.approve_quotation_to_order(
  p_quotation_id uuid,
  p_actor_id uuid default auth.uid(),
  p_customer_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quote public.quotations%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_invoice_id uuid;
  v_item record;
  v_inventory public.inventory_items%rowtype;
  v_required_qty numeric(14,3);
  v_activity_id bigint;
begin
  select *
  into v_quote
  from public.quotations
  where id = p_quotation_id
  for update;

  if not found then
    raise exception 'Quotation % not found', p_quotation_id;
  end if;

  if lower(v_quote.status) in ('rejected', 'expired', 'converted_to_order') then
    raise exception 'Quotation % cannot be approved from status %', p_quotation_id, v_quote.status;
  end if;

  v_order_number := 'ORD-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    quotation_id,
    customer_id,
    order_number,
    status,
    production_stage,
    payment_status,
    priority,
    box_type,
    quantity,
    total,
    notes,
    metadata,
    created_by
  )
  values (
    v_quote.id,
    v_quote.customer_id,
    v_order_number,
    'confirmed',
    'pending',
    'pending',
    case when lower(coalesce(v_quote.urgency, '')) = 'rush' then 'High' else 'Normal' end,
    v_quote.box_type,
    v_quote.quantity,
    v_quote.total,
    'Created from approved quotation ' || coalesce(v_quote.quotation_number, v_quote.id::text),
    jsonb_build_object(
      'quotation_snapshot',
      to_jsonb(v_quote) || jsonb_build_object(
        'items',
        coalesce((select jsonb_agg(to_jsonb(qi)) from public.quotation_items qi where qi.quotation_id = v_quote.id), '[]'::jsonb)
      ),
      'pricing_locked_at',
      now()
    ),
    p_actor_id
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    quotation_item_id,
    item_name,
    description,
    quantity,
    unit_price,
    discount_amount,
    tax_rate,
    tax_amount,
    subtotal,
    total,
    metadata
  )
  select
    v_order_id,
    qi.id,
    qi.item_name,
    qi.description,
    qi.quantity,
    qi.unit_price,
    qi.discount_amount,
    qi.tax_rate,
    qi.tax_amount,
    qi.subtotal,
    qi.total,
    jsonb_build_object('copied_from_quotation_item_id', qi.id)
  from public.quotation_items qi
  where qi.quotation_id = v_quote.id;

  for v_item in
    select *
    from public.quotation_items
    where quotation_id = v_quote.id
      and metadata ? 'inventory_item_id'
  loop
    v_required_qty := coalesce(nullif(v_item.metadata->>'quantity_required', '')::numeric, v_item.quantity::numeric);

    select *
    into v_inventory
    from public.inventory_items
    where id = (v_item.metadata->>'inventory_item_id')::uuid
    for update;

    if found and v_required_qty > 0 then
      update public.inventory_items
      set
        current_stock = greatest(current_stock - v_required_qty, 0),
        reserved_stock = reserved_stock + v_required_qty,
        updated_at = now()
      where id = v_inventory.id;

      insert into public.stock_movements (
        inventory_item_id,
        movement_type,
        quantity,
        notes,
        created_by
      )
      values (
        v_inventory.id,
        'reservation',
        v_required_qty,
        'Reserved for order ' || v_order_number,
        p_actor_id
      );

      insert into public.inventory_transaction_logs (
        inventory_item_id,
        order_id,
        quotation_id,
        transaction_type,
        quantity,
        stock_before,
        stock_after,
        notes,
        created_by
      )
      values (
        v_inventory.id,
        v_order_id,
        v_quote.id,
        'order_reservation',
        v_required_qty,
        v_inventory.current_stock,
        greatest(v_inventory.current_stock - v_required_qty, 0),
        'Quotation approval reserved stock',
        p_actor_id
      );

      if greatest(v_inventory.current_stock - v_required_qty, 0) <= v_inventory.minimum_stock then
        insert into public.procurement_requests (
          inventory_item_id,
          supplier_id,
          order_id,
          request_type,
          status,
          required_quantity,
          priority,
          notes,
          created_by
        )
        values (
          v_inventory.id,
          v_inventory.supplier_id,
          v_order_id,
          'low_stock',
          'open',
          greatest((v_inventory.minimum_stock * 2) - greatest(v_inventory.current_stock - v_required_qty, 0), 0),
          'high',
          'Auto-created after stock reservation for order ' || v_order_number,
          p_actor_id
        );

        insert into public.notifications (
          recipient_role,
          title,
          message,
          notification_type,
          metadata
        )
        values (
          'procurement',
          'Low stock after order approval',
          coalesce(v_inventory.material_name, 'Inventory item') || ' is below minimum stock after order ' || v_order_number,
          'low_stock',
          jsonb_build_object('inventory_item_id', v_inventory.id, 'order_id', v_order_id)
        );
      end if;
    end if;
  end loop;

  insert into public.production_jobs (
    order_id,
    order_number,
    box_type,
    quantity,
    production_stage,
    priority,
    estimated_completion,
    notes,
    metadata
  )
  values (
    v_order_id,
    v_order_number,
    v_quote.box_type,
    v_quote.quantity,
    'pending',
    case when lower(coalesce(v_quote.urgency, '')) = 'rush' then 'High' else 'Normal' end,
    now() + make_interval(days => greatest(2, ceil(coalesce(v_quote.quantity, 0)::numeric / 1000)::int)),
    'Created automatically from approved quotation.',
    jsonb_build_object('quotation_id', v_quote.id)
  );

  insert into public.invoices (
    customer_id,
    order_id,
    invoice_number,
    status,
    subtotal,
    tax_amount,
    total
  )
  values (
    v_quote.customer_id,
    v_order_id,
    'INV-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    'Draft',
    v_quote.subtotal,
    coalesce(v_quote.tax_amount, v_quote.gst, 0),
    v_quote.total
  )
  returning id into v_invoice_id;

  insert into public.financial_transactions (
    customer_id,
    invoice_id,
    order_id,
    transaction_type,
    amount,
    notes,
    created_by
  )
  values (
    v_quote.customer_id,
    v_invoice_id,
    v_order_id,
    'invoice_created',
    v_quote.total,
    'Draft invoice created from approved quotation.',
    p_actor_id
  );

  update public.quotations
  set
    status = 'converted_to_order',
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'approved_at', now(),
      'converted_order_id', v_order_id,
      'converted_order_number', v_order_number,
      'invoice_id', v_invoice_id
    ),
    updated_at = now()
  where id = v_quote.id;

  if coalesce(trim(p_customer_note), '') <> '' then
    insert into public.customer_notes (
      customer_id,
      quotation_id,
      order_id,
      author_id,
      note_type,
      note
    )
    values (
      v_quote.customer_id,
      v_quote.id,
      v_order_id,
      p_actor_id,
      'approval',
      p_customer_note
    );
  end if;

  insert into public.activity_logs (
    actor_id,
    customer_id,
    quotation_id,
    order_id,
    activity_type,
    message,
    metadata
  )
  values (
    p_actor_id,
    v_quote.customer_id,
    v_quote.id,
    v_order_id,
    'quotation_approved',
    'Quotation approved and converted to order ' || v_order_number,
    jsonb_build_object('invoice_id', v_invoice_id)
  )
  returning id into v_activity_id;

  insert into public.notifications (
    recipient_role,
    activity_log_id,
    title,
    message,
    notification_type,
    metadata
  )
  values
    ('production', v_activity_id, 'New production order', 'Order ' || v_order_number || ' is ready for scheduling.', 'order_created', jsonb_build_object('order_id', v_order_id)),
    ('finance', v_activity_id, 'Draft invoice created', 'Draft invoice created for order ' || v_order_number || '.', 'invoice_created', jsonb_build_object('invoice_id', v_invoice_id)),
    ('sales', v_activity_id, 'Quotation converted', 'Quotation converted to order ' || v_order_number || '.', 'quotation_converted', jsonb_build_object('order_id', v_order_id));

  return v_order_id;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at before update on public.employees
for each row execute function public.set_updated_at();

drop trigger if exists set_quotations_updated_at on public.quotations;
create trigger set_quotations_updated_at before update on public.quotations
for each row execute function public.set_updated_at();

drop trigger if exists set_quote_items_updated_at on public.quote_items;
create trigger set_quote_items_updated_at before update on public.quote_items
for each row execute function public.set_updated_at();

drop trigger if exists set_quotation_items_updated_at on public.quotation_items;
create trigger set_quotation_items_updated_at before update on public.quotation_items
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at before update on public.order_items
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at before update on public.inventory_items
for each row execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists set_purchase_orders_updated_at on public.purchase_orders;
create trigger set_purchase_orders_updated_at before update on public.purchase_orders
for each row execute function public.set_updated_at();

drop trigger if exists set_procurement_requests_updated_at on public.procurement_requests;
create trigger set_procurement_requests_updated_at before update on public.procurement_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_production_jobs_updated_at on public.production_jobs;
create trigger set_production_jobs_updated_at before update on public.production_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at before update on public.attendance
for each row execute function public.set_updated_at();

drop trigger if exists set_leave_requests_updated_at on public.leave_requests;
create trigger set_leave_requests_updated_at before update on public.leave_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_payroll_updated_at on public.payroll;
create trigger set_payroll_updated_at before update on public.payroll
for each row execute function public.set_updated_at();

drop trigger if exists audit_profiles_changes on public.profiles;
create trigger audit_profiles_changes after insert or update or delete on public.profiles
for each row execute function public.write_audit_log();

drop trigger if exists audit_customers_changes on public.customers;
create trigger audit_customers_changes after insert or update or delete on public.customers
for each row execute function public.write_audit_log();

drop trigger if exists audit_employees_changes on public.employees;
create trigger audit_employees_changes after insert or update or delete on public.employees
for each row execute function public.write_audit_log();

drop trigger if exists audit_quotations_changes on public.quotations;
create trigger audit_quotations_changes after insert or update or delete on public.quotations
for each row execute function public.write_audit_log();

drop trigger if exists audit_quote_items_changes on public.quote_items;
create trigger audit_quote_items_changes after insert or update or delete on public.quote_items
for each row execute function public.write_audit_log();

drop trigger if exists audit_quotation_items_changes on public.quotation_items;
create trigger audit_quotation_items_changes after insert or update or delete on public.quotation_items
for each row execute function public.write_audit_log();

drop trigger if exists audit_orders_changes on public.orders;
create trigger audit_orders_changes after insert or update or delete on public.orders
for each row execute function public.write_audit_log();

drop trigger if exists audit_order_items_changes on public.order_items;
create trigger audit_order_items_changes after insert or update or delete on public.order_items
for each row execute function public.write_audit_log();

drop trigger if exists audit_inventory_items_changes on public.inventory_items;
create trigger audit_inventory_items_changes after insert or update or delete on public.inventory_items
for each row execute function public.write_audit_log();

drop trigger if exists audit_stock_movements_changes on public.stock_movements;
create trigger audit_stock_movements_changes after insert or update or delete on public.stock_movements
for each row execute function public.write_audit_log();

drop trigger if exists audit_purchase_orders_changes on public.purchase_orders;
create trigger audit_purchase_orders_changes after insert or update or delete on public.purchase_orders
for each row execute function public.write_audit_log();

drop trigger if exists audit_procurement_requests_changes on public.procurement_requests;
create trigger audit_procurement_requests_changes after insert or update or delete on public.procurement_requests
for each row execute function public.write_audit_log();

drop trigger if exists audit_production_jobs_changes on public.production_jobs;
create trigger audit_production_jobs_changes after insert or update or delete on public.production_jobs
for each row execute function public.write_audit_log();

drop trigger if exists audit_invoices_changes on public.invoices;
create trigger audit_invoices_changes after insert or update or delete on public.invoices
for each row execute function public.write_audit_log();

drop trigger if exists audit_payments_changes on public.payments;
create trigger audit_payments_changes after insert or update or delete on public.payments
for each row execute function public.write_audit_log();

drop trigger if exists audit_attendance_changes on public.attendance;
create trigger audit_attendance_changes after insert or update or delete on public.attendance
for each row execute function public.write_audit_log();

drop trigger if exists audit_leave_requests_changes on public.leave_requests;
create trigger audit_leave_requests_changes after insert or update or delete on public.leave_requests
for each row execute function public.write_audit_log();

drop trigger if exists audit_payroll_changes on public.payroll;
create trigger audit_payroll_changes after insert or update or delete on public.payroll
for each row execute function public.write_audit_log();
