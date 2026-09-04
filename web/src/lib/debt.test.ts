import { describe, it, expect } from 'vitest'
import { esSolvente } from './debt'

describe('esSolvente', () => {
  it('es solvente si hay un pago confirmado del periodo actual', () => {
    const pagos = [
      { period: '2026-09', status: 'confirmado' },
      { period: '2026-08', status: 'confirmado' },
    ]
    expect(esSolvente(pagos, '2026-09')).toBe(true)
  })

  it('está en deuda si solo hay pagos pendientes del periodo actual', () => {
    const pagos = [{ period: '2026-09', status: 'pendiente' }]
    expect(esSolvente(pagos, '2026-09')).toBe(false)
  })

  it('está en deuda si no hay pago del periodo actual', () => {
    expect(esSolvente([], '2026-09')).toBe(false)
  })
})