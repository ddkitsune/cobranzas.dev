import type { PagoDB } from './types'

export function respuestaDeuda(
  nombre: string, monto: number, pagos: PagoDB[], periodoActual: string
): string {
  const solvente = pagos.some((p) => p.period === periodoActual && p.status === 'confirmado')
  if (solvente) {
    return `Hola ${nombre}, estas solvente este mes. Gracias!`
  }
  const pendiente = pagos.some((p) => p.period === periodoActual && p.status === 'pendiente')
  if (pendiente) {
    return `Hola ${nombre}, registramos tu pago de este mes y esta en verificacion.`
  }
  return `Hola ${nombre}, tu cuota de ${monto} del mes esta pendiente. Enviaremos el formulario de pago.`
}