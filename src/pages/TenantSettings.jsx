import { useState, useEffect } from 'react'
import { getTenantSettings, updateTenantSettings, uploadTenantLogo } from '../api/tenant'

const TABS = [
  { id: 'info', label: '📋 Informações' },
  { id: 'contact', label: '📞 Contato' },
  { id: 'address', label: '📍 Endereço' },
  { id: 'branding', label: '🎨 Branding' },
  { id: 'social', label: '🔗 Redes' },
  { id: 'hours', label: '🕐 Horários' }
]

const DEFAULT_SOCIAL = { instagram: '', facebook: '', youtube: '', tiktok: '' }
const DEFAULT_HOURS = [
  { day: 'Segunda', open: '08:00', close: '18:00' },
  { day: 'Terça', open: '08:00', close: '18:00' },
  { day: 'Quarta', open: '08:00', close: '18:00' },
  { day: 'Quinta', open: '08:00', close: '18:00' },
  { day: 'Sexta', open: '08:00', close: '18:00' },
  { day: 'Sábado', open: '08:00', close: '12:00' },
  { day: 'Domingo', open: '', close: '' }
]

export default function TenantSettings() {
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [settings, setSettings] = useState({
    name: '', description: '', domain: '',
    contact_phone: '', contact_email: '', contact_whatsapp: '',
    address_street: '', address_number: '', address_city: '', address_state: '', address_zip: '',
    logo_url: '',
    primary_color: '#2563eb', secondary_color: '#1e40af',
    accent_color: '#f59e0b', background_color: '#ffffff', text_color: '#1a1a1a',
    social_media: { ...DEFAULT_SOCIAL },
    opening_hours: [...DEFAULT_HOURS],
    font_family: "'Inter', sans-serif"
  })

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const res = await getTenantSettings()
      const data = res.data
      if (data) {
        setSettings(prev => ({
          ...prev,
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
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#2563eb',
          secondary_color: data.secondary_color || '#1e40af',
          accent_color: data.accent_color || '#f59e0b',
          background_color: data.background_color || '#ffffff',
          text_color: data.text_color || '#1a1a1a',
          social_media: { ...DEFAULT_SOCIAL, ...(data.social_media || {}) },
          opening_hours: data.opening_hours?.length ? data.opening_hours : [...DEFAULT_HOURS],
          font_family: data.font_family || "'Inter', sans-serif"
        }))
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage(null)
      await updateTenantSettings({
        name: settings.name,
        description: settings.description,
        domain: settings.domain,
        contact_phone: settings.contact_phone,
        contact_email: settings.contact_email,
        contact_whatsapp: settings.contact_whatsapp,
        address_street: settings.address_street,
        address_number: settings.address_number,
        address_city: settings.address_city,
        address_state: settings.address_state,
        address_zip: settings.address_zip,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        background_color: settings.background_color,
        text_color: settings.text_color,
        social_media: settings.social_media,
        opening_hours: settings.opening_hours,
        font_family: settings.font_family
      })
      setMessage({ type: 'success', text: '✅ Configurações salvas com sucesso!' })
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao salvar: ' + (err.response?.data?.error || err.message || 'Erro desconhecido') })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadTenantLogo(file)
      setSettings(prev => ({ ...prev, logo_url: res.data.logo_url }))
      setMessage({ type: 'success', text: '✅ Logo enviada com sucesso!' })
    } catch (err) {
      setMessage({ type: 'error', text: '❌ Erro ao enviar logo: ' + (err.response?.data?.error || err.message) })
    }
  }

  function updateField(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  function updateSocial(platform, value) {
    setSettings(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [platform]: value }
    }))
  }

  function updateHour(index, field, value) {
    const hours = [...settings.opening_hours]
    hours[index] = { ...hours[index], [field]: value }
    setSettings(prev => ({ ...prev, opening_hours: hours }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Carregando configurações...</p>
      </div>
    )
  }

  const previewStyle = {
    fontFamily: settings.font_family,
    backgroundColor: settings.background_color,
    color: settings.text_color,
    '--primary': settings.primary_color,
    '--secondary': settings.secondary_color,
    '--accent': settings.accent_color
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">⚙️ Configurações da Empresa</h1>

        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Abas */}
        <div className="flex flex-wrap gap-1 mb-6 border-b bg-white rounded-t-lg p-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">

          {activeTab === 'info' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">📋 Informações Gerais</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input type="text" value={settings.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Tagline</label>
                <textarea value={settings.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={3} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domínio do Site Público</label>
                <input type="text" value={settings.domain}
                  onChange={e => updateField('domain', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="meusupermercado.com.br" />
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">📞 Contato</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={settings.contact_phone}
                  onChange={e => updateField('contact_phone', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="(61) 99999-9999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={settings.contact_email}
                  onChange={e => updateField('contact_email', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="contato@meusupermercado.com.br" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="text" value={settings.contact_whatsapp}
                  onChange={e => updateField('contact_whatsapp', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="5561999999999 (DDI + DDD + número)" />
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">📍 Endereço</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                  <input type="text" value={settings.address_street}
                    onChange={e => updateField('address_street', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                  <input type="text" value={settings.address_number}
                    onChange={e => updateField('address_number', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input type="text" value={settings.address_city}
                    onChange={e => updateField('address_city', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input type="text" value={settings.address_state}
                    onChange={e => updateField('address_state', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" maxLength={2} placeholder="DF" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <input type="text" value={settings.address_zip}
                    onChange={e => updateField('address_zip', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="70000-000" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">🎨 Identidade Visual</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Empresa</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {settings.logo_url
                      ? <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      : <span className="text-gray-400 text-sm text-center px-2">Sem logo</span>}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm inline-block">
                      📤 Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG ou SVG. Máx 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.primary_color}
                      onChange={e => updateField('primary_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border" />
                    <input type="text" value={settings.primary_color}
                      onChange={e => updateField('primary_color', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.secondary_color}
                      onChange={e => updateField('secondary_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border" />
                    <input type="text" value={settings.secondary_color}
                      onChange={e => updateField('secondary_color', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Destaque</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.accent_color}
                      onChange={e => updateField('accent_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border" />
                    <input type="text" value={settings.accent_color}
                      onChange={e => updateField('accent_color', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fundo</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.background_color}
                      onChange={e => updateField('background_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border" />
                    <input type="text" value={settings.background_color}
                      onChange={e => updateField('background_color', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                  <div className="flex gap-2">
                    <input type="color" value={settings.text_color}
                      onChange={e => updateField('text_color', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border" />
                    <input type="text" value={settings.text_color}
                      onChange={e => updateField('text_color', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                <select value={settings.font_family}
                  onChange={e => updateField('font_family', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  <option value="'Inter', sans-serif">Inter (Padrão)</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Poppins', sans-serif">Poppins</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Merriweather', serif">Merriweather</option>
                </select>
              </div>

              {/* Preview ao vivo */}
              <div className="mt-6 p-4 rounded-lg border" style={previewStyle}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--primary)' }}>👁️ Preview do Site</h3>
                <div className="flex items-center gap-3 mb-3">
                  {settings.logo_url && <img src={settings.logo_url} alt="" className="h-10" />}
                  <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{settings.name || 'Nome da Empresa'}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--secondary)' }}>{settings.description || 'Descrição da empresa aparecerá aqui.'}</p>
                <button className="mt-2 px-4 py-2 rounded-lg text-sm text-white transition"
                  style={{ backgroundColor: 'var(--primary)' }}>
                  Saiba Mais
                </button>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">🔗 Redes Sociais</h2>
              {Object.entries(DEFAULT_SOCIAL).map(([platform, _]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {platform === 'tiktok' ? 'TikTok' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  <input type="text" value={settings.social_media[platform] || ''}
                    onChange={e => updateSocial(platform, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder={`https://${platform}.com/...`} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">🕐 Horários de Funcionamento</h2>
              <p className="text-sm text-gray-500 mb-4">Deixe os horários vazios para indicar que a loja não abre no dia.</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-2">Dia</th>
                      <th className="pb-2">Abertura</th>
                      <th className="pb-2">Fechamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.opening_hours.map((hour, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 font-medium">{hour.day}</td>
                        <td className="py-3">
                          <input type="time" value={hour.open}
                            onChange={e => updateHour(i, 'open', e.target.value)}
                            className="border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500" />
                        </td>
                        <td className="py-3">
                          <input type="time" value={hour.close}
                            onChange={e => updateHour(i, 'close', e.target.value)}
                            className="border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow">
            {saving ? '💾 Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  )
}