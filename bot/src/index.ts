import { WhatsAppDO } from './whatsapp-do'
import { makeSupabase } from './supabase'

export { WhatsAppDO }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/health') return new Response('ok')

    // Consultar datos de un formulario de pago (público, solo con token)
    if (url.pathname.startsWith('/api/forma/')) {
      const token = url.pathname.split('/').pop()!
      const db = makeSupabase(env)
      const { data } = await db.from('payment_forms')
        .select('*, clients(nombre, client_types(monthly_amount))')
        .eq('token', token).single()
      if (!data) return new Response('Formulario no valido', { status: 404 })
      await db.from('payment_forms').update({ status: 'abierto' }).eq('id', data.id)
      return Response.json({
        token: data.token,
        period: data.period,
        amount: (data.clients as any)?.client_types?.monthly_amount ?? 0,
        nombre: (data.clients as any)?.nombre,
      })
    }

    // Registrar un pago desde el formulario público
    if (url.pathname === '/api/pago' && request.method === 'POST') {
      const db = makeSupabase(env)
      const body = await request.json() as {
        token: string; method: string; reference: string; payment_date: string; amount: number
      }
      const { data: forma } = await db.from('payment_forms')
        .select('*, clients(telefono, nombre)').eq('token', body.token).single()
      if (!forma) return new Response('Formulario no valido', { status: 404 })
      await db.from('payments').insert({
        client_id: forma.client_id,
        amount: body.amount ?? 0,
        period: forma.period,
        method: body.method,
        reference: body.reference,
        payment_date: body.payment_date,
      })
      await db.from('payment_forms')
        .update({ status: 'completado', completed_at: new Date().toISOString() }).eq('id', forma.id)

      // Notificar al admin (queda pendiente de verificación)
      if (env.ADMIN_PHONE) {
        const id = env.WHATSAPP_DO.idFromName('main')
        const stub = env.WHATSAPP_DO.get(id)
        await stub.fetch(new Request('https://internal/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.SESSION_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jid: `${env.ADMIN_PHONE}@s.whatsapp.net`,
            text: `Nuevo pago de ${(forma.clients as any)?.nombre} (${forma.period}). Revisa el panel.`,
          }),
        }))
      }
      return Response.json({ ok: true })
    }

    // Envío masivo mensual (protegido)
    if (url.pathname === '/api/billing' && request.method === 'POST') {
      const auth = request.headers.get('Authorization')
      if (auth !== `Bearer ${env.SESSION_TOKEN}`) return new Response('unauthorized', { status: 401 })
      const db = makeSupabase(env)
      const { period } = await request.json() as { period: string }
      const { data: clientes } = await db.from('clients')
        .select('*, client_types(monthly_amount)').eq('active', true)
      const id = env.WHATSAPP_DO.idFromName('main')
      const stub = env.WHATSAPP_DO.get(id)
      let sent = 0
      for (const c of clientes ?? []) {
        const token = crypto.randomUUID()
        await db.from('payment_forms').insert({
          client_id: c.id, period, token, status: 'enviado', sent_at: new Date().toISOString(),
        })
        const monto = (c.client_types as any)?.monthly_amount ?? 0
        const formUrl = `${env.WEB_URL}/pago/${token}`
        await stub.fetch(new Request('https://internal/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.SESSION_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jid: `${c.telefono}@s.whatsapp.net`,
            text: `Hola ${c.nombre}, tu cuota de ${monto} de ${period}.\nPaga aqui: ${formUrl}`,
          }),
        }))
        sent++
      }
      await db.from('billing_runs').insert({ period, status: 'completado', total_sent: sent })
      return Response.json({ sent })
    }

    // Todo lo demás → Durable Object
    const id = env.WHATSAPP_DO.idFromName('main')
    const stub = env.WHATSAPP_DO.get(id)
    return stub.fetch(request)
  },
} satisfies ExportedHandler<Env>

export interface Env {
  WHATSAPP_DO: DurableObjectNamespace
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  SESSION_TOKEN: string
  WEB_URL: string
  ADMIN_PHONE: string
}