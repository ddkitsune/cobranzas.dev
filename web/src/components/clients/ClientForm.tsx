import { useEffect, useState } from 'react'
import { guardarCliente } from '../../lib/clients'
import { listarTipos } from '../../lib/clientTypes'
import type { Cliente, TipoCliente } from '../../lib/types'

const VACIAS = {
  nombre: '', cedula: '', telefono: '', direccion: '',
  forma_entrada: '' as '' | 'llave' | 'control', casa: '', nota: '', client_type_id: '',
}

export default function ClientForm({ cliente, onGuardado }: {
  cliente?: Cliente | null, onGuardado: () => void
}) {
  const [f, setF] = useState(cliente ?? VACIAS)
  const [tipos, setTipos] = useState<TipoCliente[]>([])
  const [error, setError] = useState('')

  useEffect(() => { listarTipos().then(setTipos).catch(console.error) }, [])

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }))
  }

  async function guardar() {
    try {
      await guardarCliente({ id: cliente?.id, ...f, client_type_id: f.client_type_id || null })
      onGuardado()
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <input className="border p-2" placeholder="Nombre" value={f.nombre}
        onChange={(e) => set('nombre', e.target.value)} />
      <input className="border p-2" placeholder="Cédula" value={f.cedula}
        onChange={(e) => set('cedula', e.target.value)} />
      <input className="border p-2" placeholder="Teléfono" value={f.telefono}
        onChange={(e) => set('telefono', e.target.value)} />
      <input className="border p-2" placeholder="Dirección" value={f.direccion}
        onChange={(e) => set('direccion', e.target.value)} />
      <select className="border p-2" value={f.forma_entrada}
        onChange={(e) => set('forma_entrada', e.target.value)}>
        <option value="">Forma de entrada</option>
        <option value="llave">Llave</option>
        <option value="control">Control</option>
      </select>
      <input className="border p-2" placeholder="Casa" value={f.casa}
        onChange={(e) => set('casa', e.target.value)} />
      <select className="border p-2" value={f.client_type_id}
        onChange={(e) => set('client_type_id', e.target.value)}>
        <option value="">Tipo de cliente</option>
        {tipos.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input className="border p-2" placeholder="Nota" value={f.nota}
        onChange={(e) => set('nota', e.target.value)} />
      <div className="col-span-2">
        {error && <p className="text-red-600">{error}</p>}
        <button className="bg-blue-600 p-2 text-white" onClick={guardar}>Guardar</button>
      </div>
    </div>
  )
}