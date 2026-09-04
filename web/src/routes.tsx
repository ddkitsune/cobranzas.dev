import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Login from './pages/Login'
import PaymentForm from './pages/PaymentForm'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import ClientTypes from './pages/ClientTypes'
import Payments from './pages/Payments'
import ImportExport from './pages/ImportExport'
import Billing from './pages/Billing'

export default function AppRoutes() {
  const { session } = useAuth()

  return (
    <Routes>
      {/* Ruta pública: formulario de pago del cliente */}
      <Route path="/pago/:token" element={<PaymentForm />} />

      {!session ? (
        <Route path="*" element={<Login />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/clientes/:id" element={<ClientDetail />} />
          <Route path="/tipos" element={<ClientTypes />} />
          <Route path="/pagos" element={<Payments />} />
          <Route path="/importar" element={<ImportExport />} />
          <Route path="/envios" element={<Billing />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}
    </Routes>
  )
}