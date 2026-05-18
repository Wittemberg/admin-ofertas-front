import { useState, useEffect } from 'react'
import { getApiKeys, createApiKey, revokeApiKey } from '../api/apiKeys'

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [label, setLabel] = useState('')
  const [showKey, setShowKey] = useState(null)
  const [creating, setCreating] = useState(false)

  const fetchKeys = () => {
    getApiKeys().then(res => setKeys(res.data || [])).catch(console.error)
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async () => {
    if (!label.trim()) return
    setCreating(true)
    try {
      const res = await createApiKey({ label: label.trim() })
      setShowKey(res.data.raw_key)
      setLabel('')
      fetchKeys()
    } catch {
      alert('Erro ao gerar chave')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (id, label) => {
    if (!confirm(`Revogar chave "${label}"? Esta ação não pode ser desfeita.`)) return
    try {
      await revokeApiKey(id)
      fetchKeys()
    } catch {
      alert('Erro ao revogar chave')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <h1 className="text-2xl font-bold mb-6">Chaves de API (Integração ERP)</h1>

        {/* Criar nova chave */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Nova Chave de API</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="Ex: ERP Supermercado ABC"
              className="flex-1 p-3 border rounded"
              value={label}
              onChange={e => setLabel(e.target.value)} />
            <button onClick={handleCreate}
              disabled={creating || !label.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Gerando...' : 'Gerar Chave'}
            </button>
          </div>
        </div>

        {/* Chave gerada (mostrada 1x) */}
        {showKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🔑 Chave gerada com sucesso!</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Esta chave será exibida apenas <strong>uma única vez</strong>. Copie e armazene com segurança.
            </p>
            <div
              className="bg-white p-4 rounded border border-yellow-300 font-mono text-sm break-all select-all cursor-pointer hover:bg-yellow-50 transition"
              onClick={() => {
                navigator.clipboard.writeText(showKey)
                setShowKey(null)
              }}
              title="Clique para copiar">
              📋 {showKey}
            </div>
            <p className="text-xs text-green-700 mt-2">👆 Clique na chave acima para copiar automaticamente</p>
          </div>
        )}

        {/* Lista de chaves */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Identificação</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Prefixo</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Último uso</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Criada em</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{key.label}</td>
                  <td className="p-3 font-mono text-sm text-gray-500">{key.key_prefix}...</td>
                  <td className="p-3">
                    {key.is_active
                      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Ativa</span>
                      : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Revogada</span>}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {key.last_used
                      ? new Date(key.last_used).toLocaleString('pt-BR')
                      : 'Nunca'}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(key.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3">
                    {key.is_active && (
                      <button onClick={() => handleRevoke(key.id, key.label)}
                        className="text-red-600 hover:text-red-800 text-sm">
                        Revogar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">Nenhuma chave de API cadastrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}