import { useEffect, useState } from 'react'
import { getApiKeys, createApiKey, revokeApiKey } from '../api/apiKeys'
import { getErrorMessage } from '../api/errors'
import { ConfirmDialog, MessageBanner } from '../components/Feedback'

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [label, setLabel] = useState('')
  const [showKey, setShowKey] = useState(null)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState(null)
  const [pendingRevoke, setPendingRevoke] = useState(null)

  const fetchKeys = () => {
    getApiKeys()
      .then(res => setKeys(res.data || []))
      .catch(err => setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao carregar chaves de API') }))
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async () => {
    if (!label.trim()) return
    setCreating(true)
    setMessage(null)

    try {
      const res = await createApiKey({ label: label.trim() })
      setShowKey(res.data.raw_key)
      setLabel('')
      setMessage({ type: 'success', text: 'Chave criada. Copie agora, ela nao sera exibida novamente.' })
      fetchKeys()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao gerar chave') })
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    if (!showKey) return
    try {
      await navigator.clipboard.writeText(showKey)
      setShowKey(null)
      setMessage({ type: 'success', text: 'Chave copiada para a area de transferencia.' })
    } catch {
      setMessage({ type: 'warning', text: 'Nao foi possivel copiar automaticamente. Selecione e copie a chave manualmente.' })
    }
  }

  const handleRevoke = async () => {
    if (!pendingRevoke) return
    try {
      await revokeApiKey(pendingRevoke.id)
      setPendingRevoke(null)
      setMessage({ type: 'success', text: 'Chave revogada.' })
      fetchKeys()
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao revogar chave') })
      setPendingRevoke(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Chaves de API</h1>
          <p className="mt-1 text-sm text-gray-500">Acesso para ERPs e integracoes externas autorizadas.</p>
        </div>

        <MessageBanner message={message} className="mb-4" />

        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Nova chave de API</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium text-gray-700">Identificacao</span>
              <input
                type="text"
                placeholder="Ex: ERP Loja Matriz"
                className="w-full rounded-lg border border-gray-300 px-3 py-3"
                value={label}
                onChange={event => setLabel(event.target.value)}
              />
            </label>
            <button
              onClick={handleCreate}
              disabled={creating || !label.trim()}
              className="self-end rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? 'Gerando...' : 'Gerar chave'}
            </button>
          </div>
        </section>

        {showKey && (
          <section className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="font-semibold text-yellow-800">Chave gerada</h3>
            <p className="mt-1 text-sm text-yellow-700">Esta chave sera exibida apenas uma vez.</p>
            <div className="mt-3 rounded-lg border border-yellow-300 bg-white p-4 font-mono text-sm break-all text-gray-900">
              {showKey}
            </div>
            <button onClick={handleCopy} className="mt-3 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700">
              Copiar chave
            </button>
          </section>
        )}

        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Identificacao</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Prefixo</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Ultimo uso</th>
                <th className="p-3 text-left text-sm font-medium text-gray-600">Criada em</th>
                <th className="p-3 text-right text-sm font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{key.label}</td>
                  <td className="p-3 font-mono text-sm text-gray-500">{key.key_prefix}...</td>
                  <td className="p-3">
                    {key.is_active
                      ? <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">Ativa</span>
                      : <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">Revogada</span>}
                  </td>
                  <td className="p-3 text-sm text-gray-500">{key.last_used ? new Date(key.last_used).toLocaleString('pt-BR') : 'Nunca'}</td>
                  <td className="p-3 text-sm text-gray-500">{new Date(key.created_at).toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right">
                    {key.is_active && (
                      <button onClick={() => setPendingRevoke(key)} className="text-sm text-red-600 hover:text-red-800">
                        Revogar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-sm text-gray-400">Nenhuma chave de API cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingRevoke}
        title="Revogar chave"
        message={`Revogar a chave "${pendingRevoke?.label}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Revogar"
        destructive
        onCancel={() => setPendingRevoke(null)}
        onConfirm={handleRevoke}
      />
    </div>
  )
}
