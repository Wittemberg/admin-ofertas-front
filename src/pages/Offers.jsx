import { useState, useEffect } from 'react'
import { getOffers, createOffer, updateOffer, deleteOffer } from '../api/offers'
import api from '../api/axios'

function EditModal({ offer, onClose, onSave }) {
  const [form, setForm] = useState({
    product_id: offer?.product_id || offer?.product?.id || '',
    store_id: offer?.store_id || offer?.store?.id || '',
    price_from: offer?.price_from || '',
    price_to: offer?.price_to || '',
    starts_at: offer?.starts_at ? offer.starts_at.slice(0, 10) : '',
    ends_at: offer?.ends_at ? offer.ends_at.slice(0, 10) : '',
    is_featured: offer?.is_featured ?? false
  })
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [saving, setSaving] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    api.get('/products', { params: { limit: 100 } }).then(res => {
      const data = res.data || res
      setProducts(data.products || data)
    }).catch(console.error)
    api.get('/stores').then(res => {
      const data = res.data || res
      setStores(data.stores || data)
    }).catch(console.error)
  }, [])

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.barcode && p.barcode.includes(productSearch))
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product_id || !form.price_to) {
      alert('Produto e Preço Por são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price_from: form.price_from ? parseFloat(form.price_from) : null,
        price_to: parseFloat(form.price_to),
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null
      }
      if (offer?.id) {
        await updateOffer(offer.id, payload)
      } else {
        await createOffer(payload)
      }
      onSave()
    } catch {
      alert('Erro ao salvar oferta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {offer?.id ? 'Editar Oferta' : 'Nova Oferta'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Produto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
            <input type="text" placeholder="Buscar produto..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full p-2 border rounded mb-2 text-sm" />
            <select value={form.product_id}
              onChange={e => setForm({ ...form, product_id: e.target.value })}
              className="w-full p-3 border rounded" required
              size={Math.min(5, filteredProducts.length + 1)}>
              <option value="">Selecione um produto</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.barcode ? `(${p.barcode})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Loja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loja</label>
            <select value={form.store_id}
              onChange={e => setForm({ ...form, store_id: e.target.value })}
              className="w-full p-3 border rounded">
              <option value="">Todas as lojas</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Preços */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço De (R$)</label>
              <input type="number" step="0.01" min="0" placeholder="0,00"
                className="w-full p-3 border rounded"
                value={form.price_from}
                onChange={e => setForm({ ...form, price_from: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Por (R$) *</label>
              <input type="number" step="0.01" min="0.01" placeholder="0,00" required
                className="w-full p-3 border rounded"
                value={form.price_to}
                onChange={e => setForm({ ...form, price_to: e.target.value })} />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
              <input type="date"
                className="w-full p-3 border rounded"
                value={form.starts_at}
                onChange={e => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
              <input type="date"
                className="w-full p-3 border rounded"
                value={form.ends_at}
                onChange={e => setForm({ ...form, ends_at: e.target.value })} />
            </div>
          </div>

          {/* Destaque */}
          <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
            <input type="checkbox" checked={form.is_featured}
              onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
            <span className="text-sm text-gray-600">Oferta em destaque</span>
          </label>

          {/* Ações */}
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

export default function Offers() {
  const [offers, setOffers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingOffer, setEditingOffer] = useState(null)
  const limit = 20

  const fetchOffers = () => {
    getOffers({ page, limit, search: search || undefined })
      .then(res => {
        const data = res.data || res
        setOffers(data.offers || [])
        setTotal(data.total || 0)
      })
      .catch(console.error)
  }

  useEffect(() => { fetchOffers() }, [page, search])

  const handleSave = () => {
    setEditingOffer(null)
    fetchOffers()
  }

  const handleDelete = async (offer) => {
    if (!confirm(`Tem certeza que deseja excluir esta oferta de "${offer.product?.name}"?`)) return
    try {
      await deleteOffer(offer.id)
      fetchOffers()
    } catch {
      alert('Erro ao excluir oferta')
    }
  }

  const totalPages = Math.ceil(total / limit)

  const formatPrice = (value) => {
    const num = parseFloat(value)
    return isNaN(num) ? '-' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Ofertas ({total})</h1>
          <button onClick={() => setEditingOffer({})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Nova Oferta
          </button>
        </div>

        <input type="text" placeholder="Buscar por produto..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full p-3 border rounded-lg mb-4" />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Produto</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Loja</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">De</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Por</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Vigência</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Destaque</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{offer.product?.name}</div>
                    <div className="text-xs text-gray-400">{offer.product?.barcode}</div>
                  </td>
                  <td className="p-3 text-gray-600">{offer.store?.name || 'Todas'}</td>
                  <td className="p-3 text-gray-600">{formatPrice(offer.price_from)}</td>
                  <td className="p-3 font-semibold text-green-700">{formatPrice(offer.price_to)}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(offer.starts_at)} — {formatDate(offer.ends_at)}
                  </td>
                  <td className="p-3">
                    {offer.is_featured
                      ? <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">★ Destaque</span>
                      : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="p-3">
                    <button onClick={() => setEditingOffer(offer)}
                      className="text-blue-600 hover:text-blue-800 text-sm">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(offer)}
                      className="text-red-600 hover:text-red-800 text-sm ml-2">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">Nenhuma oferta encontrada</td></tr>
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

      {editingOffer !== null && (
        <EditModal
          offer={editingOffer?.id ? editingOffer : null}
          onClose={() => setEditingOffer(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}