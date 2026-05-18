import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProducts } from '../api/products'
import { getStores } from '../api/stores'
import { getCategories } from '../api/categories'
import { getOffers } from '../api/offers'

export default function Dashboard() {
  const { user, setUser } = useAuth()
  const [stats, setStats] = useState({
    products: 0, stores: 0, categories: 0, offers: 0, featuredOffers: 0,
    offersByStore: [], productsByCategory: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProducts({ limit: 1 }),
      getStores(),
      getCategories({ limit: 1 }),
      getOffers({ limit: 200 })
    ]).then(([productsRes, storesRes, categoriesRes, offersRes]) => {
      const products = productsRes.data
      const stores = storesRes.data || storesRes
      const categories = categoriesRes.data
      const offers = offersRes.data

      const productList = products.products || []
      const offerList = offers.offers || []
      const categoryList = categories.categories || []

      const totalProducts = products.total || productList.length
      const totalStores = Array.isArray(stores) ? stores.length : (stores.stores || []).length
      const totalCategories = categories.total || categoryList.length
      const totalOffers = offers.total || offerList.length
      const featuredCount = offerList.filter(o => o.is_featured).length

      const storeCount = {}
      offerList.forEach(o => {
        const name = o.store?.name || 'Sem loja'
        storeCount[name] = (storeCount[name] || 0) + 1
      })
      const offersByStore = Object.entries(storeCount)
        .map(([store_name, count]) => ({ store_name, count }))
        .sort((a, b) => b.count - a.count)

      const catCount = { 'Sem categoria': 0 }
      productList.forEach(p => {
        const name = p.category?.name || 'Sem categoria'
        catCount[name] = (catCount[name] || 0) + 1
      })
      const productsByCategory = Object.entries(catCount)
        .map(([category_name, count]) => ({ category_name, count }))
        .sort((a, b) => b.count - a.count)

      setStats({
        products: totalProducts,
        stores: totalStores,
        categories: totalCategories,
        offers: totalOffers,
        featuredOffers: featuredCount,
        offersByStore,
        productsByCategory
      })
    }).catch(console.error)
    .finally(() => setLoading(false))
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
          <button onClick={logout}
            className="px-4 py-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50 text-sm">
            Sair
          </button>
        </div>

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
              <div className="text-xs text-yellow-600 mt-1">★ {stats.featuredOffers} em destaque</div>
            )}
          </a>
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <a href="/produtos"
            className="bg-blue-50 text-blue-700 rounded-lg p-4 text-center hover:bg-blue-100 transition">
            <div className="text-lg">📋</div>
            <div className="text-sm font-medium mt-1">Produtos</div>
          </a>
          <a href="/filiais"
            className="bg-green-50 text-green-700 rounded-lg p-4 text-center hover:bg-green-100 transition">
            <div className="text-lg">🏪</div>
            <div className="text-sm font-medium mt-1">Lojas</div>
          </a>
          <a href="/categorias"
            className="bg-yellow-50 text-yellow-700 rounded-lg p-4 text-center hover:bg-yellow-100 transition">
            <div className="text-lg">📁</div>
            <div className="text-sm font-medium mt-1">Categorias</div>
          </a>
          <a href="/ofertas"
            className="bg-purple-50 text-purple-700 rounded-lg p-4 text-center hover:bg-purple-100 transition">
            <div className="text-lg">🏷️</div>
            <div className="text-sm font-medium mt-1">Ofertas</div>
          </a>
          <a href="/importar"
            className="bg-orange-50 text-orange-700 rounded-lg p-4 text-center hover:bg-orange-100 transition">
            <div className="text-lg">📥</div>
            <div className="text-sm font-medium mt-1">Importar CSV</div>
          </a>
        </div>
      </div>
    </div>
  )
}