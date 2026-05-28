import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDashboardMetrics } from '../api/dashboard'
import { getErrorMessage } from '../api/errors'
import { canAccess } from '../auth/permissions'

const DEFAULT_ORDER_METRICS = {
  carts_active_now: 0,
  carts_abandoned_today: 0,
  orders_today: 0,
  orders_pending_now: 0,
  orders_processing_now: 0,
  orders_completed_today: 0,
  orders_cancelled_today: 0,
  carts_started_today: 0,
  conversion_rate: 0,
  latest_orders: [],
  top_order_items: []
}

const DASHBOARD_LINKS = [
  { href: '/produtos', label: 'Produtos', tag: 'Produtos', roles: ['admin', 'editor'], className: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { href: '/produtos/ia', label: 'IA Produtos', tag: 'IA', roles: ['admin', 'editor'], className: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100' },
  { href: '/filiais', label: 'Lojas', tag: 'Lojas', roles: ['admin', 'editor'], className: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { href: '/categorias', label: 'Categorias', tag: 'Categorias', roles: ['admin', 'editor'], className: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { href: '/ofertas', label: 'Ofertas', tag: 'Ofertas', roles: ['admin', 'editor'], className: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { href: '/pedidos', label: 'Pedidos', tag: 'Pedidos', roles: ['admin', 'operator'], className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { href: '/atendimento', label: 'Atendimento', tag: 'Pedidos', roles: ['admin', 'operator'], className: 'bg-lime-50 text-lime-700 hover:bg-lime-100' },
  { href: '/relatorios', label: 'Relatorios', tag: 'Relatorios', roles: ['admin', 'editor', 'operator', 'viewer'], className: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
  { href: '/api-keys', label: 'API Keys', tag: 'Chaves', roles: ['admin'], className: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { href: '/usuarios', label: 'Usuarios', tag: 'Acessos', roles: ['admin'], className: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
  { href: '/alterar-senha', label: 'Alterar Senha', tag: 'Senha', roles: [], className: 'bg-sky-50 text-sky-700 hover:bg-sky-100' },
  { href: '/importar', label: 'Importar CSV', tag: 'Importar', roles: ['admin', 'editor'], className: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { href: '/configuracoes', label: 'Configuracoes', tag: 'Config', roles: ['admin'], className: 'bg-slate-50 text-slate-700 hover:bg-slate-100' }
]

export default function Dashboard() {
  const { user, setUser } = useAuth()
  const [stats, setStats] = useState({
    products: 0,
    stores: 0,
    categories: 0,
    offers: 0,
    featuredOffers: 0,
    offersByStore: [],
    productsByCategory: [],
    ordersMetrics: DEFAULT_ORDER_METRICS
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getDashboardMetrics().then(({ data }) => {
      setStats({
        products: data.products || 0,
        stores: data.stores || 0,
        categories: data.categories || 0,
        offers: data.offers || 0,
        featuredOffers: data.featuredOffers || 0,
        offersByStore: data.offers_by_store || [],
        productsByCategory: data.products_by_category || [],
        ordersMetrics: data.orders_metrics || DEFAULT_ORDER_METRICS
      })
    }).catch(err => {
      console.error(err)
      setError(getErrorMessage(err, 'Erro ao carregar dashboard'))
    }).finally(() => setLoading(false))
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const maxStoreOffers = Math.max(...stats.offersByStore.map(s => s.count), 1)
  const maxCatProducts = Math.max(...stats.productsByCategory.map(c => c.count), 1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.email && `Bem-vindo, ${user.email}`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={logout}
              className="px-4 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
              Sair
            </button>
            {user?.role === 'superadmin' && (
              <a href="/super-admin/configuracoes" className="text-sm text-blue-600 hover:underline">
                Super Admin
              </a>
            )}
          </div>
        </div>

        <DashboardLinks user={user} />

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <a href="/produtos" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl font-bold text-blue-600">{stats.products}</div>
            <div className="text-gray-500 text-sm mt-1">Produtos</div>
          </a>
          <a href="/filiais" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl font-bold text-green-600">{stats.stores}</div>
            <div className="text-gray-500 text-sm mt-1">Lojas</div>
          </a>
          <a href="/categorias" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl font-bold text-yellow-600">{stats.categories}</div>
            <div className="text-gray-500 text-sm mt-1">Categorias</div>
          </a>
          <a href="/ofertas" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl font-bold text-purple-600">{stats.offers}</div>
            <div className="text-gray-500 text-sm mt-1">Ofertas ativas</div>
            {stats.featuredOffers > 0 && (
              <div className="text-xs text-yellow-600 mt-1">{stats.featuredOffers} em destaque</div>
            )}
          </a>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Pedidos e listas</h2>
              <p className="text-sm text-gray-500">
                Carrinhos sem atividade por {stats.ordersMetrics.cart_abandonment_minutes || 30} minutos entram como abandonados.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Atualiza ao recarregar o dashboard</span>
          </div>
          {stats.ordersMetrics?.error && (
            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              {stats.ordersMetrics.error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Carrinhos ativos agora" value={stats.ordersMetrics.carts_active_now || 0} color="text-blue-600" />
            <Metric label="Carrinhos abandonados hoje" value={stats.ordersMetrics.carts_abandoned_today || 0} color="text-orange-600" />
            <Metric label="Pedidos hoje" value={stats.ordersMetrics.orders_today || 0} color="text-emerald-600" />
            <Metric label="Conversao hoje" value={`${stats.ordersMetrics.conversion_rate || 0}%`} color="text-purple-600" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Pendentes agora" value={stats.ordersMetrics.orders_pending_now || 0} color="text-yellow-600" />
            <Metric label="Em atendimento agora" value={stats.ordersMetrics.orders_processing_now || 0} color="text-blue-600" />
            <Metric label="Concluidos hoje" value={stats.ordersMetrics.orders_completed_today || 0} color="text-emerald-600" />
            <Metric label="Cancelados hoje" value={stats.ordersMetrics.orders_cancelled_today || 0} color="text-red-600" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Ultimos pedidos</h3>
              {(stats.ordersMetrics.latest_orders || []).length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum pedido recente.</p>
              ) : (
                <div className="space-y-2">
                  {stats.ordersMetrics.latest_orders.map(order => (
                    <div key={order.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-gray-900">{order.customer_name}</span>
                        <span className="text-gray-500">{order.status}</span>
                      </div>
                      <div className="text-gray-500">{order.customer_phone}{order.store_name ? ` - ${order.store_name}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Produtos mais pedidos hoje</h3>
              {(stats.ordersMetrics.top_order_items || []).length === 0 ? (
                <p className="text-sm text-gray-400">Ainda sem itens em pedidos hoje.</p>
              ) : (
                <div className="space-y-2">
                  {stats.ordersMetrics.top_order_items.map(item => (
                    <div key={item.product_name} className="flex justify-between rounded-lg border border-gray-100 p-3 text-sm">
                      <span className="text-gray-700">{item.product_name}</span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Ofertas por Loja</h2>
            {stats.offersByStore.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma oferta cadastrada</p>
            ) : (
              <div className="space-y-3">
                {stats.offersByStore.map(item => (
                  <div key={item.store_name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.store_name}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: (item.count / maxStoreOffers) * 100 + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Produtos por Categoria</h2>
            {stats.productsByCategory.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum produto cadastrado</p>
            ) : (
              <div className="space-y-3">
                {stats.productsByCategory.map(item => (
                  <div key={item.category_name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.category_name}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: (item.count / maxCatProducts) * 100 + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardLinks({ user }) {
  const links = DASHBOARD_LINKS.filter(link => canAccess(user, link.roles))
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {links.map(link => (
        <a key={link.href} href={link.href}
          className={`${link.className} rounded-lg p-4 text-center transition`}>
          <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{link.tag}</div>
          <div className="text-sm font-medium mt-1">{link.label}</div>
        </a>
      ))}
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  )
}
