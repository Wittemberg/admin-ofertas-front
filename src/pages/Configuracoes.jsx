import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BrandingUpload from './BrandingUpload'

const TABS = [
  { id: 'geral', label: 'Geral' },
  { id: 'branding', label: 'Branding' }
]

function GeneralTabPlaceholder() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Configurações gerais</h2>
      <p className="mt-2 text-sm text-slate-500">
        Use esta aba para concentrar as demais configurações do tenant.
      </p>
      <p className="mt-4 text-sm text-slate-600">
        Se você já possui um formulário de configurações existente no projeto,
        renderize esse componente aqui.
      </p>
    </div>
  )
}

export default function Configuracoes() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab')
    const validTabs = new Set(TABS.map((item) => item.id))
    return validTabs.has(tab) ? tab : 'branding'
  }, [searchParams])

  function changeTab(tab) {
    setSearchParams({ tab })
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
          >
            ← Voltar ao dashboard
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500">
            Centralize aqui as configurações do tenant, incluindo identidade visual.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => changeTab(tab.id)}
                  className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {activeTab === 'branding' ? <BrandingUpload /> : null}
        {activeTab === 'geral' ? <GeneralTabPlaceholder /> : null}
      </div>
    </div>
  )
}