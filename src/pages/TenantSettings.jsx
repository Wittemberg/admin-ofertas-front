import { useEffect, useState } from 'react'
import { getTenantSettings, updateTenantSettings } from '../api/tenant'
import BrandingUpload from './BrandingUpload'

const DEFAULT_FORM = {
  name: '',
  description: '',
  domain: '',
  contact_phone: '',
  contact_email: '',
  contact_whatsapp: '',
  address_street: '',
  address_number: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  font_family: "'Inter', sans-serif"
}

export default function TenantSettings() {
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const loadSettings = async () => {
    setLoading(true)
    setError('')

    try {
      const { data } = await getTenantSettings()
      setSettings(data)
      setForm({
        ...DEFAULT_FORM,
        name: data.name || '',
        description: data.description || '',
        domain: data.domain || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        contact_whatsapp: data.contact_whatsapp || '',
        address_street: data.address_street || '',
        address_number: data.address_number || '',
        address_city: data.address_city || '',
        address_state: data.address_state || '',
        address_zip: data.address_zip || '',
        font_family: data.font_family || DEFAULT_FORM.font_family
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar configuracoes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadSettings)
  }, [])

  const updateField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setStatus('')

    try {
      const { data } = await updateTenantSettings(form)
      setSettings(data.settings)
      setStatus('Configuracoes salvas com sucesso.')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar configuracoes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl text-slate-500">Carregando configuracoes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Voltar ao Dashboard</a>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Configuracoes da empresa</h1>
            <p className="text-sm text-slate-500">Dados usados no painel e no site publico de ofertas.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {status && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 rounded-lg bg-white p-6 shadow">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Informacoes</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Nome da empresa" value={form.name} onChange={value => updateField('name', value)} required />
              <Field label="Dominio publico" value={form.domain} onChange={value => updateField('domain', value)} placeholder="ofertas.exemplo.com.br" />
              <Field
                label="Descricao"
                value={form.description}
                onChange={value => updateField('description', value)}
                className="md:col-span-2"
                multiline
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Contato</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Telefone" value={form.contact_phone} onChange={value => updateField('contact_phone', value)} />
              <Field label="E-mail" type="email" value={form.contact_email} onChange={value => updateField('contact_email', value)} />
              <Field label="WhatsApp" value={form.contact_whatsapp} onChange={value => updateField('contact_whatsapp', value)} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Endereco</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-6">
              <Field label="Rua" value={form.address_street} onChange={value => updateField('address_street', value)} className="md:col-span-3" />
              <Field label="Numero" value={form.address_number} onChange={value => updateField('address_number', value)} />
              <Field label="Cidade" value={form.address_city} onChange={value => updateField('address_city', value)} />
              <Field label="Estado" value={form.address_state} onChange={value => updateField('address_state', value)} />
              <Field label="CEP" value={form.address_zip} onChange={value => updateField('address_zip', value)} className="md:col-span-2" />
              <Field label="Fonte do site" value={form.font_family} onChange={value => updateField('font_family', value)} className="md:col-span-4" />
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {saving ? 'Salvando...' : 'Salvar configuracoes'}
            </button>
          </div>
        </form>

        <div className="rounded-lg bg-white p-6 shadow">
          <BrandingUpload currentSettings={settings} onBrandingApplied={loadSettings} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, multiline = false, placeholder = '', className = '' }) {
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          rows="3"
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  )
}
