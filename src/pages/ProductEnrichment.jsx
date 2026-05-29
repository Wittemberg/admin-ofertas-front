import { useEffect, useState } from 'react'
import {
  approveProductEnrichment,
  createManualProductEnrichment,
  getProductEnrichments,
  getProducts,
  rejectProductEnrichment,
  suggestProductEnrichment,
  updateProductEnrichment,
  webSearchProductEnrichment
} from '../api/products'
import { getErrorMessage } from '../api/errors'
import { MessageBanner } from '../components/Feedback'

const STATUS_LABELS = {
  pending: 'Pendente',
  suggested: 'Sugerido',
  approved: 'Aprovado',
  rejected: 'Recusado',
  manual: 'Manual'
}

const STATUS_CLASSES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  suggested: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  manual: 'bg-slate-50 text-slate-700 border-slate-200'
}

const OPEN_REVIEW_STATUSES = ['pending', 'suggested', 'manual']

export default function ProductEnrichment() {
  const [products, setProducts] = useState([])
  const [enrichments, setEnrichments] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [reviewSearch, setReviewSearch] = useState('')
  const [status, setStatus] = useState('open')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState(null)
  const [manualForms, setManualForms] = useState({})
  const [editForms, setEditForms] = useState({})

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const { data } = await getProducts({ limit: 12, search: productSearch || undefined })
      setProducts(data.products || [])
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar produtos') })
    } finally {
      setLoadingProducts(false)
    }
  }

  const loadEnrichments = async () => {
    setLoadingReview(true)
    try {
      const { data } = await getProductEnrichments({
        limit: 30,
        search: reviewSearch || undefined,
        status: status && status !== 'open' ? status : undefined
      })
      const items = status === 'open'
        ? (data.items || []).filter(item => OPEN_REVIEW_STATUSES.includes(item.status))
        : (data.items || [])
      setEnrichments(items)
      setEditForms(Object.fromEntries(items.map(item => [item.id, { image_url: item.image_url || '', notes: item.notes || '' }])))
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar sugestoes') })
    } finally {
      setLoadingReview(false)
    }
  }

  useEffect(() => { loadProducts() }, [])
  useEffect(() => { loadEnrichments() }, [status])

  const suggest = async (product) => {
    setBusy(`suggest-${product.id}`)
    setMessage(null)
    try {
      const { data } = await suggestProductEnrichment(product.id)
      setMessage({
        type: data.image_url ? 'success' : 'warning',
        text: data.image_url
          ? 'Sugestao criada para revisao.'
          : 'Nenhuma imagem confiavel encontrada. A sugestao ficou pendente.'
      })
      await loadEnrichments()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao buscar sugestao') })
    } finally {
      setBusy(null)
    }
  }

  const webSearch = async (product) => {
    setBusy(`web-${product.id}`)
    setMessage(null)
    try {
      const { data } = await webSearchProductEnrichment(product.id)
      const count = (data.items || []).filter(item => item.image_url).length
      setMessage({
        type: count ? 'success' : 'warning',
        text: count
          ? `${count} sugestao${count > 1 ? 'es' : ''} da web criada${count > 1 ? 's' : ''} para revisao.`
          : 'Nenhuma imagem encontrada na busca web. A sugestao ficou pendente.'
      })
      await loadEnrichments()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao buscar imagens na web') })
    } finally {
      setBusy(null)
    }
  }

  const createManual = async (product) => {
    const form = manualForms[product.id] || {}
    if (!form.image_url) {
      setMessage({ type: 'error', text: 'Informe uma URL de imagem para criar sugestao manual.' })
      return
    }

    setBusy(`manual-${product.id}`)
    setMessage(null)
    try {
      await createManualProductEnrichment(product.id, {
        image_url: form.image_url,
        source_url: form.image_url,
        notes: form.notes
      })
      setManualForms(current => ({ ...current, [product.id]: { image_url: '', notes: '' } }))
      setMessage({ type: 'success', text: 'Sugestao manual criada para revisao.' })
      await loadEnrichments()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao criar sugestao manual') })
    } finally {
      setBusy(null)
    }
  }

  const updateSuggestion = async (item) => {
    const form = editForms[item.id] || {}
    setBusy(`update-${item.id}`)
    setMessage(null)
    try {
      await updateProductEnrichment(item.id, { image_url: form.image_url, notes: form.notes })
      setMessage({ type: 'success', text: 'Sugestao atualizada.' })
      await loadEnrichments()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao atualizar sugestao') })
    } finally {
      setBusy(null)
    }
  }

  const approve = async (item) => {
    setBusy(`approve-${item.id}`)
    setMessage(null)
    try {
      await approveProductEnrichment(item.id)
      setMessage({ type: 'success', text: 'Imagem aprovada e aplicada ao produto.' })
      await Promise.all([loadEnrichments(), loadProducts()])
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao aprovar imagem') })
    } finally {
      setBusy(null)
    }
  }

  const reject = async (item) => {
    setBusy(`reject-${item.id}`)
    setMessage(null)
    try {
      const form = editForms[item.id] || {}
      await rejectProductEnrichment(item.id, { notes: form.notes })
      setEnrichments(current => current.filter(enrichment => enrichment.id !== item.id))
      setEditForms(current => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
      setMessage({ type: 'success', text: 'Sugestao recusada.' })
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao recusar sugestao') })
    } finally {
      setBusy(null)
    }
  }

  const updateManualForm = (productId, field, value) => {
    setManualForms(current => ({
      ...current,
      [productId]: { ...(current[productId] || {}), [field]: value }
    }))
  }

  const updateEditForm = (id, field, value) => {
    setEditForms(current => ({
      ...current,
      [id]: { ...(current[id] || {}), [field]: value }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">IA Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enriquecimento visual por barcode, nome e marca. Nada e publicado sem aprovacao.
          </p>
        </div>

        <MessageBanner message={message} className="mb-6" />

        <section className="mb-8 rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Solicitar sugestao</h2>
              <p className="mt-1 text-sm text-gray-500">Busque um produto e crie uma sugestao automatica ou manual.</p>
            </div>
            <form
              onSubmit={event => { event.preventDefault(); loadProducts() }}
              className="flex flex-wrap gap-2"
            >
              <input
                value={productSearch}
                onChange={event => setProductSearch(event.target.value)}
                placeholder="Produto, codigo ou barcode..."
                className="w-72 rounded-lg border px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Buscar
              </button>
            </form>
          </div>

          {loadingProducts ? (
            <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">Carregando produtos...</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {products.map(product => (
                <article key={product.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex gap-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-lg border object-contain" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-xs text-gray-400">Sem img</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.barcode || 'Sem barcode'}</p>
                      <p className="text-xs text-gray-400">{product.internal_code || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => suggest(product)}
                      disabled={!product.barcode || busy === `suggest-${product.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {busy === `suggest-${product.id}` ? 'Buscando...' : 'Fontes abertas'}
                    </button>
                    <button
                      type="button"
                      onClick={() => webSearch(product)}
                      disabled={busy === `web-${product.id}`}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      {busy === `web-${product.id}` ? 'Buscando...' : 'Buscar na web'}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <input
                      value={manualForms[product.id]?.image_url || ''}
                      onChange={event => updateManualForm(product.id, 'image_url', event.target.value)}
                      placeholder="URL manual da imagem"
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => createManual(product)}
                      disabled={busy === `manual-${product.id}`}
                      className="w-full rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Criar sugestao manual
                    </button>
                  </div>
                </article>
              ))}
              {products.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 lg:col-span-3">
                  Nenhum produto encontrado.
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Fila de revisao</h2>
              <p className="mt-1 text-sm text-gray-500">Aprove apenas imagens reais e confiaveis.</p>
            </div>
            <form
              onSubmit={event => { event.preventDefault(); loadEnrichments() }}
              className="flex flex-wrap gap-2"
            >
              <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                <option value="open">Em aberto</option>
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                value={reviewSearch}
                onChange={event => setReviewSearch(event.target.value)}
                placeholder="Buscar sugestao..."
                className="w-64 rounded-lg border px-3 py-2 text-sm"
              />
              <button className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Filtrar
              </button>
            </form>
          </div>

          {loadingReview ? (
            <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">Carregando sugestoes...</p>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {enrichments.map(item => (
                <article key={item.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex gap-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name || item.product?.name} className="h-28 w-28 rounded-lg border object-contain" />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed text-xs text-gray-400">Sem imagem</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[item.status] || STATUS_CLASSES.pending}`}>
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {item.confidence ? `${Number(item.confidence)}%` : '0%'}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate font-semibold text-gray-900">{item.product?.name || item.product_name || 'Produto sem nome'}</h3>
                      <p className="text-xs text-gray-500">Barcode: {item.barcode || '-'}</p>
                      <p className="text-xs text-gray-500">Fonte: {item.source}</p>
                      {item.brand && <p className="text-xs text-gray-500">Marca: {item.brand}</p>}
                      {item.category_suggested && <p className="text-xs text-gray-500">Categoria sugerida: {item.category_suggested}</p>}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px]">
                    <input
                      value={editForms[item.id]?.image_url || ''}
                      onChange={event => updateEditForm(item.id, 'image_url', event.target.value)}
                      placeholder="URL da imagem"
                      className="rounded-lg border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => updateSuggestion(item)}
                      disabled={busy === `update-${item.id}`}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Atualizar URL
                    </button>
                  </div>

                  <textarea
                    value={editForms[item.id]?.notes || ''}
                    onChange={event => updateEditForm(item.id, 'notes', event.target.value)}
                    placeholder="Observacao da revisao..."
                    className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
                    rows="2"
                  />

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noreferrer" className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Ver fonte
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => reject(item)}
                      disabled={busy === `reject-${item.id}` || item.status === 'rejected'}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Recusar
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(item)}
                      disabled={!item.image_url || busy === `approve-${item.id}` || item.status === 'approved'}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Aprovar e aplicar
                    </button>
                  </div>
                </article>
              ))}
              {enrichments.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400 xl:col-span-2">
                  Nenhuma sugestao encontrada.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
