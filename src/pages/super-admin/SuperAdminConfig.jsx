import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getConfigs,
  updateConfig,
  createConfig,
  deleteConfig,
  reloadCache
} from '../../api/admin'
import { ConfirmDialog } from '../../components/Feedback'

const CATEGORIES = [
  { id: 'storage', label: 'Storage', icon: '💾', desc: 'S3 / MinIO' },
  { id: 'database', label: 'Database', icon: '🗄️', desc: 'PostgreSQL' },
  { id: 'geral', label: 'Geral', icon: '⚙️', desc: 'Aplicação' },
  { id: 'email', label: 'Email', icon: '📧', desc: 'SMTP' }
]

const CATEGORY_NAMES = {
  storage: 'Storage (S3 / MinIO)',
  database: 'Database',
  geral: 'Geral',
  email: 'Email'
}

const STORAGE_RECOMMENDED_KEYS = [
  { key: 'endpoint', example: 'https://s3.wrtec.com.br', required: true },
  { key: 'region', example: 'us-east-1', required: true },
  { key: 'access_key', example: 'minioadmin', required: true },
  { key: 'secret_key', example: '********', required: true },
  { key: 'bucket', example: 'ofertas', required: true },
  { key: 'public_url', example: 'https://storage.wrtec.com.br', required: true },
  { key: 'object_acl', example: 'public-read', required: false }
]

const EMAIL_RECOMMENDED_KEYS = [
  { key: 'host', example: 'smtp.seudominio.com.br', required: true },
  { key: 'port', example: '587', required: true },
  { key: 'user', example: 'no-reply@seudominio.com.br', required: false },
  { key: 'password', example: '********', required: false },
  { key: 'from', example: 'Admin Ofertas <no-reply@seudominio.com.br>', required: true },
  { key: 'secure', example: 'false', required: false },
  { key: 'reset_url', example: 'https://admin-ofertas.wrtec.com.br', required: true }
]

