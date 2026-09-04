import { WhatsAppDO } from './whatsapp-do'

export { WhatsAppDO }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/health') {
      return new Response('ok')
    }
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
}