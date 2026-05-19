import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAuditLogs } from '../api/admin'

const ACTION_LABELS = {
  create_config: '➕ Criou',
  update_config: '✏️ Alterou',
  delete_config: '🗑️ Removeu'
}

const ACTION_OPTIONS = [
  { value: '', label: 'Todas as ações' },
  { value: 'create_config', label: 'Criação' },
  { value: 'update_config', label: 'Alteração' },
  { value: 'delete_config', label: 'Remoção' }
]

export default function SuperAdminAudit() {
  const { user } = useAuth()

  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [limit] = useState(50)
  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')

  // ✅ useEffect ANTES do guard — hooks sempre na mesma ordem
  useEffect(() => { loadLogs() }, [page, filterAction])

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

  async function loadLogs() {
    try {
      setLoading(true)
      const params = { limit, offset: page * limit }
      if (filterAction) params.action = filterAction
      if (filterEntity) params.entity_id = filterEntity

      const res = await getAuditLogs(params)
      setLogs(res.data.logs)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Erro ao carregar auditoria:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    setPage(0)
    loadLogs()
  }

  const totalPages = Math.ceil(total / limit)

  function formatValue(val) {
    if (!val) return <span className="text-gray-300">—</span>
    if (val.length > 80) return val.substring(0, 80) + '...'
    return val
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">📋 Auditoria</h1>
          <p className="text-sm text-gray-500">
            Registro de todas as alterações feitas no Super Admin ({total} registros)
          </p>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ação</label>
            <select value={filterAction}
              onChange={e => { setFilterAction(e.target.value); setPage(0) }}
              className="border rounded px-3 py-1.5 text-sm">
              {ACTION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Entidade (ex: storage.endpoint)</label>
            <input type="text" value={filterEntity}
              onChange={e => setFilterEntity(e.target.value)}
              placeholder="Filtrar por chave..."
              className="border rounded px-3 py-1.5 text-sm w-64" />
          </div>
          <button type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
            🔍 Filtrar
          </button>
        </form>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Data/Hora</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ação</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Entidade</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Valor Antigo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Valor Novo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Carregando logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Nenhum log encontrado.
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        log.action === 'create_config' ? 'bg-green-100 text-green-700' :
                        log.action === 'delete_config' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{log.entity_id || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">
                      {formatValue(log.old_value)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-xs truncate">
                      {formatValue(log.new_value)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">
                Página {page + 1} de {totalPages} ({total} registros)
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-40">
                  ← Anterior
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-40">
                  Próximo →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}