export default function SuperAdminConfig() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState('storage')
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [message, setMessage] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [visibleSecrets, setVisibleSecrets] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [newConfig, setNewConfig] = useState({
    category: 'storage',
    key: '',
    value: '',
    is_secret: false,
    description: ''
  })

  useEffect(() => {
    loadConfigs()
  }, [])

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-4xl">🔒</div>
          <h2 className="mb-2 text-xl font-bold text-red-600">Acesso restrito</h2>
          <p className="text-sm text-slate-500">
            Apenas administradores master podem acessar esta página.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Voltar ao dashboard
          </button>
        </div>
      </div>
    )
  }

  async function loadConfigs() {
    try {
      setLoading(true)
      setMessage(null)

      const res = await getConfigs()
      const data = res.data || []

      setConfigs(data)

      const values = {}
      data.forEach((config) => {
        values[`${config.category}.${config.key}`] = config.value ?? ''
      })
      setEditValues(values)
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erro ao carregar: ' + (err.response?.data?.error || err.message)
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(category, key) {
    const stateKey = `${category}.${key}`

    try {
      setSaving(stateKey)
      setMessage(null)

      await updateConfig(category, key, {
        value: editValues[stateKey]
      })

      setMessage({
        type: 'success',
        text: `${category}.${key} atualizado com sucesso.`
      })
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Erro ao salvar ${key}: ` + (err.response?.data?.error || err.message)
      })
    } finally {
      setSaving(null)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      setMessage(null)
      await deleteConfig(pendingDelete.category, pendingDelete.key)
      setMessage({
        type: 'success',
        text: `${pendingDelete.key} removido com sucesso.`
      })
      setPendingDelete(null)
      await loadConfigs()
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erro ao remover: ' + (err.response?.data?.error || err.message)
      })
      setPendingDelete(null)
    }
  }

  async function handleCreate(event) {
    event.preventDefault()

    try {
      setMessage(null)

      await createConfig(newConfig)

      setMessage({
        type: 'success',
        text: `Configuração ${newConfig.key} criada com sucesso.`
      })

      setShowCreate(false)
      setNewConfig({
        category: activeCategory,
        key: '',
        value: '',
        is_secret: false,
        description: ''
      })

      await loadConfigs()
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erro ao criar: ' + (err.response?.data?.error || err.message)
      })
    }
  }

  async function handleReload() {
    try {
      await reloadCache()
      setMessage({
        type: 'success',
        text: 'Configurações recarregadas com sucesso.'
      })
      await loadConfigs()
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Erro ao recarregar: ' + (err.response?.data?.error || err.message)
      })
    }
  }

  function toggleSecretVisibility(configId) {
    setVisibleSecrets((prev) => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const filteredConfigs = useMemo(
    () => configs.filter((config) => config.category === activeCategory),
    [configs, activeCategory]
  )

  const storageCurrentKeys = useMemo(() => {
    return new Set(
      configs
        .filter((config) => config.category === 'storage')
        .map((config) => config.key)
    )
  }, [configs])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <p className="text-lg text-slate-500">Carregando configurações do sistema...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
          >
            ← Voltar ao dashboard
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/super-admin/configuracoes')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Configurações
          </button>
          <button
            onClick={() => navigate('/super-admin/clientes')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clientes
          </button>
          <button
            onClick={() => navigate('/super-admin/auditoria')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Auditoria
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin</h1>
            <p className="mt-1 text-sm text-slate-500">
              Configurações centrais do sistema com prioridade para banco e fallback
              para variáveis de ambiente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReload}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Recarregar configurações
            </button>

            <button
              onClick={() => navigate('/super-admin/auditoria')}
              className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Auditoria
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id
            const count = configs.filter((config) => config.category === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id)
                  setNewConfig((prev) => ({ ...prev, category: category.id }))
                }}
                className={`inline-flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {category.desc}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {activeCategory === 'storage' ? (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-base font-semibold text-blue-900">
              Parâmetros recomendados para Storage
            </h2>
            <p className="mt-1 text-sm text-blue-800">
              Para o backend de upload funcionar corretamente, prefira estas chaves
              na categoria <strong>storage</strong>.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {STORAGE_RECOMMENDED_KEYS.map((item) => {
                const exists = storageCurrentKeys.has(item.key)

                return (
                  <div
                    key={item.key}
                    className="rounded-xl border border-blue-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-sm font-semibold text-slate-900">{item.key}</code>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          exists
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {exists ? 'cadastrada' : 'pendente'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Exemplo: <span className="font-mono">{item.example}</span>
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {item.required ? 'Obrigatória' : 'Opcional'}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4 text-sm text-slate-700">
              <p>
                <strong>Ordem de resolução no backend:</strong> banco em{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">system_configs</code>{' '}
                → variáveis de ambiente{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_ENDPOINT</code>,{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_REGION</code>,{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_ACCESS_KEY</code>,{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_SECRET_KEY</code>,{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_BUCKET</code> e{' '}
                <code className="rounded bg-slate-100 px-1 py-0.5">S3_PUBLIC_URL</code>.
              </p>
            </div>
          </div>
        ) : null}

        {activeCategory === 'email' ? (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-base font-semibold text-blue-900">
              Parâmetros recomendados para Email SMTP
            </h2>
            <p className="mt-1 text-sm text-blue-800">
              Estes dados são usados pelo link "Esqueceu a senha?" na tela de login.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {EMAIL_RECOMMENDED_KEYS.map((item) => {
                const exists = configs.some((config) => config.category === 'email' && config.key === item.key)

                return (
                  <div key={item.key} className="rounded-lg border border-blue-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <code className="text-sm font-semibold text-slate-900">{item.key}</code>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        exists ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {exists ? 'cadastrada' : 'pendente'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Exemplo: <span className="font-mono">{item.example}</span>
                    </p>
                    <p className="mt-2 text-xs text-slate-600">
                      {item.required ? 'Obrigatória' : 'Opcional'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {CATEGORY_NAMES[activeCategory] || activeCategory}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Gerencie as configurações persistidas no banco.
              </p>
            </div>

            <button
              onClick={() => setShowCreate((prev) => !prev)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {showCreate ? 'Fechar' : 'Nova configuração'}
            </button>
          </div>

          {showCreate ? (
            <form onSubmit={handleCreate} className="border-b border-slate-200 bg-slate-50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-800">
                Criar nova configuração
              </h3>

              <div className="grid gap-4 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Categoria
                  </label>
                  <select
                    value={newConfig.category}
                    onChange={(e) =>
                      setNewConfig((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Key
                  </label>
                  <input
                    type="text"
                    value={newConfig.key}
                    required
                    onChange={(e) =>
                      setNewConfig((prev) => ({ ...prev, key: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                    placeholder="ex: endpoint"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={newConfig.value}
                    required
                    onChange={(e) =>
                      setNewConfig((prev) => ({ ...prev, value: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={newConfig.is_secret}
                      onChange={(e) =>
                        setNewConfig((prev) => ({
                          ...prev,
                          is_secret: e.target.checked
                        }))
                      }
                    />
                    Secreto
                  </label>

                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Criar
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newConfig.description}
                  onChange={(e) =>
                    setNewConfig((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Descrição opcional"
                />
              </div>
            </form>
          ) : null}

          <div className="divide-y divide-slate-200">
            {filteredConfigs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Nenhuma configuração cadastrada nesta categoria.
              </div>
            ) : (
              filteredConfigs.map((config) => {
                const stateKey = `${config.category}.${config.key}`
                const isSaving = saving === stateKey
                const isSecretVisible = !!visibleSecrets[config.id]

                return (
                  <div key={config.id} className="p-5 transition hover:bg-slate-50">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <code className="text-sm font-semibold text-slate-900">
                            {config.key}
                          </code>

                          {config.is_secret ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              secreto
                            </span>
                          ) : null}
                        </div>

                        {config.description ? (
                          <p className="mb-3 text-xs text-slate-500">{config.description}</p>
                        ) : null}

                        <div className="flex flex-col gap-2 md:flex-row">
                          <input
                            type={
                              config.is_secret && !isSecretVisible ? 'password' : 'text'
                            }
                            value={editValues[stateKey] || ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [stateKey]: e.target.value
                              }))
                            }
                            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${
                              config.is_secret
                                ? 'border-slate-300 bg-slate-50'
                                : 'border-slate-300 bg-white'
                            }`}
                          />

                          {config.is_secret ? (
                            <button
                              type="button"
                              onClick={() => toggleSecretVisibility(config.id)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              {isSecretVisible ? 'Ocultar' : 'Mostrar'}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleSave(config.category, config.key)}
                          disabled={isSaving}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>

                        <button
                          onClick={() => setPendingDelete({ category: config.category, key: config.key })}
                          className="rounded-lg bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
          <p>
            <strong>Modelo operacional recomendado:</strong> manter o storage com
            prioridade em <code className="rounded bg-slate-100 px-1 py-0.5">system_configs</code>{' '}
            e usar variáveis de ambiente <code className="rounded bg-slate-100 px-1 py-0.5">S3_*</code>{' '}
            apenas como fallback de contingência.
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remover configuracao"
        message={`Remover ${pendingDelete?.category}.${pendingDelete?.key}? O sistema passara a usar fallback do ambiente quando existir.`}
        confirmLabel="Remover"
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
