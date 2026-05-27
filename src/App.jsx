import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Health from './pages/Health'
import Dashboard from './pages/Dashboard'
import ImportCSV from './pages/ImportCSV'
import Offers from './pages/Offers'
import Orders from './pages/Orders'
import OrderDesk from './pages/OrderDesk'
import Products from './pages/Products'
import Stores from './pages/Stores'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import ApiKeys from './pages/ApiKeys'
import Users from './pages/Users'
import TenantSettings from './pages/TenantSettings'
import ChangePassword from './pages/ChangePassword'
import { canAccess } from './auth/permissions'
import SuperAdminConfig from './pages/super-admin/SuperAdminConfig'
import SuperAdminAudit from './pages/super-admin/SuperAdminAudit'
import SuperAdminClients from './pages/super-admin/SuperAdminClients'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Carregando...</div>
  return user ? children : <Navigate to="/login" />
}

function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Carregando...</div>
  if (!user) return <Navigate to="/login" />
  return canAccess(user, roles) ? children : <Navigate to="/" />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
          <Route path="/redefinir-senha" element={<ResetPassword />} />
          <Route path="/health" element={<Health />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/importar" element={<RoleRoute roles={['admin', 'editor']}><ImportCSV /></RoleRoute>} />
          <Route path="/ofertas" element={<RoleRoute roles={['admin', 'editor']}><Offers /></RoleRoute>} />
          <Route path="/pedidos" element={<RoleRoute roles={['admin', 'operator']}><Orders /></RoleRoute>} />
          <Route path="/atendimento" element={<RoleRoute roles={['admin', 'operator']}><OrderDesk /></RoleRoute>} />
          <Route path="/produtos" element={<RoleRoute roles={['admin', 'editor']}><Products /></RoleRoute>} />
          <Route path="/filiais" element={<RoleRoute roles={['admin', 'editor']}><Stores /></RoleRoute>} />
          <Route path="/categorias" element={<RoleRoute roles={['admin', 'editor']}><Categories /></RoleRoute>} />
          <Route path="/relatorios" element={<RoleRoute roles={['admin', 'editor', 'operator', 'viewer']}><Reports /></RoleRoute>} />
          <Route path="/api-keys" element={<RoleRoute roles={['admin']}><ApiKeys /></RoleRoute>} />
          <Route path="/usuarios" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
          <Route path="/alterar-senha" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          {/* Rota canônica de configurações */}
          <Route path="/configuracoes" element={<RoleRoute roles={['admin']}><TenantSettings /></RoleRoute>} />
          
          {/* Redirecionamentos legados de branding para a aba correta */}
          <Route path="/branding" element={<Navigate to="/configuracoes?tab=branding" replace />} />
          <Route path="/branding/" element={<Navigate to="/configuracoes?tab=branding" replace />} />
          
          {/* Super Admin */}
          <Route path="/super-admin/configuracoes" element={<RoleRoute roles={['superadmin']}><SuperAdminConfig /></RoleRoute>} />
          <Route path="/super-admin/clientes" element={<RoleRoute roles={['superadmin']}><SuperAdminClients /></RoleRoute>} />
          <Route path="/super-admin/auditoria" element={<RoleRoute roles={['superadmin']}><SuperAdminAudit /></RoleRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
