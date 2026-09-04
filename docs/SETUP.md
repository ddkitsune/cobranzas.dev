# Setup de Cobranzas.dev

Sistema de cobranzas: app web (Vercel) + bot de WhatsApp (Cloudflare Workers)
+ base de datos (Supabase).

## 1. Supabase

1. Crea un proyecto gratuito en supabase.com.
2. En **SQL Editor** ejecuta el contenido de
   `supabase/migrations/0001_init.sql` (pega el código, no la ruta).
3. En **Authentication → Users** crea el usuario admin (email + contraseña).
   Es el que usará el panel para iniciar sesión.
4. Copia la **Project URL** y la **anon key** (Settings → API) a `web/.env`.
5. Copia la **Project URL** y la **service_role key** para los secrets del bot
   (Solo backend; NUNCA la pongas en variables de Vite del frontend).

## 2. Bot de WhatsApp (Cloudflare Workers)

Requiere: número de WhatsApp real para escanear el QR una vez.

1. `cd bot && npm install`.
2. `npx wrangler login`.
3. Configura los secrets (NO en `wrangler.toml`):
   ```bash
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_KEY
   npx wrangler secret put SESSION_TOKEN   # mismo valor que VITE_BOT_TOKEN en la web
   npx wrangler secret put WEB_URL         # https://tu-app.vercel.app
   npx wrangler secret put ADMIN_PHONE     # número del admin, formato 58xxxxxxxxxx
   ```
4. Despliega:
   ```bash
   npx wrangler deploy
   ```
5. Abre `https://tu-worker.workers.dev/session` (si el DO no devuelve QR, consulta
   los logs de wrangler para escanearlo). Escanea el QR con el WhatsApp de
   cobranzas UNA vez. La sesión queda persistida en el Durable Object.

## 3. App web (Vercel)

1. Sube el repo y crea un proyecto Vercel con directorio raíz `web/`.
2. Variables de entorno en Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BOT_URL` (URL del Worker)
   - `VITE_BOT_TOKEN` (mismo que `SESSION_TOKEN` del bot)
3. Deploy. La ruta pública `/pago/:token` funciona sin login.

## 4. Uso

1. En el panel: **Tipos de cliente** → crea los 5 tipos con su monto mensual.
2. **Clientes** → crea o **Importar** desde Excel (columnas: Nombre, Cédula,
   Teléfono, Dirección, Entrada, Casa, Nota).
3. **Envíos** → "Enviar cobros" dispara el mensaje de WhatsApp con el enlace de
   pago a cada cliente activo.
4. El cliente paga por el formulario → aparece en **Pagos** → confirma/rechaza.

## Notas

- El bot usa un Durable Object que mantiene la conexión de WhatsApp. La sesión
  persiste en el storage del DO (capa gratuita de Workers).
- `crypto.randomUUID()` genera los tokens de cada formulario.
- Fase de prueba: el cliente solo reporta su pago (método/referencia); no hay
  pasarela de cobro real.