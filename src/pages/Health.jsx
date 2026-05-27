import axios from 'axios'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '../api/errors'

const API_BASE_URL = 'https://api-ofertas.wrtec.com.br'

export default function Health() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkedAt, setCheckedAt] = useState(null)

  const checkHealth = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 })
      setHealth(data)
      setCheckedAt(new Date())
    } catch (err) {
      setHealth(null)
      setError(getErrorMessage(err, 'Nao foi possivel consultar o healthcheck da API.'))
      setCheckedAt(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const isOk = health?.status === 'ok'
  const statusLabel = loading ? 'Verificando' : isOk ? 'Operacional' : 'Instavel'
  const statusClass = loading
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : isOk
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <main className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-950">Status dos servicos</h1>
          <p className="mt-1 text-sm text-slate-500">Checagem publica do painel e da API de ofertas.</p>
        </div>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Admin Ofertas</h2>
              <p className="mt-1 text-sm text-slate-500">Frontend carregado com sucesso.</p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Operacional
            </span>
          </div>
        </section>

        <section className="mt-4 rounded-lg bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">API Ofertas</h2>
              <p className="mt-1 text-sm text-slate-500">{API_BASE_URL}/health</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {health && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Status" value={health.status || '-'} />
              <Metric label="Latencia" value={`${health.latency_ms ?? '-'} ms`} />
              <Metric label="Uptime" value={`${health.uptime_seconds ?? '-'} s`} />
            </div>
          )}

          {health?.checks && (
            <div className="mt-5 space-y-2">
              {Object.entries(health.checks).map(([name, check]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium capitalize text-slate-700">{name}</span>
                  <span className={check.status === 'ok' ? 'font-semibold text-emerald-700' : 'font-semibold text-red-700'}>
                    {check.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-slate-500">
              Ultima checagem: {checkedAt ? checkedAt.toLocaleString('pt-BR') : '-'}
            </span>
            <button
              type="button"
              onClick={checkHealth}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Verificando...' : 'Verificar novamente'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="text-lg font-bold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  )
}
