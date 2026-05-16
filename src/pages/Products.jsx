import { useState, useEffect } from 'react'
import { getProducts } from '../api/products'

export default function Products() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 10

  useEffect(() => {
    getProducts({ page, limit, search: search || undefined })
      .then(res => {
        setProducts(res.data.products)
        setTotal(res.data.total)
      })
      .catch(console.error)
  }, [page, search])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <h1 className="text-2xl font-bold mb-6">Produtos ({total})</h1>

        <input
          type="text" placeholder="Buscar por produto..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Produto</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Código Interno</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Cód. Barras</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Categoria</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Unidade</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3 text-gray-600">{product.internal_code || '-'}</td>
                  <td className="p-3 text-gray-600">{product.barcode || '-'}</td>
                  <td className="p-3 text-gray-600">{product.category?.name || '-'}</td>
                  <td className="p-3 text-gray-600">{product.unit || '-'}</td>
                  <td className="p-3">
                    {product.is_active
                      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Ativo</span>
                      : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Inativo</span>}
                  </td>
                  <td className="p-3">
                    <span className="text-blue-600 text-sm">Editar</span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">Nenhum produto encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-600">{page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}