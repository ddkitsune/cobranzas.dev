# Sistema de Cobranzas — Spec de diseño

Fecha: 2026-09-04
Proyecto: `Cobranzas.dev`
Estado: Aprobado para implementación (fase de prueba)

## 1. Objetivo

Sistema de cobranzas para un administrador de casas (un solo usuario). Permite
gestionar clientes, importar/exportar desde Excel, enviar mensualmente por
WhatsApp un formulario de pago a cada cliente, y que los clientes consulten el
estado de su deuda mediante un chatbot de WhatsApp.

## 2. Usuarios y modelo de acceso

- **1 solo administrador.** Login simple con Supabase Auth (email + contraseña).
- Los clientes NO entran a la app web: interactúan solo por WhatsApp (chatbot) y
  a través del formulario de pago público.

## 3. Arquitectura (Opción A)

Tres piezas, cada una en su mejor lugar, costo cero en fase de prueba:

| Pieza | Tecnología | Hosting |
|-------|-----------|---------|
| App web (panel admin + formulario de pago público) | React 19, Vite, Tailwind CSS, Motion | Vercel |
| Base de datos | Supabase (PostgreSQL + Auth) | Supabase |
| Bot de WhatsApp (envío + chatbot) | Cloudflare Worker + Durable Object + Baileys | Cloudflare Workers |

### Flujo de cobro mensual

1. El admin pulsa "Enviar cobro de este mes" en la app (o se programa con cron de
   Workers) → se crea un `billing_run` para el periodo actual.
2. La app genera un `payment_form` con token único por cliente y lo entrega al bot
   vía su API interna.
3. El bot envía por WhatsApp a cada cliente: saludo + monto del mes + enlace al
   formulario de pago.
4. El cliente abre el formulario (pre-cargado con sus datos según su número de
   WhatsApp), rellena método, referencia y fecha del pago, y lo envía.
5. El pago se guarda en `payments` con estado `pendiente`. El bot responde
   "recibimos tu pago, en proceso de verificación".
6. El admin valida (confirma o rechaza) el pago en el panel. Al confirmar, el
   sistema recalcula automáticamente el estado de deuda del cliente.

### Flujo del chatbot

- El cliente escribe por WhatsApp (p. ej. "hola", "cuánto debo").
- El webhook de WhatsApp → Durable Object → consulta Supabase → responde con el
  estado de deuda actualizado del cliente.

### Flujo de Excel

- Importación masiva de clientes desde `.xlsx` con mapeo de columnas.
- Exportación de la lista actual a Excel en cualquier momento.

## 4. Estructura de datos (Supabase)

### `client_types`
Tipos de cliente con monto fijo mensual, configurable por el admin.
- `id` uuid PK
- `name` text (solvente, deudor, condición especial, casa vacía, múltiple casa)
- `monthly_amount` numeric
- `active` bool

### `clients`
- `id` uuid PK
- `nombre` text NOT NULL
- `cedula` text UNIQUE NOT NULL
- `telefono` text UNIQUE NOT NULL (formato internacional, sin +)
- `direccion` text
- `forma_entrada` text CHECK (`llave` | `control`)
- `casa` text (identificador/unidad de casa)
- `nota` text
- `client_type_id` uuid FK → `client_types.id`
- `active` bool (borrado lógico; no se borra historial)
- `created_at`, `updated_at` timestamptz

El `monto` y el `estado_de_deuda` se **derivan**: el monto viene del tipo; el estado
(solvente/en deuda) se calcula desde `payments`. No se guardan manualmente.

### `payments`
- `id` uuid PK
- `client_id` uuid FK → `clients.id`
- `amount` numeric NOT NULL
- `period` text NOT NULL (p. ej. `2026-09`)
- `method` text (Pago Móvil, transferencia, Zelle, efectivo, otro)
- `reference` text
- `payment_date` date
- `status` text CHECK (`pendiente` | `confirmado` | `rechazado`) DEFAULT `pendiente`
- `submitted_at` timestamptz
- `verified_at` timestamptz
- `notes` text

### `payment_forms`
Tokens del formulario de pago enviado por WhatsApp.
- `id` uuid PK
- `client_id` uuid FK → `clients.id`
- `period` text
- `token` text UNIQUE NOT NULL (para pre-cargar el formulario)
- `status` text CHECK (`enviado` | `abierto` | `completado`)
- `expires_at` timestamptz
- `sent_at` timestamptz
- `completed_at` timestamptz

### `chat_sessions`
Historial del chatbot por cliente.
- `id` uuid PK
- `client_id` uuid FK → `clients.id`
- `phone` text
- `last_activity_at` timestamptz

### `billing_runs`
Registro de cada envío mensual masivo.
- `id` uuid PK
- `period` text NOT NULL
- `triggered_at` timestamptz
- `status` text CHECK (`en_proceso` | `completado` | `fallido`)
- `total_sent` int

### Reglas
- Cédula y teléfono únicos por cliente (misma casa ≠ mismo cliente).
- Borrado lógico: `active = false`, sin perder historial.

## 5. Tipos de cliente vs. estado de deuda

- **Tipo de cliente**: categoría con monto fijo (incluye `solvente` y `deudor`
  como categorías posibles). La asigna el admin.
- **Estado de deuda** (solvente/en deuda): **automático**, calculado desde los
  pagos. Si el cliente no tiene el pago confirmado del periodo actual → en deuda.
- El estado automático no cambia el tipo de cliente; el admin controla el tipo.

## 6. Interfaz del panel admin (resumen)

- **Login** (Supabase Auth).
- **Dashboard**: resumen (clientes totales, solventes, en deuda, cobrado este mes).
- **Clientes**: tabla con búsqueda/filtros, crear/editar/desactivar, vista de
  detalle con historial de pagos y chat.
- **Importar/Exportar Excel**: subir `.xlsx` (mapeo de columnas), descargar listado.
- **Tipos de cliente**: CRUD + montos fijos.
- **Pagos**: bandeja de pendientes para verificar (confirmar/rechazar), historial.
- **Envíos**: botón "Enviar cobro de este mes", historial de `billing_runs`.

## 7. Comportamiento del bot de WhatsApp

- Identifica al cliente por el número de teléfono que coincide con `clients.telefono`.
- Envío mensual: saludo + monto + enlace del formulario de pago.
- Chatbot: responde a comandos/texto con el estado de deuda del cliente.
- Notificación al admin cuando un cliente envía un pago (queda pendiente de
  verificación).

## 8. Seguridad

- Ningún secreto en el código fuente. Variables de entorno vía secreto de Vercel,
  secrets de Workers y Supabase.
- El formulario público valida el `token` firmado; expira.
- RLS (Row Level Security) en Supabase: solo el admin lee/escribe la app;
  el formulario público y el bot usan credenciales limitadas (service role solo
  desde el backend/bot, nunca desde el cliente).

## 9. Fase de prueba

- Número de WhatsApp real del admin (o número de prueba) conectado vía Baileys + QR
  escaneado una vez en el Durable Object.
- Sin pasarela de pago real: el cliente solo reporta el pago y el admin verifica.
- Costo de hosting: 0 (Vercel free, Workers free tier, Supabase free tier).

## 10. Fuera de alcance (v1)

- Multi-usuario / multi-tenant.
- Pasarela de pago real (cobro automático).
- Notificaciones push / email.