import { describe, it, expect } from 'vitest'
import { parseClientesExcel, clientesAExcel } from './excel'

const filas = [
  { Nombre: 'Ana Pérez', Cédula: 'V-123', Teléfono: '584121111111',
    Dirección: 'Casa 1', Entrada: 'llave', Casa: 'A1', Nota: 'ok' },
]

describe('parseClientesExcel', () => {
  it('mapea las columnas esperadas', () => {
    const res = parseClientesExcel(filas)
    expect(res[0].nombre).toBe('Ana Pérez')
    expect(res[0].cedula).toBe('V-123')
    expect(res[0].telefono).toBe('584121111111')
    expect(res[0].forma_entrada).toBe('llave')
  })

  it('interpreta Entrada=control como control', () => {
    const res = parseClientesExcel([{ ...filas[0], Entrada: 'Control' }])
    expect(res[0].forma_entrada).toBe('control')
  })

  it('limpia caracteres no numéricos del teléfono', () => {
    const res = parseClientesExcel([{ ...filas[0], Teléfono: '+58 412-1111111' }])
    expect(res[0].telefono).toBe('584121111111')
  })
})

describe('clientesAExcel', () => {
  it('devuelve un libro con una hoja', () => {
    const wb = clientesAExcel([{ nombre: 'Ana', cedula: 'V-1' } as never])
    expect(wb.SheetNames.length).toBe(1)
    expect(wb.SheetNames[0]).toBe('Clientes')
  })
})