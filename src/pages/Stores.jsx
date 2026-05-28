import { useEffect, useState } from 'react'
import { getStores, createStore, updateStore, deleteStore } from '../api/stores'
import { getErrorMessage } from '../api/errors'
import { ConfirmDialog, MessageBanner } from '../components/Feedback'

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function EditModal({ store, onClose, onSave }) {
  const [form, setForm] = useState({
    name: store?.name || '',
    slug: store?.slug || '',
    city: store?.city || '',
    state: store?.state || '',
    address: store?.address || '',
    phone: store?.phone || '',
    is_active: store?.is_active ?? true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!store?.id) {
      setForm(current => ({ ...current, slug: slugify(current.name) }))
    }
  }, [form.name, store?.id])

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (store?.id) {
        await updateStore(store.id, form)
      } else {
        await createStore(form)
      }
      onSave()
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao salvar filial'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-bold text-gray-900">
          {store?.id ? 'Editar filial' : 'Nova filial'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">Dados usados no painel, no site publico e nos pedidos.</p>

        <MessageBanner message={error ? { type: 'error', text: error } : null} className="mt-4" />

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Field label="Nome da filial" required>
            <input
              required
              value={form.name}
              onChange={event => updateField('name', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Slug" required>
            <input
              required
              value={form.slug}
              onChange={event => updateField('slug', slugify(event.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Cidade">
              <input
                value={form.city}
                onChange={event => updateField('city', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Estado">
              <input
                value={form.state}
                onChange={event => updateField('state', event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <Field label="Endereco">
            <input
              value={form.address}
              onChange={event => updateField('address', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Telefone">
            <input
              value={form.phone}
              onChange={event => updateField('phone', event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </Field>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={event => updateField('is_active', event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Filial ativa
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Stores() {
  const [stores, setStores] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingStore, setEditingStore] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [message, setMessage] = useState(null)
  const limit = 10

  const fetchStores = () => {
    getStores({ page, limit, search: search || undefined })
      .then(res => {
        const data = res.data || res
        setStores(data.stores || data)
        setTotal(data.total || data.length || 0)
      })
      .catch(err => setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar filiais') }))
  }

  useEffect(() => { fetchStores() }, [page, search])

  const handleSave = () => {
    setEditingStore(null)
    setMessage({ type: 'success', text: 'Filial salva com sucesso.' })
    fetchStores()
  }

  const handleDelete = async () => {
    if (!pendingDelete) return

    try {
      await deleteStore(pendingDelete.id)
      setMessage({ type: 'success', text: 'Filial excluida.' })
      setPendingDelete(null)
      fetchStores()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao excluir filial') })
      setPendingDelete(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Filiais ({total})</h1>
            <p className="mt-1 text-sm text-gray-500">Lojas disponiveis para ofertas, pedidos e relatorios.</p>
          </div>
          <button onClick={() => setEditingStore({})} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            + Nova Filial
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por filial..."
          value={search}
          onChange={event => { setSearch(event.target.value); setPage(1) }}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-3"
        />

        <MessageBanner message={message} className="mb-4" />

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full min-w-[780px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Nome</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Slug</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Cidade</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Estado</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Telefone</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-right text-sm font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{store.name}</td>
                  <td className="p-3 text-gray-600">{store.slug}</td>
                  <td className="p-3 text-gray-600">{store.city || '-'}</td>
                  <td className="p-3 text-gray-600">{store.state || '-'}</td>
                  <td className="p-3 text-gray-600">{store.phone || '-'}</td>
                  <td className="p-3">
                    {store.is_active
                      ? <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Ativo</span>
                      : <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Inativo</span>}
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditingStore(store)} className="text-sm text-blue-600 hover:text-blue-800">
                      Editar
                    </button>
                    <button onClick={() => setPendingDelete(store)} className="ml-3 text-sm text-red-600 hover:text-red-800">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-sm text-gray-400">Nenhuma filial encontrada.</td></tr>
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

      {editingStore !== null && (
        <EditModal store={editingStore?.id ? editingStore : null} onClose={() => setEditingStore(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir filial"
        message={`Tem certeza que deseja excluir "${pendingDelete?.name}"?`}
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
