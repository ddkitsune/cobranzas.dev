import { useEffect, useState } from 'react'
import { listarTipos, guardarTipo, eliminarTipo } from '../lib/clientTypes'
import type { TipoCliente } from '../lib/types'

export default function ClientTypes() {
  const [tipos, setTipos] = useState<TipoCliente[]>([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { recargar() }, [])

  async function recargar() {
    try { setTipos(await listarTipos()) } catch (e) { setError((e as Error).message) }
  }

  async function crear() {
    try {
      await guardarTipo({ name, monthly_amount: Number(amount) })
      setName(''); setAmount('')
      await recargar()
    } catch (e) { setError((e as Error).message) }
  }

  async function toggleActivo(t: TipoCliente) {
    await guardarTipo({ id: t.id, name: t.name, monthly_amount: t.monthly_amount, active: !t.active })
    await recargar()
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tipos de cliente</h1>
      <div className="mb-4 flex gap-2">
        <input className="border p-2" placeholder="Nombre" value={name}
          onChange={(e) => setName(e.target.value)} />
        <input className="border p-2" placeholder="Monto" type="number" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <button className="bg-blue-600 p-2 text-white" onClick={crear}>Agregar</button>
      </div>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <table className="w-full border">
        <thead><tr><th>Nombre</th><th>Monto</th><th>Activo</th><th></th></tr></thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.id}>
              <td className="border p-2">{t.name}</td>
              <td className="border p-2">{t.monthly_amount}</td>
              <td className="border p-2">{t.active ? 'Sí' : 'No'}</td>
              <td className="border p-2">
                <button className="bg-gray-600 p-1 text-white" onClick={() => toggleActivo(t)}>
                  {t.active ? 'Desactivar' : 'Activar'}
                </button>
                <button className="ml-1 bg-red-600 p-1 text-white"
                  onClick={() => eliminarTipo(t.id).then(recargar)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}