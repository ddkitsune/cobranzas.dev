import type { EstadoDeuda } from './types'

export function esSolvente(
  pagos: { period: string; status: string }[],
  periodoActual: string
): boolean {
  return pagos.some(
    (p) => p.period === periodoActual && p.status === 'confirmado'
  )
}

export function estadoDeuda(
  pagos: { period: string; status: string }[],
  periodoActual: string
): EstadoDeuda {
  return esSolvente(pagos, periodoActual) ? 'solvente' : 'en_deuda'
}