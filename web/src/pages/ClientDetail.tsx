import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ClientForm from '../components/clients/ClientForm'
import type { Cliente } from '../lib/types'

export default function ClientDetail() {
  const { id } = useParams()
  const [cliente, setCliente] = useState<Cliente | null>(null)

  async function cargar() {
    if (!id) return
    const { data } = await supabase.from('clients').select('*').eq('id', id).single()
    setCliente(data)
  }
  useEffect(() => { cargar() }, [id])

  return (
    <div className="p-6">
      <Link to="/clientes" className="text-blue-600">← Clientes</Link>
      <h1 className="my-4 text-2xl font-bold">{cliente?.nombre}</h1>
      <ClientForm cliente={cliente} onGuardado={cargar} />
    </div>
  )
}