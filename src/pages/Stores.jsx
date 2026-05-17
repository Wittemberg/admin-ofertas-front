import { useState, useEffect } from 'react'
import { getStores, createStore, updateStore, deleteStore } from '../api/stores'

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

  useEffect(() => {
    if (!store) {
      const slugCandidate = form.name
        .toLowerCase()
        .replace(/[^a-z0-9à-ÿ]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setForm(prev => ({
        ...prev,
        slug: slugCandidate
      }))
    }
  }, [form.name])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (store?.id) {
        await updateStore(store.id, form)
      } else {
        await createStore(form)
      }
      onSave()
    } catch {
      alert('Erro ao salvar filial')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-bold mb-4">
          {store ? 'Editar Filial' : 'Nova Filial'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Nome da filial"
            className="w-full p-3 border rounded" required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="text" placeholder="slug-da-filial"
            className="w-full p-3 border rounded" required
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Cidade"
              className="p-3 border rounded"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })} />
            <input type="text" placeholder="Estado"
              className="p-3 border rounded"
              value={form.state}
              onChange={e => setForm({ ...form, state: e.target.value })} />
          </div>
          <input type="text" placeholder="Endereço"
            className="w-full p-3 border rounded"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })} />
          <input type="text" placeholder="Telefone"
            className="w-full p-3 border rounded"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })} />
          <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            <span className="text-sm text-gray-600">Ativo</span>
          </label>
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

export default function Stores() {
  const [stores, setStores] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editingStore, setEditingStore] = useState(null)
  const limit = 10

  const fetchStores = () => {
    getStores({ page, limit, search: search || undefined })
      .then(res => {
        const data = res.data || res
        setStores(data.stores || data)
        setTotal(data.total || data.length || 0)
      })
      .catch(console.error)
  }

  useEffect(() => { fetchStores() }, [page, search])

  const handleSave = () => {
    setEditingStore(null)
    fetchStores()
  }

  const handleDelete = async (store) => {
    if (!confirm(`Tem certeza que deseja excluir "${store.name}"?`)) return
    try {
      await deleteStore(store.id)
      fetchStores()
    } catch {
      alert('Erro ao excluir filial')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Filiais ({total})</h1>
          <button onClick={() => setEditingStore({})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Nova Filial
          </button>
        </div>

        <input type="text" placeholder="Buscar por filial..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full p-3 border rounded-lg mb-4" />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Slug</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Cidade</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Estado</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Telefone</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{store.name}</td>
                  <td className="p-3 text-gray-600">{store.slug}</td>
                  <td className="p-3 text-gray-600">{store.city || '-'}</td>
                  <td className="p-3 text-gray-600">{store.state || '-'}</td>
                  <td className="p-3 text-gray-600">{store.phone || '-'}</td>
                  <td className="p-3">
                    {store.is_active
                      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Ativo</span>
                      : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Inativo</span>}
                  </td>
                  <td className="p-3">
                    <button onClick={() => setEditingStore(store)}
                      className="text-blue-600 hover:text-blue-800 text-sm">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(store)}
                      className="text-red-600 hover:text-red-800 text-sm ml-2">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr><td colSpan="7" className="p-6 text-center text-gray-400">Nenhuma filial encontrada</td></tr>
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

      {editingStore !== null && (
        <EditModal
          store={editingStore?.id ? editingStore : null}
          onClose={() => setEditingStore(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}