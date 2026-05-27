import { useEffect, useRef, useState } from 'react'
import { getOrders, updateOrderStatus } from '../api/orders'

const STATUS_LABELS = {
  pending: 'Pendente',
  processing: 'Em atendimento',
  completed: 'Concluido',
  cancelled: 'Cancelado'
}

const STATUS_CLASSES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos', tone: 'text-gray-900' },
  { value: 'pending', label: STATUS_LABELS.pending, tone: 'text-yellow-700' },
  { value: 'processing', label: STATUS_LABELS.processing, tone: 'text-blue-700' },
  { value: 'completed', label: STATUS_LABELS.completed, tone: 'text-emerald-700' },
  { value: 'cancelled', label: STATUS_LABELS.cancelled, tone: 'text-red-700' }
]

const HISTORY_ACTIONS = {
  created: 'Pedido criado',
  status_changed: 'Status alterado'
}

function formatMoney(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR')
}

function buildOrderSummary(order) {
  const lines = [
    'Novo pedido - Site de Ofertas',
    `Cliente: ${order.customer_name || '-'}`,
    `WhatsApp: ${order.customer_phone || '-'}`,
    `Loja: ${order.store_name || 'Todas'}`,
    `Status: ${STATUS_LABELS[order.status] || order.status || '-'}`,
    `Data: ${formatDate(order.created_at)}`,
    '',
    'Itens:'
  ]

  for (const item of order.items || []) {
    lines.push(`${item.quantity}x ${item.product_name} - ${formatMoney(item.unit_price_snapshot)}`)
  }

  lines.push('')
  lines.push(`Total estimado: ${formatMoney(order.total_estimated)}`)
  if (order.customer_note) lines.push(`Obs: ${order.customer_note}`)

  return lines.join('\n')
}

function playNewOrderSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime)
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12)
    gain.gain.setValueAtTime(0.001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.38)
  } catch {
    // Browsers can block audio before user interaction.
  }
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusCounts, setStatusCounts] = useState({ total: 0 })
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const latestOrderDateRef = useRef(null)
  const initialLoadDoneRef = useRef(false)
  const limit = 20

  const fetchOrders = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const { data } = await getOrders({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined
      })
      const nextOrders = data.orders || []
      setOrders(nextOrders)
      setTotal(data.total || 0)
      setStatusCounts(data.status_counts || { total: data.total || 0 })
      setLastUpdatedAt(new Date())

      const newestDate = nextOrders[0]?.created_at || null
      if (newestDate) {
        const previousDate = latestOrderDateRef.current
        if (initialLoadDoneRef.current && previousDate && new Date(newestDate) > new Date(previousDate)) {
          const incoming = nextOrders.filter(order => new Date(order.created_at) > new Date(previousDate)).length
          setNewOrdersCount(current => current + incoming)
          playNewOrderSound()
        }
        latestOrderDateRef.current = newestDate
      }
      initialLoadDoneRef.current = true

      if (selected?.id) {
        const updated = nextOrders.find(order => order.id === selected.id)
        if (updated) setSelected(updated)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, status, dateFrom, dateTo])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const timer = setInterval(() => {
      fetchOrders({ silent: true })
    }, 30000)
    return () => clearInterval(timer)
  }, [autoRefresh, page, status, search, dateFrom, dateTo, selected?.id])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const changeStatus = async (order, nextStatus) => {
    try {
      const { data } = await updateOrderStatus(order.id, nextStatus)
      setOrders(current => current.map(item => item.id === order.id ? data : item))
      setSelected(current => current?.id === order.id ? data : current)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const copySummary = async (order) => {
    try {
      await navigator.clipboard.writeText(buildOrderSummary(order))
      alert('Resumo copiado')
    } catch {
      alert('Nao foi possivel copiar o resumo')
    }
  }

  const totalPages = Math.ceil(total / limit)
  const lastUpdatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pedidos ({total})</h1>
            <p className="mt-1 text-sm text-gray-500">Acompanhe os pedidos recebidos pelo site de ofertas.</p>
          </div>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar cliente ou WhatsApp..."
              className="w-64 rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={event => { setDateFrom(event.target.value); setPage(1) }}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={event => { setDateTo(event.target.value); setPage(1) }}
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <select
              value={status}
              onChange={event => { setStatus(event.target.value); setPage(1) }}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Buscar</button>
            <button
              type="button"
              onClick={fetchOrders}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Atualizar
            </button>
          </form>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.value || 'all'}
              type="button"
              onClick={() => { setStatus(filter.value); setPage(1) }}
              className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-blue-300 ${status === filter.value ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}
            >
              <div className={`text-2xl font-bold ${filter.tone}`}>
                {filter.value ? statusCounts[filter.value] || 0 : statusCounts.total || 0}
              </div>
              <div className="mt-1 text-sm text-gray-500">{filter.label}</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-sm">
          <div>
            <span className="font-semibold text-gray-900">Monitoramento de pedidos</span>
            <span className="ml-2 text-gray-500">Ultima atualizacao: {lastUpdatedLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {newOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => setNewOrdersCount(0)}
                className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700"
              >
                {newOrdersCount} novo(s) pedido(s)
              </button>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={event => setAutoRefresh(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Atualizar a cada 30s
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {loading ? (
              <p className="p-8 text-center text-sm text-gray-500">Carregando pedidos...</p>
            ) : orders.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">Nenhum pedido encontrado.</p>
            ) : (
              <div className="divide-y">
                {orders.map(order => (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelected(order)}
                    className={`block w-full p-4 text-left transition hover:bg-gray-50 ${selected?.id === order.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                        <div className="mt-1 text-xs text-gray-400">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[order.status] || STATUS_CLASSES.pending}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                        <div className="mt-2 text-sm font-semibold text-gray-900">{formatMoney(order.total_estimated)}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t p-4">
                <button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page === 1}
                  className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Anterior</button>
                <span className="text-sm text-gray-500">{page} de {totalPages}</span>
                <button onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={page === totalPages}
                  className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50">Proxima</button>
              </div>
            )}
          </div>

          <aside className="rounded-lg bg-white p-5 shadow">
            {!selected ? (
              <p className="py-16 text-center text-sm text-gray-400">Selecione um pedido para ver os detalhes.</p>
            ) : (
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.customer_name}</h2>
                    <p className="text-sm text-gray-500">{selected.customer_phone}</p>
                    <p className="text-xs text-gray-400">{formatDate(selected.created_at)}</p>
                  </div>
                  <select
                    value={selected.status}
                    onChange={event => changeStatus(selected, event.target.value)}
                    className="rounded-lg border px-2 py-1 text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
                  <div><span className="text-gray-500">Loja:</span> {selected.store_name || 'Todas'}</div>
                  <div><span className="text-gray-500">Origem:</span> {selected.source || 'site'}</div>
                  <div><span className="text-gray-500">E-mail enviado:</span> {selected.email_sent ? 'Sim' : 'Nao'}</div>
                  {selected.customer_note && (
                    <div className="mt-2"><span className="text-gray-500">Obs:</span> {selected.customer_note}</div>
                  )}
                </div>

                <h3 className="mb-2 text-sm font-semibold text-gray-700">Itens</h3>
                <div className="space-y-2">
                  {(selected.items || []).map(item => (
                    <div key={item.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <div>
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          <div className="text-xs text-gray-400">{item.product_code || item.unit || '-'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.quantity}x</div>
                          <div className="text-xs text-gray-500">{formatMoney(item.unit_price_snapshot)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4 text-lg font-bold">
                  <span>Total estimado</span>
                  <span>{formatMoney(selected.total_estimated)}</span>
                </div>

                <div className="mt-5 border-t pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">Historico do pedido</h3>
                  {(selected.status_history || []).length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhum historico registrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {selected.status_history.map(history => (
                        <div key={history.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                {HISTORY_ACTIONS[history.action] || history.action}
                              </div>
                              <div className="text-gray-500">
                                {(history.from_status ? `${STATUS_LABELS[history.from_status] || history.from_status} -> ` : '')}
                                {STATUS_LABELS[history.to_status] || history.to_status}
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{formatDate(history.created_at)}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {history.actor_name || (history.source === 'site' ? 'Site publico' : 'Usuario nao identificado')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selected.whatsapp_url && (
                  <a
                    href={selected.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Abrir WhatsApp do pedido
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copySummary(selected)}
                  className="mt-2 w-full rounded-lg border px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Copiar resumo
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
