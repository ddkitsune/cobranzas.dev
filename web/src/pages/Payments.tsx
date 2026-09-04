import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { verificarPago } from '../lib/clients'
import type { Pago } from '../lib/types'

type PagoConCliente = Pago & { clientes?: { nombre: string } | null }

export default function Payments() {
  const [pagos, setPagos] = useState<PagoConCliente[]>([])

  async function cargar() {
    const { data, error } = await supabase
      .from('payments').select('*, clientes(nombre)').order('submitted_at', { ascending: false })
    if (error) return
    setPagos((data ?? []) as PagoConCliente[])
  }
  useEffect(() => { cargar() }, [])

  async function verificar(id: string, status: 'confirmado' | 'rechazado') {
    await verificarPago(id, status)
    cargar()
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Pagos</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Cliente</th><th>Periodo</th><th>Monto</th><th>Método</th>
            <th>Referencia</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.clientes?.nombre ?? p.client_id}</td>
              <td className="border p-2">{p.period}</td>
              <td className="border p-2">{p.amount}</td>
              <td className="border p-2">{p.method}</td>
              <td className="border p-2">{p.reference}</td>
              <td className="border p-2">{p.status}</td>
              <td className="border p-2">
                {p.status === 'pendiente' && (
                  <>
                    <button className="mr-1 bg-green-600 p-1 text-white"
                      onClick={() => verificar(p.id, 'confirmado')}>Confirmar</button>
                    <button className="bg-red-600 p-1 text-white"
                      onClick={() => verificar(p.id, 'rechazado')}>Rechazar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}