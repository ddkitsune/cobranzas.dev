import type { Pago, EstadoDeuda } from './types'

export function esSolvente(
  pagos: Pick<Pago, 'period' | 'status'>[],
  periodoActual: string
): boolean {
  return pagos.some(
    (p) => p.period === periodoActual && p.status === 'confirmado'
  )
}

export function estadoDeuda(
  pagos: Pick<Pago, 'period' | 'status'>[],
  periodoActual: string
): EstadoDeuda {
  return esSolvente(pagos, periodoActual) ? 'solvente' : 'en_deuda'
}