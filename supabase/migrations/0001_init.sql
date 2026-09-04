-- Tipos de cliente con monto fijo mensual
create extension if not exists pgcrypto;

create table if not exists client_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_amount numeric not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Clientes
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cedula text not null unique,
  telefono text not null unique,
  direccion text,
  forma_entrada text check (forma_entrada in ('llave','control')),
  casa text,
  nota text,
  client_type_id uuid references client_types(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pagos reportados por el cliente / verificados por el admin
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  amount numeric not null,
  period text not null,               -- 'YYYY-MM'
  method text,
  reference text,
  payment_date date,
  status text not null default 'pendiente'
    check (status in ('pendiente','confirmado','rechazado')),
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  notes text
);

-- Tokens de formulario de pago enviados por WhatsApp
create table if not exists payment_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  period text not null,
  token text not null unique,
  status text not null default 'enviado'
    check (status in ('enviado','abierto','completado')),
  expires_at timestamptz,
  sent_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Sesiones de chat por cliente
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id),
  phone text not null,
  last_activity_at timestamptz not null default now()
);

-- Ejecuciones de envío mensual masivo
create table if not exists billing_runs (
  id uuid primary key default gen_random_uuid(),
  period text not null,
  triggered_at timestamptz not null default now(),
  status text not null default 'en_proceso'
    check (status in ('en_proceso','completado','fallido')),
  total_sent int not null default 0
);

-- Índices útiles
create index if not exists idx_clients_telefono on clients(telefono);
create index if not exists idx_payments_client on payments(client_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_payment_forms_token on payment_forms(token);