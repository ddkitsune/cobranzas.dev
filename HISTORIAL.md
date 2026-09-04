# Cobranzas.dev — Historial del proyecto

Sistema de cobranzas para un administrador de casas. App web (Vercel) + bot de
WhatsApp (Cloudflare Durable Object + Baileys) + Supabase.

## Estado (2026-09-04) — V1 implementada y publicada

- Implementación completa en rama `feat/cobranzas` del monorepo.
- Publicada en GitHub como repo independiente `cobranzas.dev` (subtree split desde
  `Cobranzas.dev/`) en dos cuentas: `shinmu45` y `ddkitsune` (remotes `shin45`/`dd45`).
- Migración SQL (`supabase/migrations/0001_init.sql`) ya aplicada en el Supabase del
  usuario.

## Estructura

```
Cobranzas.dev/
├── web/       App React 19 + Vite + Tailwind (panel admin + formulario público)
├── bot/       Cloudflare Worker + Durable Object + Baileys (envío y chatbot)
├── supabase/  Migraciones SQL (esquema)
└── docs/      Spec, plan y SETUP.md (guía de despliegue)
```

## Stack

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, Motion, react-router.
- Backend/BD: Supabase (Postgres + Auth), cliente JS.
- Bot: Cloudflare Workers + Durable Objects + Baileys (`@whiskeysockets/baileys`).
- Excel: SheetJS (`xlsx`). Tests: Vitest.

## Decisiones clave

- **1 solo administrador** (Supabase Auth, login simple). Los clientes interactúan
  solo por WhatsApp y por el formulario de pago público.
- **Arquitectura (Opción A)**: web en Vercel, datos en Supabase, bot en Cloudflare
  DO. Cada pieza en su mejor lugar, costo 0 en fase de prueba.
- **Monto fijo por tipo de cliente** (`client_types.monthly_amount`), configurable.
- **Estado de deuda automático**: se calcula desde `payments` (pago confirmado del
  periodo actual = solvente). El tipo de cliente es una categoría aparte.
- **Formulario de pago**: el cliente reporta método/referencia/fecha; el admin
  verifica (confirmado/rechazado). Sin pasarela de cobro real en V1.
- **Pago por token**: cada envío mensual genera un `payment_forms.token` único que
  pre-carga el formulario público `/pago/:token`.
- **Baileys en Durable Object**: el estado de autenticación se persiste en el
  storage del DO (adaptador `SignalKeyStore` propio, sin sistema de archivos).

## Diagrama de flujo (cobro mensual)

1. Admin pulsa "Enviar cobros" → Worker `/api/billing` crea `billing_run` + un
   `payment_forms` por cliente activo.
2. El DO envía por WhatsApp: saludo + monto del periodo + enlace `/pago/:token`.
3. El cliente abre el formulario (pre-cargado por token), envía su pago.
4. `/api/pago` inserta el pago `pendiente` y avisa al admin (ADMIN_PHONE).
5. El admin confirma/rechaza en el panel → se recalcula el estado de deuda.

## Gotchas / apuntes de esta máquina

- `gh` (GitHub CLI) NO está instalado. Para PRs automáticos hay que instalarlo.
- Los remotes `shin45`/`dd45` usan usuario incrustado en la URL
  (`https://<user>@github.com/...`) para usar las credenciales GCM separadas por
  cuenta. Push directo a `main` del repo independiente (método video-studio).
- PowerShell interpreta el stderr de git como "error" aunque el comando tenga
  éxito (exit 0): no alarmarse.
- `npm` en esta máquina bloquea postinstall de algunos paquetes (esbuild, workerd,
  baileys...). Aprobado con `npm approve-scripts <pkg>` cuando hacen falta.

## Pendientes

- Despliegue real de nubes (ver `docs/SETUP.md`):
  1. Supabase: ya creado y esquema aplicado; falta crear usuario admin + copiar keys.
  2. Bot: `wrangler login`, secrets, `wrangler deploy`, escanear QR una vez.
  3. Vercel: proyecto con raíz `web/` + variables de entorno.
- Probar el flujo completo end-to-end con un cliente real.
- Instalar `gh` si se quieren PRs automáticos.
- Release futuro: re-split desde `feat/cobranzas` (o main) → push a `shin45`/`dd45`.

## Roadmap candidato (v2)

- Pasarela de cobro real (Pago Móvil/Zelle/transferencia) con confirmación automática.
- Edición de montos por cliente/periodo.
- Notificaciones push / email.
- Multi-usuario o multi-tenant.