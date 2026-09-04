import type { Env } from './index'

export class WhatsAppDO {
  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }
  private state: DurableObjectState
  private env: Env

  async fetch(request: Request): Promise<Response> {
    return new Response('whatsapp-do ok')
  }
}