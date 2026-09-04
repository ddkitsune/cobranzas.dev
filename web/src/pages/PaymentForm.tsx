import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPagoPorToken, registrarPago, type PagoFormInfo } from '../lib/api'

export default function PaymentForm() {
  const { token } = useParams()
  const [info, setInfo] = useState<PagoFormInfo | null>(null)
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    getPagoPorToken(token).then(setInfo).catch((e) => setError(e.message))
  }, [token])

  async function enviar() {
    if (!token || !info) return
    try {
      await registrarPago({
        token, method, reference, payment_date: date, amount: info.amount,
      })
      setDone(true)
    } catch (e) { setError((e as Error).message) }
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>
  if (!info) return <p className="p-6">Cargando...</p>
  if (done) return <p className="p-6 text-green-600">¡Pago registrado! En breve el administrador lo verifica.</p>

  return (
    <div className="mx-auto mt-10 max-w-md space-y-3 p-4">
      <h1 className="text-2xl font-bold">Registrar pago</h1>
      <p>Cliente: {info.nombre}</p>
      <p>Periodo: {info.period} — Monto: {info.amount}</p>
      <select className="w-full border p-2" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="">Método de pago</option>
        <option value="Pago Móvil">Pago Móvil</option>
        <option value="Transferencia">Transferencia</option>
        <option value="Zelle">Zelle</option>
        <option value="Efectivo">Efectivo</option>
        <option value="Otro">Otro</option>
      </select>
      <input className="w-full border p-2" placeholder="Referencia" value={reference}
        onChange={(e) => setReference(e.target.value)} />
      <input className="w-full border p-2" type="date" value={date}
        onChange={(e) => setDate(e.target.value)} />
      <button className="w-full bg-blue-600 p-2 text-white" onClick={enviar}>Enviar pago</button>
    </div>
  )
}