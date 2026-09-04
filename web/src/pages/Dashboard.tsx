import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { periodoActual } from '../lib/period'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, solventes: 0, enDeuda: 0, cobrado: 0 })

  useEffect(() => {
    (async () => {
      const [cli, pagos] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('payments')
          .select('client_id, status, period, amount')
          .eq('status', 'confirmado').eq('period', periodoActual()),
      ])
      const idsConfirmados = new Set((pagos.data ?? []).map((p) => p.client_id))
      const cobrado = (pagos.data ?? []).reduce((s, p) => s + (p.amount ?? 0), 0)
      setStats({
        total: cli.count ?? 0,
        solventes: idsConfirmados.size,
        enDeuda: (cli.count ?? 0) - idsConfirmados.size,
        cobrado,
      })
    })()
  }, [])

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Clientes" value={stats.total} />
        <Stat label="Solventes" value={stats.solventes} />
        <Stat label="En deuda" value={stats.enDeuda} />
        <Stat label={`Cobrado ${periodoActual()}`} value={stats.cobrado} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border p-4">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}