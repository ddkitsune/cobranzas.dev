import * as XLSX from 'xlsx'
import type { Cliente } from './types'

export type FilaExcel = {
  Nombre?: string; Cédula?: string; Teléfono?: string; Dirección?: string
  Entrada?: string; Casa?: string; Nota?: string; 'Tipo de cliente'?: string
}

export function parseClientesExcel(filas: FilaExcel[]): Partial<Cliente>[] {
  return filas.map((f) => ({
    nombre: f.Nombre ?? '',
    cedula: f.Cédula ?? '',
    telefono: String(f.Teléfono ?? '').replace(/[^0-9]/g, ''),
    direccion: f.Dirección ?? '',
    forma_entrada: (f.Entrada ?? '').toLowerCase() === 'control' ? 'control' : 'llave',
    casa: f.Casa ?? '',
    nota: f.Nota ?? '',
  }))
}

export function clientesAExcel(clientes: Partial<Cliente>[]) {
  const filas = clientes.map((c) => ({
    Nombre: c.nombre, Cédula: c.cedula, Teléfono: c.telefono, Dirección: c.direccion,
    Entrada: c.forma_entrada, Casa: c.casa, Nota: c.nota,
  }))
  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
  return wb
}