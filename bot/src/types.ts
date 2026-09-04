export type ClienteDB = {
  id: string
  nombre: string
  telefono: string
  client_type_id: string | null
  client_types?: { name: string; monthly_amount: number } | null
}

export type PagoDB = { period: string; status: string }