export type TipoCliente = {
  id: string
  name: string
  monthly_amount: number
  active: boolean
}

export type Cliente = {
  id: string
  nombre: string
  cedula: string
  telefono: string
  direccion: string | null
  forma_entrada: 'llave' | 'control' | null
  casa: string | null
  nota: string | null
  client_type_id: string | null
  active: boolean
}

export type Pago = {
  id: string
  client_id: string
  amount: number
  period: string
  method: string | null
  reference: string | null
  payment_date: string | null
  status: 'pendiente' | 'confirmado' | 'rechazado'
  submitted_at: string
  verified_at: string | null
  notes: string | null
}

export type EstadoDeuda = 'solvente' | 'en_deuda'

export type ClienteConTipo = Cliente & {
  tipo: TipoCliente | null
  montoMensual: number
  estadoDeuda: EstadoDeuda
}