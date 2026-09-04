import makeWASocket, {
  DisconnectReason,
  initAuthCreds,
  type AuthenticationState,
  type SignalKeyStore,
  type SignalDataSet,
  type SignalDataTypeMap,
} from '@whiskeysockets/baileys'
import { makeSupabase } from './supabase'
import { respuestaDeuda } from './chatbot'
import type { Env } from './index'
import type { PagoDB } from './types'

function periodoActual(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

type PersistedAuth = { creds: AuthenticationState['creds']; keys: SignalDataSet }

export class WhatsAppDO {
  state: DurableObjectState
  env: Env
  private sock: ReturnType<typeof makeWASocket> | null = null
  private auth: AuthenticationState | null = null
  private creds: AuthenticationState['creds'] | null = null
  private keys: Record<string, Record<string, unknown>> = {}
  private persist = () => {
    if (this.creds) return this.state.storage.put('auth', { creds: this.creds, keys: this.keys })
    return Promise.resolve()
  }

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/send') return this.handleSend(request)
    if (url.pathname === '/session') return this.handleSession()
    return new Response('not found', { status: 404 })
  }

  private async loadAuthState(): Promise<AuthenticationState> {
    if (this.auth) return this.auth
    const stored = await this.state.storage.get<PersistedAuth>('auth')
    this.creds = stored?.creds ?? initAuthCreds()
    this.keys = (stored?.keys ?? {}) as Record<string, Record<string, unknown>>

    const keyStore: SignalKeyStore = {
      get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]) => {
        const map = (this.keys[type] ?? {}) as Record<string, SignalDataTypeMap[T]>
        const out: { [id: string]: SignalDataTypeMap[T] } = {}
        for (const id of ids) out[id] = map[id]
        return out
      },
      set: async (data: SignalDataSet) => {
        for (const type of Object.keys(data) as (keyof SignalDataSet)[]) {
          this.keys[type] = { ...(this.keys[type] ?? {}), ...(data[type] as Record<string, unknown> | undefined) }
        }
        await this.persist()
      },
    }

    this.auth = { creds: this.creds, keys: keyStore }
    return this.auth
  }

  private async ensureSocket() {
    if (this.sock) return this.sock
    const authState = await this.loadAuthState()
    const sock = makeWASocket({ auth: authState })
    sock.ev.on('creds.update', async () => {
      await this.persist()
    })
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const code = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode
        if (code !== DisconnectReason.loggedOut) this.sock = null
      }
    })
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue
        const jid = m.key.remoteJid
        if (!jid || !jid.endsWith('@s.whatsapp.net')) continue
        const text = m.message.conversation ?? m.message.extendedTextMessage?.text ?? ''
        await this.handleChat(jid, text)
      }
    })
    this.sock = sock
    return sock
  }

  private async handleChat(jid: string, _text: string) {
    const phone = jid.replace('@s.whatsapp.net', '')
    const db = makeSupabase(this.env)
    const { data: cliente } = await db.from('clients')
      .select('*, client_types(*)').eq('telefono', phone).maybeSingle()
    if (!cliente) {
      await this.sock?.sendMessage(jid, { text: 'No te tenemos registrado. Contacta al administrador.' })
      return
    }
    const { data: pagos } = await db.from('payments').select('period, status').eq('client_id', cliente.id)
    const respuesta = respuestaDeuda(cliente.nombre, cliente.client_types?.monthly_amount ?? 0, (pagos ?? []) as PagoDB[], periodoActual())
    await this.sock?.sendMessage(jid, { text: respuesta })
    await db.from('chat_sessions').upsert({
      client_id: cliente.id, phone, last_activity_at: new Date().toISOString(),
    }, { onConflict: 'client_id' })
  }

  private async handleSend(request: Request): Promise<Response> {
    const auth = request.headers.get('Authorization')
    if (auth !== `Bearer ${this.env.SESSION_TOKEN}`) return new Response('unauthorized', { status: 401 })
    const { jid, text } = await request.json() as { jid: string; text: string }
    await this.ensureSocket()
    await this.sock?.sendMessage(jid, { text })
    return new Response('sent')
  }

  private handleSession() {
    return new Response('session', { headers: { 'Content-Type': 'text/plain' } })
  }
}