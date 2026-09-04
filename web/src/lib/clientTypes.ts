import { supabase } from './supabase'
import type { TipoCliente } from './types'

export async function listarTipos(): Promise<TipoCliente[]> {
  const { data, error } = await supabase
    .from('client_types').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function guardarTipo(tipo: Partial<TipoCliente> & { id?: string }) {
  if (tipo.id) {
    const { error } = await supabase.from('client_types')
      .update({ name: tipo.name, monthly_amount: tipo.monthly_amount, active: tipo.active })
      .eq('id', tipo.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('client_types')
      .insert({ name: tipo.name, monthly_amount: tipo.monthly_amount })
    if (error) throw error
  }
}

export async function eliminarTipo(id: string) {
  const { error } = await supabase.from('client_types').delete().eq('id', id)
  if (error) throw error
}