import { useState, useEffect } from 'react'
import { getProducts, updateProduct } from '../api/products'

function EditModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    internal_code: product?.internal_code || '',
    barcode: product?.barcode || '',
    unit: product?.unit || '',
    description: product?.description || '',
    is_active: product?.is_active ?? true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProduct(product.id, form)
      onSave()
    } catch {
      alert('Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-bold mb-4">Editar Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Nome"
            className="w-full p-3 border rounded" required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Código Interno"
              className="p-3 border rounded"
              value={form.internal_code}
              onChange={e => setForm({ ...form, internal_code: e.target.value })} />
            <input type="text" placeholder="Cód. Barras"
              className="p-3 border rounded"
              value={form.barcode}
              onChange={e => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Unidade (UN, KG, etc)"
              className="p-3 border rounded"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })} />
            <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm text-gray-600">Ativo</span>
            </label>
          </div>
          <textarea placeholder="Descrição (opcional)"
            className="w-full p-3 border rounded"
            rows="3" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const limit = 10

  const fetchProducts = () => {
    getProducts({ page, limit, search: search || undefined })
      .then(res => {
        setProducts(res.data.products)
        setTotal(res.data.total)
      })
      .catch(console.error)
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleSave = () => {
    setEditingProduct(null)
    fetchProducts()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <h1 className="text-2xl font-bold mb-6">Produtos ({total})</h1>

        <input type="text" placeholder="Buscar por produto..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full p-3 border rounded-lg mb-4" />

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
                    <button onClick={() => setEditingProduct(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm">
                      Editar
                    </button>
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
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Anterior</button>
            <span className="px-4 py-2 text-gray-600">{page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Próximo</button>
          </div>
        )}
      </div>

      {editingProduct && (
        <EditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}