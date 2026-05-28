import { useEffect, useState } from 'react'
import { getOffers, createOffer, updateOffer, deleteOffer } from '../api/offers'
import api from '../api/axios'
import { getErrorMessage } from '../api/errors'
import { ConfirmDialog, MessageBanner } from '../components/Feedback'

const parseMoney = (value) => {
  if (value === undefined || value === null || value === '') return null
  const normalized = Number(String(value).replace(',', '.'))
  return Number.isFinite(normalized) ? normalized : NaN
}

const toDateIso = (value) => value ? `${value}T12:00:00.000Z` : null

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
  const [message, setMessage] = useState(null)

  useEffect(() => {
    api.get('/products', { params: { limit: 100 } }).then(res => {
      const data = res.data || res
      setProducts(data.products || data)
    }).catch(err => setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar produtos') }))

    api.get('/stores').then(res => {
      const data = res.data || res
      setStores(data.stores || data)
    }).catch(err => setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar filiais') }))
  }, [])

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.barcode && product.barcode.includes(productSearch))
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (!form.product_id || !form.price_to) {
      setMessage({ type: 'error', text: 'Produto e Preco Por sao obrigatorios.' })
      return
    }

    setSaving(true)
    try {
      const priceFrom = parseMoney(form.price_from)
      const priceTo = parseMoney(form.price_to)
      if (Number.isNaN(priceFrom) || Number.isNaN(priceTo) || priceTo <= 0) {
        setMessage({ type: 'error', text: 'Informe valores validos para os precos.' })
        return
      }

      const payload = {
        ...form,
        store_id: form.store_id || null,
        price_from: priceFrom,
        price_to: priceTo,
        starts_at: toDateIso(form.starts_at),
        ends_at: toDateIso(form.ends_at)
      }

      const res = offer?.id ? await updateOffer(offer.id, payload) : await createOffer(payload)
      onSave(res.data || res)
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao salvar oferta') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900">{offer?.id ? 'Editar oferta' : 'Nova oferta'}</h2>
        <p className="mt-1 text-sm text-gray-500">Oferta exibida no site publico e usada no carrinho.</p>

        <MessageBanner message={message} className="mt-4" />

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Field label="Produto" required>
            <input
              type="text"
              placeholder="Buscar produto por nome ou codigo..."
              value={productSearch}
              onChange={event => setProductSearch(event.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={form.product_id}
              onChange={event => updateField('product_id', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
              size={Math.min(5, filteredProducts.length + 1)}
            >
              <option value="">Selecione um produto</option>
              {filteredProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.barcode ? `(${product.barcode})` : ''}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Loja">
            <select value={form.store_id} onChange={event => updateField('store_id', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Todas as lojas</option>
              {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preco De (R$)">
              <input type="text" inputMode="decimal" placeholder="0,00" value={form.price_from} onChange={event => updateField('price_from', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Preco Por (R$)" required>
              <input type="text" inputMode="decimal" placeholder="0,00" required value={form.price_to} onChange={event => updateField('price_to', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inicio">
              <input type="date" value={form.starts_at} onChange={event => updateField('starts_at', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Fim">
              <input type="date" value={form.ends_at} onChange={event => updateField('ends_at', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.is_featured} onChange={event => updateField('is_featured', event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Oferta em destaque
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
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
  const [pendingDelete, setPendingDelete] = useState(null)
  const [message, setMessage] = useState(null)
  const limit = 20

  const fetchOffers = async () => {
    try {
      const res = await getOffers({ page, limit, search: search || undefined, t: Date.now() })
      const data = res.data || res
      setOffers(data.offers || [])
      setTotal(data.total || 0)
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar ofertas') })
    }
  }

  useEffect(() => { fetchOffers() }, [page, search])

  const handleSave = (savedOffer) => {
    setEditingOffer(null)
    setMessage({ type: 'success', text: 'Oferta salva com sucesso.' })
    if (savedOffer?.id) {
      setOffers(current => {
        const exists = current.some(offer => offer.id === savedOffer.id)
        if (exists) return current.map(offer => offer.id === savedOffer.id ? savedOffer : offer)
        return [savedOffer, ...current]
      })
    }
    fetchOffers()
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteOffer(pendingDelete.id)
      setMessage({ type: 'success', text: 'Oferta excluida.' })
      setPendingDelete(null)
      fetchOffers()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao excluir oferta') })
      setPendingDelete(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const formatPrice = (value) => {
    const num = parseFloat(value)
    return isNaN(num) ? '-' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const [datePart] = String(dateStr).split('T')
    const [year, month, day] = datePart.split('-')
    if (!year || !month || !day) return '-'
    return `${day}/${month}/${year}`
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Ofertas ({total})</h1>
            <p className="mt-1 text-sm text-gray-500">Promocoes vigentes exibidas no site publico.</p>
          </div>
          <button onClick={() => setEditingOffer({})} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            + Nova Oferta
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por produto..."
          value={search}
          onChange={event => { setSearch(event.target.value); setPage(1) }}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3"
        />

        <MessageBanner message={message} className="mb-4" />

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Loja</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">De</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Por</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Vigencia</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Destaque</th>
                <th className="p-3 text-right text-sm font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(offer => (
                <tr key={offer.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{offer.product?.name}</div>
                    <div className="text-xs text-gray-400">{offer.product?.barcode}</div>
                  </td>
                  <td className="p-3 text-gray-600">{offer.store?.name || 'Todas'}</td>
                  <td className="p-3 text-gray-600">{formatPrice(offer.price_from)}</td>
                  <td className="p-3 font-semibold text-green-700">{formatPrice(offer.price_to)}</td>
                  <td className="p-3 text-sm text-gray-500">{formatDate(offer.starts_at)} - {formatDate(offer.ends_at)}</td>
                  <td className="p-3">
                    {offer.is_featured
                      ? <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">Destaque</span>
                      : <span className="text-xs text-gray-400">-</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditingOffer(offer)} className="text-sm text-blue-600 hover:text-blue-800">Editar</button>
                    <button onClick={() => setPendingDelete(offer)} className="ml-3 text-sm text-red-600 hover:text-red-800">Excluir</button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-sm text-gray-400">Nenhuma oferta encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50">Anterior</button>
            <span className="px-4 py-2 text-gray-600">{page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-50">Proximo</button>
          </div>
        )}
      </div>

      {editingOffer !== null && <EditModal offer={editingOffer?.id ? editingOffer : null} onClose={() => setEditingOffer(null)} onSave={handleSave} />}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir oferta"
        message={`Tem certeza que deseja excluir a oferta de "${pendingDelete?.product?.name}"?`}
        confirmLabel="Excluir"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  )
}
