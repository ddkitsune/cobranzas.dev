const BOT_URL = import.meta.env.VITE_BOT_URL as string

export type PagoFormInfo = {
  token: string
  period: string
  amount: number
  nombre: string
}

export async function getPagoPorToken(token: string): Promise<PagoFormInfo> {
  const r = await fetch(`${BOT_URL}/api/forma/${token}`)
  if (!r.ok) throw new Error('Formulario no válido')
  return r.json()
}

export async function registrarPago(body: {
  token: string
  method: string
  reference: string
  payment_date: string
  amount: number
}) {
  const r = await fetch(`${BOT_URL}/api/pago`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error('No se pudo registrar el pago')
  return r.json()
}