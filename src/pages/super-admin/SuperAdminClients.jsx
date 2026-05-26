import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createTenant, getTenants, updateTenant } from '../../api/admin'

const EMPTY_FORM = {
  id: null,
  name: '',
  slug: '',
  domain: '',
  admin_name: '',
  admin_email: '',
  admin_password: '',
  is_active: true
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function SuperAdminClients() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const editing = !!form.id

  const loadClients = async () => {
    try {
      setLoading(true)
      const { data } = await getTenants()
      setClients(data || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao carregar clientes.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadClients)
  }, [])

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-red-600">Acesso restrito</h2>
          <p className="text-sm text-slate-500">Apenas administradores master podem acessar esta página.</p>
          <button onClick={() => navigate('/')} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Voltar ao dashboard
          </button>
        </div>
      </div>
    )
  }

  const updateField = (field, value) => {
    setForm(current => {
      const next = { ...current, [field]: value }
      if (field === 'name' && !current.slug) next.slug = slugify(value)
      return next
    })
  }

  const editClient = (client) => {
    setForm({
      id: client.id,
      name: client.name || '',
      slug: client.slug || '',
      domain: client.domain || '',
      admin_name: client.admin_user?.name || '',
      admin_email: client.admin_user?.email || '',
      admin_password: '',
      is_active: client.is_active
    })
    setMessage(null)
  }

  const clearForm = () => {
    setForm(EMPTY_FORM)
    setMessage(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (editing) {
        await updateTenant(form.id, form)
        setMessage({ type: 'success', text: 'Cliente atualizado com sucesso.' })
      } else {
        await createTenant(form)
        setMessage({ type: 'success', text: 'Cliente cadastrado com sucesso.' })
      }
      clearForm()
      await loadClients()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao salvar cliente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <button onClick={() => navigate('/')} className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Voltar ao dashboard
          </button>
          <button onClick={() => navigate('/super-admin/configuracoes')} className="text-sm font-medium text-blue-600 hover:underline">
            Configurações
          </button>
          <button onClick={() => navigate('/super-admin/auditoria')} className="text-sm font-medium text-blue-600 hover:underline">
            Auditoria
          </button>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
              <p className="mt-1 text-sm text-slate-500">Cadastre, edite e desative clientes da plataforma.</p>
            </div>
            <button onClick={clearForm} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Novo cliente
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Clientes cadastrados</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500">Carregando clientes...</div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">Nenhum cliente cadastrado.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => editClient(client)}
                    className={`block w-full px-5 py-4 text-left hover:bg-slate-50 ${
                      form.id === client.id ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-900">{client.name}</div>
                        <div className="mt-1 font-mono text-xs text-slate-500">{client.slug}</div>
                        <div className="mt-2 text-sm text-slate-600">{client.domain || 'Sem domínio configurado'}</div>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          client.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {client.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        <div className="mt-2 text-xs text-slate-500">
                          {client.admin_user?.email || 'Sem admin'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              {editing ? 'Editar cliente' : 'Novo cliente'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {editing ? 'Atualize dados do tenant e do admin principal.' : 'Crie o tenant e o admin inicial.'}
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Nome da empresa" value={form.name} onChange={value => updateField('name', value)} required />
              <Field label="Slug" value={form.slug} onChange={value => updateField('slug', slugify(value))} required />
              <Field label="Domínio público" value={form.domain} onChange={value => updateField('domain', value)} placeholder="ofertas.cliente.com.br" />
              <Field label="Nome do admin" value={form.admin_name} onChange={value => updateField('admin_name', value)} required />
              <Field label="E-mail do admin" type="email" value={form.admin_email} onChange={value => updateField('admin_email', value)} required />
              <Field
                label={editing ? 'Nova senha do admin (opcional)' : 'Senha inicial'}
                type="password"
                value={form.admin_password}
                onChange={value => updateField('admin_password', value)}
                required={!editing}
              />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={event => updateField('is_active', event.target.checked)}
                />
                Cliente ativo
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar cliente'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
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

function Field({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}
