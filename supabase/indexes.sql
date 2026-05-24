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
create index if not exists idx_quotations_inquiry_id on public.quotations(inquiry_id);
create index if not exists idx_quotations_created_by on public.quotations(created_by);
create index if not exists idx_quotations_status on public.quotations(status);
create index if not exists idx_quotations_created_at on public.quotations(created_at desc);
create index if not exists idx_quotations_customer_status on public.quotations(customer_id, status);

create index if not exists idx_quote_items_quotation_id on public.quote_items(quotation_id);
create index if not exists idx_quote_items_created_at on public.quote_items(created_at desc);
create index if not exists idx_quotation_items_quotation_id on public.quotation_items(quotation_id);
create index if not exists idx_quotation_items_created_at on public.quotation_items(created_at desc);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_quotation_id on public.orders(quotation_id);
create index if not exists idx_orders_assigned_employee_id on public.orders(assigned_employee_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_production_stage on public.orders(production_stage);
create index if not exists idx_orders_due_date on public.orders(due_date);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_customer_status on public.orders(customer_id, status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_quotation_item_id on public.order_items(quotation_item_id);
create index if not exists idx_order_items_created_at on public.order_items(created_at desc);
create index if not exists idx_customer_notes_customer_id on public.customer_notes(customer_id);
create index if not exists idx_customer_notes_quotation_id on public.customer_notes(quotation_id);
create index if not exists idx_customer_notes_order_id on public.customer_notes(order_id);
create index if not exists idx_customer_notes_created_at on public.customer_notes(created_at desc);
create index if not exists idx_activity_logs_customer_id on public.activity_logs(customer_id);
create index if not exists idx_activity_logs_quotation_id on public.activity_logs(quotation_id);
create index if not exists idx_activity_logs_order_id on public.activity_logs(order_id);
create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

create index if not exists idx_inquiries_customer_id on public.inquiries(customer_id);
create index if not exists idx_inquiries_status on public.inquiries(status);
create index if not exists idx_inquiries_created_at on public.inquiries(created_at desc);

create index if not exists idx_inventory_items_supplier_id on public.inventory_items(supplier_id);
create index if not exists idx_inventory_items_category on public.inventory_items(category);
create index if not exists idx_inventory_items_material_name on public.inventory_items(material_name);
create index if not exists idx_stock_movements_item_id on public.stock_movements(inventory_item_id);
create index if not exists idx_stock_movements_created_at on public.stock_movements(created_at desc);
create index if not exists idx_inventory_transaction_logs_item_id on public.inventory_transaction_logs(inventory_item_id);
create index if not exists idx_inventory_transaction_logs_order_id on public.inventory_transaction_logs(order_id);
create index if not exists idx_inventory_transaction_logs_created_at on public.inventory_transaction_logs(created_at desc);

create index if not exists idx_suppliers_name on public.suppliers(supplier_name);
create index if not exists idx_vendors_name on public.vendors(vendor_name);

create index if not exists idx_purchase_orders_vendor_id on public.purchase_orders(vendor_id);
create index if not exists idx_purchase_orders_supplier_id on public.purchase_orders(supplier_id);
create index if not exists idx_purchase_orders_status on public.purchase_orders(status);
create index if not exists idx_purchase_orders_expected_delivery on public.purchase_orders(expected_delivery desc);
create index if not exists idx_procurement_requests_item_id on public.procurement_requests(inventory_item_id);
create index if not exists idx_procurement_requests_status on public.procurement_requests(status);
create index if not exists idx_procurement_requests_created_at on public.procurement_requests(created_at desc);
create index if not exists idx_goods_receipts_purchase_order_id on public.goods_receipts(purchase_order_id);
create index if not exists idx_goods_receipts_received_at on public.goods_receipts(received_at desc);

create index if not exists idx_production_jobs_order_id on public.production_jobs(order_id);
create index if not exists idx_production_jobs_stage on public.production_jobs(production_stage);
create index if not exists idx_production_jobs_created_at on public.production_jobs(created_at desc);
create index if not exists idx_production_plans_order_id on public.production_plans(order_id);
create index if not exists idx_production_plans_status on public.production_plans(production_status);
create index if not exists idx_production_plans_start on public.production_plans(planned_start);

create index if not exists idx_dispatch_records_order_id on public.dispatch_records(order_id);
create index if not exists idx_dispatch_records_dispatch_date on public.dispatch_records(dispatch_date desc);

create index if not exists idx_invoices_customer_id on public.invoices(customer_id);
create index if not exists idx_invoices_order_id on public.invoices(order_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_created_at on public.invoices(created_at desc);
create index if not exists idx_payments_invoice_id on public.payments(invoice_id);
create index if not exists idx_payments_customer_id on public.payments(customer_id);
create index if not exists idx_payments_payment_date on public.payments(payment_date desc);
create index if not exists idx_financial_transactions_customer_id on public.financial_transactions(customer_id);
create index if not exists idx_financial_transactions_invoice_id on public.financial_transactions(invoice_id);
create index if not exists idx_financial_transactions_date on public.financial_transactions(transaction_date desc);
create index if not exists idx_customer_ledgers_customer_id on public.customer_ledgers(customer_id);
create index if not exists idx_customer_ledgers_entry_date on public.customer_ledgers(entry_date desc);

create index if not exists idx_attendance_employee_id on public.attendance(employee_id);
create index if not exists idx_attendance_date on public.attendance(attendance_date desc);
create index if not exists idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index if not exists idx_leave_requests_status on public.leave_requests(status);
create index if not exists idx_payroll_employee_id on public.payroll(employee_id);
create index if not exists idx_payroll_generated_at on public.payroll(generated_at desc);

create index if not exists idx_pricing_rules_updated_at on public.pricing_rules(updated_at desc);
create index if not exists idx_quotation_documents_quotation_id on public.quotation_documents(quotation_id);
create index if not exists idx_quotation_documents_version on public.quotation_documents(quotation_id, version desc);
create index if not exists idx_notifications_recipient_role on public.notifications(recipient_role);
create index if not exists idx_notifications_recipient_id on public.notifications(recipient_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);

create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_table_record on public.audit_logs(table_name, record_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
