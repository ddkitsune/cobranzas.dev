import { describe, it, expect } from 'vitest'
import { respuestaDeuda } from './chatbot'

const pagos = [{ period: '2026-09', status: 'confirmado' }]

describe('respuestaDeuda', () => {
  it('indica solvente si hay pago confirmado del periodo', () => {
    const r = respuestaDeuda('Ana', 30, pagos, '2026-09')
    expect(r).toContain('solvente')
  })

  it('indica en verificacion si hay pago pendiente', () => {
    const r = respuestaDeuda('Ana', 30, [{ period: '2026-09', status: 'pendiente' }], '2026-09')
    expect(r).toContain('verificacion')
  })

  it('indica deuda con monto si no hay pago', () => {
    const r = respuestaDeuda('Ana', 30, [], '2026-09')
    expect(r).toContain('pendiente')
    expect(r).toContain('30')
  })
})