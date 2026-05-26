import { useEffect, useState } from 'react'
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

function formatMoney(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('pt-BR')
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const limit = 20

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getOrders({
        page,
        limit,
        status: status || undefined,
        search: search || undefined
      })
      setOrders(data.orders || [])
      setTotal(data.total || 0)
      if (selected?.id) {
        const updated = (data.orders || []).find(order => order.id === selected.id)
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
  }, [page, status])

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
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const totalPages = Math.ceil(total / limit)

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
          </form>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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

                {selected.whatsapp_url && (
                  <a
                    href={selected.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 block rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Abrir WhatsApp
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
