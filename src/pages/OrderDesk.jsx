import { useEffect, useRef, useState } from 'react'
import { getOrders, updateOrderStatus } from '../api/orders'
import { getErrorMessage } from '../api/errors'
import { MessageBanner } from '../components/Feedback'

const STATUS_LABELS = {
  pending: 'Pendente',
  processing: 'Em atendimento',
  completed: 'Concluido',
  cancelled: 'Cancelado'
}

const STATUS_BADGES = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
}

function formatMoney(value) {
  if (!value) return '-'
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function todayIsoDate() {
  return new Date().toISOString().split('T')[0]
}

function sumOrders(orders) {
  return orders.reduce((sum, order) => sum + Number(order.total_estimated || 0), 0)
}

function playAlert() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(740, context.currentTime)
    oscillator.frequency.setValueAtTime(980, context.currentTime + 0.14)
    gain.gain.setValueAtTime(0.001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.42)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.45)
  } catch {
    // Audio can be blocked before the first user interaction.
  }
}

function orderSummary(order) {
  const lines = [
    'Novo pedido - Site de Ofertas',
    `Cliente: ${order.customer_name || '-'}`,
    `WhatsApp: ${order.customer_phone || '-'}`,
    `Loja: ${order.store_name || 'Todas'}`,
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

export default function OrderDesk() {
  const [pendingOrders, setPendingOrders] = useState([])
  const [processingOrders, setProcessingOrders] = useState([])
  const [completedToday, setCompletedToday] = useState([])
  const [cancelledToday, setCancelledToday] = useState([])
  const [closingView, setClosingView] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(null)
  const [newOrders, setNewOrders] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const latestOrderDateRef = useRef(null)
  const initialLoadDoneRef = useRef(false)

  const fetchDesk = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const today = todayIsoDate()
      const [pendingResponse, processingResponse, completedResponse, cancelledResponse] = await Promise.all([
        getOrders({ status: 'pending', limit: 50 }),
        getOrders({ status: 'processing', limit: 50 }),
        getOrders({ status: 'completed', date_from: today, date_to: today, limit: 100 }),
        getOrders({ status: 'cancelled', date_from: today, date_to: today, limit: 100 })
      ])

      const nextPending = pendingResponse.data.orders || []
      const nextProcessing = processingResponse.data.orders || []
      setPendingOrders(nextPending)
      setProcessingOrders(nextProcessing)
      setCompletedToday(completedResponse.data.orders || [])
      setCancelledToday(cancelledResponse.data.orders || [])
      setLastUpdatedAt(new Date())

      const newestDate = [...nextPending, ...nextProcessing]
        .map(order => order.created_at)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0] || null
      if (newestDate) {
        const previousDate = latestOrderDateRef.current
        if (initialLoadDoneRef.current && previousDate && new Date(newestDate) > new Date(previousDate)) {
          const incoming = [...nextPending, ...nextProcessing]
            .filter(order => new Date(order.created_at) > new Date(previousDate)).length
          setNewOrders(current => current + incoming)
          if (soundEnabled) playAlert()
        }
        latestOrderDateRef.current = newestDate
      } else if (!initialLoadDoneRef.current) {
        latestOrderDateRef.current = new Date().toISOString()
      }
      initialLoadDoneRef.current = true
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar atendimento'))
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesk()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      fetchDesk({ silent: true })
    }, 15000)
    return () => clearInterval(timer)
  }, [soundEnabled])

  const changeStatus = async (order, status) => {
    try {
      await updateOrderStatus(order.id, status)
      setMessage({ type: 'success', text: 'Status do pedido atualizado.' })
      await fetchDesk({ silent: true })
    } catch (err) {
      setMessage({ type: 'error', text: getErrorMessage(err, 'Erro ao atualizar status') })
    }
  }

  const copy = async (order) => {
    try {
      await navigator.clipboard.writeText(orderSummary(order))
      setMessage({ type: 'success', text: 'Resumo copiado.' })
    } catch {
      setMessage({ type: 'warning', text: 'Nao foi possivel copiar.' })
    }
  }

  const lastUpdatedLabel = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '-'
  const closingOrders = closingView === 'completed' ? completedToday : closingView === 'cancelled' ? cancelledToday : []
  const closingTitle = closingView === 'completed' ? 'Concluidos hoje' : closingView === 'cancelled' ? 'Cancelados hoje' : ''

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
              &larr; Voltar ao Dashboard
            </a>
            <h1 className="text-3xl font-bold text-slate-950">Atendimento</h1>
            <p className="mt-1 text-sm text-slate-500">Mesa rapida para acompanhar pedidos novos e em preparo.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {newOrders > 0 && (
              <button
                type="button"
                onClick={() => setNewOrders(0)}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {newOrders} novo(s)
              </button>
            )}
            <label className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={event => setSoundEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Som
            </label>
            <button
              type="button"
              onClick={() => fetchDesk()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        </div>

        <div className="mb-5 rounded-lg border bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Atualizacao automatica a cada 15s. Ultima atualizacao: {lastUpdatedLabel}
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <ClosingShortcut
            label="Concluidos hoje"
            orders={completedToday}
            active={closingView === 'completed'}
            color="emerald"
            onClick={() => setClosingView(closingView === 'completed' ? '' : 'completed')}
          />
          <ClosingShortcut
            label="Cancelados hoje"
            orders={cancelledToday}
            active={closingView === 'cancelled'}
            color="red"
            onClick={() => setClosingView(closingView === 'cancelled' ? '' : 'cancelled')}
          />
        </div>

        {closingView && (
          <section className="mb-6 rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{closingTitle}</h2>
                <p className="text-sm text-slate-500">
                  {closingOrders.length} pedido(s), total estimado {formatMoney(sumOrders(closingOrders))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClosingView('')}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Voltar para operacao
              </button>
            </div>

            {closingOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                Nenhum pedido neste grupo hoje.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {closingOrders.map(order => (
                  <ClosingOrderCard key={order.id} order={order} onCopy={copy} />
                ))}
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <MessageBanner message={message} className="mb-5" />

        {loading ? (
          <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow">Carregando atendimento...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <OrderColumn
              title="Novos pedidos"
              orders={pendingOrders}
              empty="Nenhum pedido pendente."
              nextLabel="Iniciar atendimento"
              nextStatus="processing"
              onStatus={changeStatus}
              onCopy={copy}
            />
            <OrderColumn
              title="Em atendimento"
              orders={processingOrders}
              empty="Nenhum pedido em atendimento."
              nextLabel="Concluir pedido"
              nextStatus="completed"
              onStatus={changeStatus}
              onCopy={copy}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ClosingShortcut({ label, orders, active, color, onClick }) {
  const colorClasses = color === 'emerald'
    ? active ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50'
    : active ? 'border-red-400 bg-red-50 text-red-800' : 'border-red-100 bg-white text-red-700 hover:bg-red-50'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left shadow-sm transition ${colorClasses}`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-bold">{orders.length}</div>
      <div className="mt-1 text-sm opacity-80">{formatMoney(sumOrders(orders))}</div>
    </button>
  )
}

function ClosingOrderCard({ order, onCopy }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-bold text-slate-950">{order.customer_name}</div>
          <div className="text-sm text-slate-500">{order.customer_phone}</div>
          <div className="mt-1 text-xs text-slate-400">Recebido as {formatTime(order.created_at)}</div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGES[order.status] || STATUS_BADGES.pending}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>
      <div className="mb-3 text-sm text-slate-600">
        Loja: {order.store_name || 'Todas'} | Total: <strong>{formatMoney(order.total_estimated)}</strong>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy(order)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Copiar resumo
        </button>
        {order.whatsapp_url && (
          <a
            href={order.whatsapp_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Abrir WhatsApp
          </a>
        )}
      </div>
    </article>
  )
}

function OrderColumn({ title, orders, empty, nextLabel, nextStatus, onStatus, onCopy }) {
  return (
    <section className="min-h-[560px] rounded-lg bg-white p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{orders.length}</span>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          {empty}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              nextLabel={nextLabel}
              nextStatus={nextStatus}
              onStatus={onStatus}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function OrderCard({ order, nextLabel, nextStatus, onStatus, onCopy }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-lg font-bold text-slate-950">{order.customer_name}</div>
          <div className="text-sm text-slate-500">{order.customer_phone}</div>
          <div className="mt-1 text-xs text-slate-400">Recebido as {formatTime(order.created_at)}</div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGES[order.status] || STATUS_BADGES.pending}`}>
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="mb-3 rounded-lg bg-white p-3 text-sm">
        <div className="font-medium text-slate-700">Loja: {order.store_name || 'Todas'}</div>
        {order.customer_note && <div className="mt-1 text-slate-500">Obs: {order.customer_note}</div>}
      </div>

      <div className="space-y-2">
        {(order.items || []).map(item => (
          <div key={item.id} className="flex justify-between gap-3 rounded-lg bg-white p-3 text-sm">
            <div>
              <div className="font-semibold text-slate-900">{item.product_name}</div>
              <div className="text-xs text-slate-400">{item.product_code || item.unit || '-'}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-950">{item.quantity}x</div>
              <div className="text-xs text-slate-500">{formatMoney(item.unit_price_snapshot)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-lg font-bold">
        <span>Total</span>
        <span>{formatMoney(order.total_estimated)}</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onStatus(order, nextStatus)}
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {nextLabel}
        </button>
        <button
          type="button"
          onClick={() => onCopy(order)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Copiar resumo
        </button>
        {order.whatsapp_url && (
          <a
            href={order.whatsapp_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 sm:col-span-2"
          >
            Abrir WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={() => onStatus(order, 'cancelled')}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 sm:col-span-2"
        >
          Cancelar
        </button>
      </div>
    </article>
  )
}
