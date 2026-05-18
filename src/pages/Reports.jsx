import { useState } from 'react'
import api from '../api/axios'

const REPORTS = [
  {
    key: 'active-offers',
    title: 'Ofertas Vigentes',
    desc: 'Todas as ofertas ativas com produto, loja, preços e validade',
    icon: '🏷️',
    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
  },
  {
    key: 'without-offers',
    title: 'Produtos sem Oferta',
    desc: 'Produtos cadastrados que não possuem nenhuma oferta ativa',
    icon: '📦',
    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
  },
  {
    key: 'inactive-stores',
    title: 'Filiais Inativas',
    desc: 'Lojas desativadas no sistema',
    icon: '🏪',
    color: 'bg-red-50 text-red-700 hover:bg-red-100'
  }
]

function exportToExcel(data, filename) {
  const BOM = '\uFEFF'
  const headers = Object.keys(data[0] || {})
  const csvRows = [headers.join(';')]
  data.forEach(row => {
    const values = headers.map(h => {
      const val = row[h] || ''
      return String(val).replace(/;/g, ',')
    })
    csvRows.push(values.join(';'))
  })
  const csvContent = BOM + csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [loading, setLoading] = useState({})

  const handleExport = async (report) => {
    setLoading(prev => ({ ...prev, [report.key]: true }))
    try {
      const res = await api.get(`/reports/${report.key}`)
      const data = res.data || []
      if (data.length === 0) {
        alert('Nenhum dado encontrado para este relatório')
        return
      }
      exportToExcel(data, report.title)
    } catch {
      alert('Erro ao gerar relatório')
    } finally {
      setLoading(prev => ({ ...prev, [report.key]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          &larr; Voltar ao Dashboard
        </a>
        <h1 className="text-2xl font-bold mb-6">Exportação de Relatórios</h1>

        <div className="grid gap-4">
          {REPORTS.map(report => (
            <div key={report.key}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{report.icon}</span>
                  <h2 className="text-lg font-semibold">{report.title}</h2>
                </div>
                <p className="text-gray-500 text-sm mt-1">{report.desc}</p>
              </div>
              <button onClick={() => handleExport(report)}
                disabled={loading[report.key]}
                className={`px-6 py-2 rounded-lg font-medium transition ${report.color} disabled:opacity-50`}>
                {loading[report.key] ? 'Gerando...' : '📥 Baixar CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}