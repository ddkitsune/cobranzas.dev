import { supabase } from './supabase'
import type { Cliente, ClienteConTipo } from './types'
import { estadoDeuda } from './debt'
import { periodoActual } from './period'

export async function listarClientes(): Promise<ClienteConTipo[]> {
  const { data, error } = await supabase
    .from('clients').select('*, client_types(*)').order('nombre')
  if (error) throw error
  const pagos = await listarPagosConfirmados()
  const periodo = periodoActual()
  return (data ?? []).map((c: any) => ({
    ...c,
    tipo: c.client_types ?? null,
    montoMensual: c.client_types?.monthly_amount ?? 0,
    estadoDeuda: estadoDeuda(pagos[c.id] ?? [], periodo),
  }))
}

async function listarPagosConfirmados(): Promise<Record<string, { period: string; status: string }[]>> {
  const { data, error } = await supabase.from('payments').select('client_id, period, status')
  if (error) throw error
  const map: Record<string, { period: string; status: string }[]> = {}
  for (const p of data ?? []) {
    (map[p.client_id] ??= []).push({ period: p.period, status: p.status })
  }
  return map
}

export async function guardarCliente(c: Partial<Cliente> & { id?: string }) {
  const payload = {
    nombre: c.nombre, cedula: c.cedula, telefono: c.telefono,
    direccion: c.direccion, forma_entrada: c.forma_entrada, casa: c.casa,
    nota: c.nota, client_type_id: c.client_type_id,
  }
  if (c.id) {
    const { error } = await supabase.from('clients').update(payload).eq('id', c.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('clients').insert(payload)
    if (error) throw error
  }
}

export async function desactivarCliente(id: string) {
  const { error } = await supabase.from('clients').update({ active: false }).eq('id', id)
  if (error) throw error
}

export async function verificarPago(id: string, status: 'confirmado' | 'rechazado') {
  const { error } = await supabase.from('payments')
    .update({ status, verified_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}