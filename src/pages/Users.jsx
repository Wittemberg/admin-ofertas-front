import { useEffect, useState } from 'react'
import { createTenantUser, getTenantUsers, updateTenantUser } from '../api/auth'
import { getErrorMessage } from '../api/errors'
import { ROLE_LABELS, ROLE_OPTIONS } from '../auth/permissions'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  is_active: true
}

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const loadUsers = async ({ clearMessage = true } = {}) => {
    setLoading(true)
    if (clearMessage) setMessage(null)
    try {
      const { data } = await getTenantUsers()
      setUsers(data || [])
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar usuarios') })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const editUser = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      email: item.email,
      password: '',
      role: item.role,
      is_active: item.is_active
    })
    setMessage(null)
  }

  const resetForm = ({ clearMessage = true } = {}) => {
    setForm(EMPTY_FORM)
    if (clearMessage) setMessage(null)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: form.is_active
      }
      if (form.password) payload.password = form.password

      const successText = form.id ? 'Usuario atualizado.' : 'Usuario criado.'
      if (form.id) {
        await updateTenantUser(form.id, payload)
      } else {
        await createTenantUser({ ...payload, password: form.password })
      }

      resetForm({ clearMessage: false })
      await loadUsers({ clearMessage: false })
      setMessage({ type: 'success', text: successText })
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao salvar usuario') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Usuarios da empresa</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie apenas acessos deste cliente e permissoes basicas por perfil.</p>
        </div>

        {message && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="overflow-hidden rounded-lg bg-white shadow">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">Carregando usuarios...</p>
            ) : users.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">Nenhum usuario cadastrado.</p>
            ) : (
              <div className="divide-y">
                {users.map(item => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                      <div className="mt-1 text-xs text-gray-400">{ROLE_LABELS[item.role] || item.role}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {item.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        type="button"
                        onClick={() => editUser(item)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <form onSubmit={submit} className="rounded-lg bg-white p-5 shadow">
            <h2 className="text-lg font-bold text-gray-900">{form.id ? 'Editar usuario' : 'Novo usuario'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Nome</span>
                <input
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">{form.id ? 'Nova senha opcional' : 'Senha inicial'}</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                  required={!form.id}
                  minLength={form.password ? 6 : undefined}
                  className="w-full rounded-lg border px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700">Perfil</span>
                <select
                  value={form.role}
                  onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
                  disabled={form.id === user?.id}
                  className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-100"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  disabled={form.id === user?.id}
                  onChange={event => setForm(current => ({ ...current, is_active: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Usuario ativo
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
