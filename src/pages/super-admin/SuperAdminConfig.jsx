import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getConfigs, updateConfig, createConfig, deleteConfig, reloadCache } from '../../api/admin'

const CATEGORIES = [
  { id: 'storage',  label: '💾 Storage', icon: '💾', desc: 'S3 / MinIO' },
  { id: 'database', label: '🗄️ Database', icon: '🗄️', desc: 'PostgreSQL' },
  { id: 'geral',    label: '⚙️ Geral',    icon: '⚙️', desc: 'Aplicação' },
  { id: 'email',    label: '📧 Email',    icon: '📧', desc: 'SMTP' }
]

const CATEGORY_NAMES = {
  storage:  'Storage (S3 / MinIO)',
  database: 'Database',
  geral:    'Geral',
  email:    'Email'
}

export default function SuperAdminConfig() {
  const { user } = useAuth()

  const [activeCategory, setActiveCategory] = useState('storage')
  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [message, setMessage] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showCreate, setShowCreate] = useState(false)
  const [newConfig, setNewConfig] = useState({
    category: 'storage', key: '', value: '', is_secret: false, description: ''
  })

  useEffect(() => { loadConfigs() }, [])

  // ═══════════════════════════════════════════════════════════
  // BLOQUEIO DE SEGURANÇA — só superadmin passa daqui
  // ═══════════════════════════════════════════════════════════
  if (user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Acesso Restrito</h2>
          <p className="text-gray-500">Apenas administradores master podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  async function loadConfigs() {
    try {
      setLoading(true)
      setMessage(null)
      const res = await getConfigs()
      const data = res.data
      setConfigs(data)
      const values = {}
      data.forEach(c => { values[`${c.category}.${c.key}`] = c.value })
      setEditValues(values)
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao carregar: ' + (err.response?.data?.error || err.message) })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(category, key) {
    try {
      setSaving(`${category}.${key}`)
      setMessage(null)
      await updateConfig(category, key, { value: editValues[`${category}.${key}`] })
      setMessage({ type: 'success', text: `✅ ${category}.${key} atualizado com sucesso!` })
    } catch (err) {
      setMessage({ type: 'error', text: `❌ Erro ao salvar ${key}: ` + (err.response?.data?.error || err.message) })
    } finally {
      setSaving(null)
    }
  }

  async function handleDelete(category, key) {
    if (!confirm(`Remover ${category}.${key}? O sistema usará o valor fallback (env/hardcoded).`)) return
    try {
      setMessage(null)
      await deleteConfig(category, key)
      setMessage({ type: 'success', text: `✅ ${key} removido. Usará fallback.` })
      loadConfigs()
    } catch (err) {
      setMessage({ type: 'error', text: `❌ Erro ao remover: ` + (err.response?.data?.error || err.message) })
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      setMessage(null)
      await createConfig(newConfig)
      setMessage({ type: 'success', text: `✅ Configuração ${newConfig.key} criada!` })
      setShowCreate(false)
      setNewConfig({ category: 'storage', key: '', value: '', is_secret: false, description: '' })
      loadConfigs()
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao criar: ' + (err.response?.data?.error || err.message) })
    }
  }

  async function handleReload() {
    try {
      await reloadCache()
      setMessage({ type: 'success', text: '✅ Cache invalidado! Configs recarregadas do banco.' })
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao recarregar: ' + err.message })
    }
  }

  const filteredConfigs = configs.filter(c => c.category === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando configurações do sistema...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🔐 Super Admin</h1>
            <p className="text-sm text-gray-500">Configurações do sistema — armazenadas no banco com fallback para env/hardcoded</p>
          </div>
          <button onClick={handleReload}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium">
            🔄 Recarregar Cache
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${
            message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Categorias */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}>
              <span>{cat.label}</span>
              <span className="text-xs opacity-75">{cat.desc}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeCategory === cat.id ? 'bg-blue-500' : 'bg-gray-200 text-gray-500'
              }`}>
                {configs.filter(c => c.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Card de configurações */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">{CATEGORY_NAMES[activeCategory] || activeCategory}</h2>
            <button onClick={() => setShowCreate(!showCreate)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
              + Nova Config
            </button>
          </div>

          {/* Formulário de nova config */}
          {showCreate && (
            <form onSubmit={handleCreate} className="p-6 border-b bg-blue-50">
              <h3 className="font-medium mb-3 text-sm text-blue-800">Nova Configuração</h3>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Categoria</label>
                  <select value={newConfig.category}
                    onChange={e => setNewConfig({ ...newConfig, category: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Key</label>
                  <input type="text" value={newConfig.key} required
                    onChange={e => setNewConfig({ ...newConfig, key: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm font-mono" placeholder="ex: endpoint" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Valor</label>
                  <input type="text" value={newConfig.value} required
                    onChange={e => setNewConfig({ ...newConfig, value: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={newConfig.is_secret}
                      onChange={e => setNewConfig({ ...newConfig, is_secret: e.target.checked })} />
                    Secreto
                  </label>
                  <button type="submit"
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition">
                    Criar
                  </button>
                </div>
              </div>
              <div>
                <input type="text" value={newConfig.description}
                  onChange={e => setNewConfig({ ...newConfig, description: e.target.value })}
                  className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Descrição (opcional)" />
              </div>
            </form>
          )}

          {/* Lista de configurações */}
          <div className="divide-y">
            {filteredConfigs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Nenhuma configuração nesta categoria.
              </div>
            ) : filteredConfigs.map(config => (
              <div key={config.id} className="p-5 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-semibold text-gray-800">{config.key}</code>
                      {config.is_secret && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">🔒 secreto</span>
                      )}
                    </div>
                    {config.description && (
                      <p className="text-xs text-gray-500 mb-2">{config.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <input type={config.is_secret ? 'password' : 'text'}
                        value={editValues[`${config.category}.${config.key}`] || ''}
                        onChange={e => setEditValues({
                          ...editValues,
                          [`${config.category}.${config.key}`]: e.target.value
                        })}
                        className={`flex-1 border rounded px-3 py-1.5 text-sm font-mono ${
                          config.is_secret ? 'bg-gray-50' : 'bg-white'
                        }`} />
                      {config.is_secret && (
                        <button onClick={() => {
                          const input = document.querySelector(`[data-secret="${config.id}"]`)
                          if (input) input.type = input.type === 'password' ? 'text' : 'password'
                        }}
                          className="text-xs text-gray-500 hover:text-gray-700">👁️</button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-6">
                    <button onClick={() => handleSave(config.category, config.key)}
                      disabled={saving === `${config.category}.${config.key}`}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50">
                      {saving === `${config.category}.${config.key}` ? '💾...' : '💾 Salvar'}
                    </button>
                    <button onClick={() => handleDelete(config.category, config.key)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info de fallback */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>🔗 Chain de resolução:</strong> Banco <code className="bg-blue-100 px-1 rounded">system_configs</code> →
          Env vars <code className="bg-blue-100 px-1 rounded">STORAGE_ENDPOINT</code> → Hardcoded fallback no código
          <br />
          <span className="text-xs text-blue-600">Para trocar de MinIO para S3: basta atualizar os valores e clicar em "Recarregar Cache". Nenhum rebuild necessário.</span>
        </div>
      </div>
    </div>
  )
}