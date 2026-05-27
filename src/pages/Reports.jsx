import { useState } from 'react'
import api from '../api/axios'

const REPORTS = [
  {
    group: 'Operacao sem API',
    items: [
      {
        key: 'orders',
        title: 'Pedidos do Site',
        desc: 'Pedidos recebidos pelo carrinho, com cliente, WhatsApp, status, loja e total estimado.',
        icon: 'Pedidos',
        color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      },
      {
        key: 'order-items',
        title: 'Itens dos Pedidos',
        desc: 'Cada produto pedido em uma linha, pronto para conferencia ou digitacao em ERP.',
        icon: 'Itens',
        color: 'bg-teal-50 text-teal-700 hover:bg-teal-100'
      },
      {
        key: 'order-status-history',
        title: 'Historico de Status',
        desc: 'Auditoria das mudancas de status dos pedidos, com origem, usuario e horario.',
        icon: 'Auditoria',
        color: 'bg-slate-50 text-slate-700 hover:bg-slate-100'
      },
      {
        key: 'cart-sessions',
        title: 'Carrinhos e Abandonos',
        desc: 'Listas iniciadas no site, ativas, convertidas ou abandonadas, com dados do cliente.',
        icon: 'Carrinhos',
        color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
      },
      {
        key: 'order-summary',
        title: 'Resumo de Pedidos',
        desc: 'Indicadores do dia e ranking de produtos mais pedidos.',
        icon: 'Resumo',
        color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
      }
    ]
  },
  {
    group: 'Catalogo e ofertas',
    items: [
      {
        key: 'active-offers',
        title: 'Ofertas Vigentes',
        desc: 'Todas as ofertas ativas com produto, loja, precos e validade.',
        icon: 'Ofertas',
        color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
      },
      {
        key: 'products',
        title: 'Catalogo de Produtos',
        desc: 'Todos os produtos cadastrados, ativos e inativos, com categoria e imagem.',
        icon: 'Produtos',
        color: 'bg-sky-50 text-sky-700 hover:bg-sky-100'
      },
      {
        key: 'stores',
        title: 'Lojas',
        desc: 'Cadastro completo das lojas, inclusive inativas.',
        icon: 'Lojas',
        color: 'bg-green-50 text-green-700 hover:bg-green-100'
      },
      {
        key: 'categories',
        title: 'Categorias',
        desc: 'Cadastro de categorias para conferencia e carga manual.',
        icon: 'Categorias',
        color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
      },
      {
        key: 'without-offers',
        title: 'Produtos sem Oferta',
        desc: 'Produtos ativos que nao possuem nenhuma oferta ativa.',
        icon: 'Sem oferta',
        color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      },
      {
        key: 'inactive-stores',
        title: 'Filiais Inativas',
        desc: 'Lojas desativadas no sistema.',
        icon: 'Inativas',
        color: 'bg-red-50 text-red-700 hover:bg-red-100'
      }
    ]
  }
]

const FILTERED_REPORTS = new Set(['orders', 'order-items', 'order-status-history', 'cart-sessions', 'order-summary'])

function exportToCsv(data, filename) {
  const BOM = '\uFEFF'
  const headers = Object.keys(data[0] || {})
  const csvRows = [headers.join(';')]

  data.forEach(row => {
    const values = headers.map(header => {
      const raw = row[header] ?? ''
      const value = String(raw).replace(/"/g, '""')
      return `"${value.replace(/;/g, ',')}"`
    })
    csvRows.push(values.join(';'))
  })

  const csvContent = BOM + csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${filename}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [loading, setLoading] = useState({})
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    order_status: '',
    cart_status: ''
  })

  const handleExport = async (report) => {
    setLoading(prev => ({ ...prev, [report.key]: true }))
    try {
      const params = {}
      if (FILTERED_REPORTS.has(report.key)) {
        if (filters.date_from) params.date_from = filters.date_from
        if (filters.date_to) params.date_to = filters.date_to
        if (['orders', 'order-items', 'order-status-history'].includes(report.key) && filters.order_status) {
          params.status = filters.order_status
        }
        if (report.key === 'cart-sessions' && filters.cart_status) {
          params.status = filters.cart_status
        }
      }

      const res = await api.get(`/reports/${report.key}`, { params })
      const data = res.data || []
      if (data.length === 0) {
        alert('Nenhum dado encontrado para este relatorio')
        return
      }
      exportToCsv(data, report.title)
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao gerar relatorio')
    } finally {
      setLoading(prev => ({ ...prev, [report.key]: false }))
    }
  }

  const updateFilter = (field, value) => {
    setFilters(current => ({ ...current, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="mb-2 inline-block text-sm text-blue-600 hover:text-blue-800">
          &larr; Voltar ao Dashboard
        </a>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Exportacao de Relatorios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Arquivos CSV para operacao manual, conferencia e integracao com sistemas sem API.
          </p>
        </div>

        <section className="mb-8 rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold">Filtros de pedidos e carrinhos</h2>
          <p className="mt-1 text-sm text-gray-500">
            Aplicados aos relatorios de pedidos, itens, carrinhos e resumo.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Data inicial</span>
              <input
                type="date"
                value={filters.date_from}
                onChange={event => updateFilter('date_from', event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Data final</span>
              <input
                type="date"
                value={filters.date_to}
                onChange={event => updateFilter('date_to', event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Status do pedido</span>
              <select
                value={filters.order_status}
                onChange={event => updateFilter('order_status', event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="processing">Em atendimento</option>
                <option value="completed">Concluido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium text-gray-700">Status do carrinho</span>
              <select
                value={filters.cart_status}
                onChange={event => updateFilter('cart_status', event.target.value)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="active">Ativo</option>
                <option value="converted">Convertido</option>
                <option value="abandoned">Abandonado</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={() => setFilters({ date_from: '', date_to: '', order_status: '', cart_status: '' })}
            className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpar filtros
          </button>
        </section>

        <div className="space-y-8">
          {REPORTS.map(group => (
            <section key={group.group}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{group.group}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map(report => (
                  <div key={report.key} className="flex flex-col justify-between rounded-lg bg-white p-6 shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{report.icon}</span>
                        <h3 className="text-lg font-semibold">{report.title}</h3>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{report.desc}</p>
                    </div>
                    <button
                      onClick={() => handleExport(report)}
                      disabled={loading[report.key]}
                      className={`mt-5 rounded-lg px-6 py-2 text-sm font-medium transition ${report.color} disabled:opacity-50`}
                    >
                      {loading[report.key] ? 'Gerando...' : 'Baixar CSV'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
