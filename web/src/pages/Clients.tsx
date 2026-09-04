import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarClientes } from '../lib/clients'
import type { ClienteConTipo } from '../lib/types'

export default function Clients() {
  const [clientes, setClientes] = useState<ClienteConTipo[]>([])
  const [q, setQ] = useState('')

  useEffect(() => { listarClientes().then(setClientes).catch(console.error) }, [])

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(q.toLowerCase()) ||
    c.cedula.includes(q) || (c.telefono || '').includes(q)
  )

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link to="/importar" className="bg-blue-600 p-2 text-white">Importar</Link>
      </div>
      <input className="mb-4 w-full border p-2" placeholder="Buscar por nombre, cédula o teléfono"
        value={q} onChange={(e) => setQ(e.target.value)} />
      <table className="w-full border">
        <thead>
          <tr>
            <th>Nombre</th><th>Cédula</th><th>Teléfono</th><th>Tipo</th>
            <th>Monto</th><th>Estado</th><th>Entrada</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="border p-2"><Link to={`/clientes/${c.id}`} className="text-blue-600">{c.nombre}</Link></td>
              <td className="border p-2">{c.cedula}</td>
              <td className="border p-2">{c.telefono}</td>
              <td className="border p-2">{c.tipo?.name ?? '—'}</td>
              <td className="border p-2">{c.montoMensual}</td>
              <td className="border p-2">
                <span className={c.estadoDeuda === 'solvente' ? 'text-green-600' : 'text-red-600'}>
                  {c.estadoDeuda}
                </span>
              </td>
              <td className="border p-2">{c.forma_entrada ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}