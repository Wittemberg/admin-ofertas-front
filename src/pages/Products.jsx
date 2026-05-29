import { useEffect, useState } from 'react'
import { getProducts, updateProduct, uploadProductImage } from '../api/products'
import { getErrorMessage } from '../api/errors'
import { MessageBanner } from '../components/Feedback'

function ImagePreview({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative" onClick={event => event.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:text-gray-900"
          type="button"
        >
          x
        </button>
        <img src={url} alt="Preview do produto" className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white object-contain shadow" />
      </div>
    </div>
  )
}

function EditModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    internal_code: product?.internal_code || '',
    barcode: product?.barcode || '',
    unit: product?.unit || '',
    description: product?.description || '',
    image_url: product?.image_url || '',
    is_active: product?.is_active ?? true
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await updateProduct(product.id, form)
      onSave()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao salvar produto') })
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !product?.id) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no maximo 5MB.' })
      return
    }

    setUploading(true)
    setMessage(null)
    try {
      const res = await uploadProductImage(product.id, file)
      updateField('image_url', res.data.image_url)
      setMessage({ type: 'success', text: 'Imagem enviada com sucesso.' })
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao enviar imagem') })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900">Editar produto</h2>
        <p className="mt-1 text-sm text-gray-500">Cadastro base usado em ofertas, pedidos e relatorios.</p>

        <MessageBanner message={message} className="mt-4" />

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Field label="Nome" required>
            <input required value={form.name} onChange={event => updateField('name', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Codigo interno">
              <input value={form.internal_code} onChange={event => updateField('internal_code', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
            <Field label="Codigo de barras">
              <input value={form.barcode} onChange={event => updateField('barcode', event.target.value)} placeholder="Opcional para produtos pesaveis" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Unidade">
              <input value={form.unit} onChange={event => updateField('unit', event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </Field>
            <label className="mt-6 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.is_active} onChange={event => updateField('is_active', event.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Produto ativo
            </label>
          </div>

          <Field label="Descricao">
            <textarea value={form.description} onChange={event => updateField('description', event.target.value)} rows="3" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </Field>

          <section className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Imagem do produto</h3>
            <p className="mt-1 text-xs text-gray-500">Preferir imagem real do produto. Imagens geradas devem ficar para fallback futuro.</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {form.image_url ? (
                <img src={form.image_url} alt="Preview do produto" className="h-24 w-24 rounded-lg border bg-white object-contain" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">Sem imagem</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {uploading && <p className="mt-2 text-sm text-blue-600">Enviando...</p>}
          </section>

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

export default function Products() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [message, setMessage] = useState(null)
  const limit = 10

  const fetchProducts = () => {
    getProducts({ page, limit, search: search || undefined })
      .then(res => {
        setProducts(res.data.products || [])
        setTotal(res.data.total || 0)
      })
      .catch(err => setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar produtos') }))
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleSave = () => {
    setEditingProduct(null)
    setMessage({ type: 'success', text: 'Produto salvo com sucesso.' })
    fetchProducts()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Produtos ({total})</h1>
          <p className="mt-1 text-sm text-gray-500">Catalogo usado para ofertas, carrinho e futuras rotinas de IA.</p>
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
          <table className="w-full min-w-[920px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Produto</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Imagem</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Codigo Interno</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Cod. Barras</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Categoria</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Unidade</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-right text-sm font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{product.name}</td>
                  <td className="p-3">
                    {product.image_url ? (
                      <button onClick={() => setPreviewImage(product.image_url)} className="text-sm text-blue-600 hover:text-blue-800">Ver imagem</button>
                    ) : (
                      <span className="text-sm text-gray-300">Sem imagem</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{product.internal_code || '-'}</td>
                  <td className="p-3 text-gray-600">{product.barcode || '-'}</td>
                  <td className="p-3 text-gray-600">{product.category?.name || '-'}</td>
                  <td className="p-3 text-gray-600">{product.unit || '-'}</td>
                  <td className="p-3">
                    {product.is_active
                      ? <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Ativo</span>
                      : <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Inativo</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditingProduct(product)} className="text-sm text-blue-600 hover:text-blue-800">Editar</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="8" className="p-8 text-center text-sm text-gray-400">Nenhum produto encontrado.</td></tr>
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

      {editingProduct && <EditModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSave} />}
      {previewImage && <ImagePreview url={previewImage} onClose={() => setPreviewImage(null)} />}
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
