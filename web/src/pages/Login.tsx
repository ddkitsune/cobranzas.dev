import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else nav('/')
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-20 max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <input className="w-full border p-2" type="email" placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="w-full border p-2" type="password" placeholder="Contraseña"
        value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full bg-blue-600 p-2 text-white" type="submit">Entrar</button>
    </form>
  )
}