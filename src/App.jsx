import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ImportCSV from './pages/ImportCSV'
import Offers from './pages/Offers'
import Products from './pages/Products'
import Stores from './pages/Stores'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import ApiKeys from './pages/ApiKeys'
import TenantSettings from './pages/TenantSettings'
import ChangePassword from './pages/ChangePassword'
import SuperAdminConfig from './pages/super-admin/SuperAdminConfig'
import SuperAdminAudit from './pages/super-admin/SuperAdminAudit'
import SuperAdminClients from './pages/super-admin/SuperAdminClients'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Carregando...</div>
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/importar" element={<ProtectedRoute><ImportCSV /></ProtectedRoute>} />
          <Route path="/ofertas" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
          <Route path="/produtos" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/filiais" element={<ProtectedRoute><Stores /></ProtectedRoute>} />
          <Route path="/categorias" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
          <Route path="/alterar-senha" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          {/* Rota canônica de configurações */}
          <Route path="/configuracoes" element={<ProtectedRoute><TenantSettings /></ProtectedRoute>} />
          
          {/* Redirecionamentos legados de branding para a aba correta */}
          <Route path="/branding" element={<Navigate to="/configuracoes?tab=branding" replace />} />
          <Route path="/branding/" element={<Navigate to="/configuracoes?tab=branding" replace />} />
          
          {/* Super Admin */}
          <Route path="/super-admin/configuracoes" element={<ProtectedRoute><SuperAdminConfig /></ProtectedRoute>} />
          <Route path="/super-admin/clientes" element={<ProtectedRoute><SuperAdminClients /></ProtectedRoute>} />
          <Route path="/super-admin/auditoria" element={<ProtectedRoute><SuperAdminAudit /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
