import { useState } from 'react'
import { periodoActual } from '../lib/period'

export default function Billing() {
  const [period, setPeriod] = useState(periodoActual())
  const [resultado, setResultado] = useState<{ sent?: number; error?: string }>({})

  async function enviar() {
    setResultado({})
    const url = (import.meta.env.VITE_BOT_URL as string) + '/api/billing'
    const token = import.meta.env.VITE_BOT_TOKEN as string
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ period }),
      })
      const data = await r.json()
      if (!r.ok) setResultado({ error: data.message ?? 'Error al enviar' })
      else setResultado({ sent: data.sent })
    } catch (e) { setResultado({ error: (e as Error).message }) }
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Envío mensual</h1>
      <div className="mb-4 flex gap-2">
        <input className="border p-2" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <button className="bg-blue-600 p-2 text-white" onClick={enviar}>Enviar cobros</button>
      </div>
      {resultado.sent !== undefined && <p className="text-green-600">Enviados: {resultado.sent}</p>}
      {resultado.error && <p className="text-red-600">{resultado.error}</p>}
    </div>
  )
}