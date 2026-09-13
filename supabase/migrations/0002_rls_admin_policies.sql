-- Acceso completo del admin (rol authenticated) a todas las tablas.
-- El formulario público (/pago/:token) NO usa RLS: pasa por el bot con service_role.

create policy "admin_full_client_types" on client_types
  for all to authenticated using (true) with check (true);

create policy "admin_full_clients" on clients
  for all to authenticated using (true) with check (true);

create policy "admin_full_payments" on payments
  for all to authenticated using (true) with check (true);

create policy "admin_full_payment_forms" on payment_forms
  for all to authenticated using (true) with check (true);

create policy "admin_full_chat_sessions" on chat_sessions
  for all to authenticated using (true) with check (true);

create policy "admin_full_billing_runs" on billing_runs
  for all to authenticated using (true) with check (true);