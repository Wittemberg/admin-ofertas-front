import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { uploadTenantBranding, updateTenantSettings } from '../api/tenant'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

const DEFAULT_COLORS = {
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#f59e0b',
  background: '#f8fafc',
  text: '#0f172a'
}

function withCacheBust(url) {
  if (!url) return null
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}t=${Date.now()}`
}

/* ----------------------- Componente do input de cor ----------------------- */
function EditableColorRow({ label, color, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded-lg cursor-pointer border border-slate-300 bg-transparent"
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>

      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        maxLength={7}
        className="font-mono text-sm text-slate-600 border border-slate-200 rounded-lg px-2 py-1 w-24 text-right"
      />
    </div>
  )
}

/* ----------------------- Preview visual ----------------------- */
function SitePreview({ colors, logoUrl, localPreview }) {
  const previewVars = useMemo(
    () => ({
      '--brand-primary': colors.primary,
      '--brand-secondary': colors.secondary,
      '--brand-accent': colors.accent,
      '--brand-background': colors.background,
      '--brand-text': colors.text
    }),
    [colors]
  )

  const activeLogo = localPreview || logoUrl

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={previewVars}
    >
      {/* Topo */}
      <div className="bg-[var(--brand-primary)] px-5 py-4">
        <div className="flex items-center gap-3">
          {activeLogo ? (
            <img
              src={activeLogo}
              alt="Logo"
              className="h-10 w-auto rounded bg-white p-1 object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-xs font-semibold text-slate-500">
              LOGO
            </div>
          )}

          <div>
            <p className="text-xs text-white/80">Preview do site</p>
            <h3 className="text-base font-semibold text-white">Minha Loja</h3>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="bg-[var(--brand-background)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--brand-text)]">Ofertas em destaque</h4>

          <span className="rounded-full bg-[var(--brand-secondary)] px-2 py-0.5 text-xs font-semibold text-white">
            Semana
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-[var(--brand-accent)] p-4" />

              <div className="space-y-1 p-3">
                <p className="text-xs font-semibold text-[var(--brand-text)]">Produto {item}</p>
                <p className="text-sm font-bold text-[var(--brand-secondary)]">
                  {item === 1 ? 'R$ 99,90' : 'R$ 149,90'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ----------------------- Componente Principal ----------------------- */
export default function BrandingUpload({ onBrandingApplied, currentSettings }) {
  const initialColors = useMemo(
    () => ({
      primary: currentSettings?.primary_color || DEFAULT_COLORS.primary,
      secondary: currentSettings?.secondary_color || DEFAULT_COLORS.secondary,
      accent: currentSettings?.accent_color || DEFAULT_COLORS.accent,
      background: currentSettings?.background_color || DEFAULT_COLORS.background,
      text: currentSettings?.text_color || DEFAULT_COLORS.text
    }),
    [currentSettings]
  )

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [colors, setColors] = useState(initialColors)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const fileInputRef = useRef(null)

  /* ----------------------- Sincronizar settings do backend ----------------------- */
  useEffect(() => {
    if (!currentSettings) return

    const remoteLogo = withCacheBust(currentSettings.logo_url)

    setLogoUrl(remoteLogo)

    if (!file) setPreview(remoteLogo)

    setColors(initialColors)
  }, [currentSettings, initialColors])

  /* ----------------------- Seleção / Drag & Drop ----------------------- */
  const handleFile = useCallback((selected) => {
    setError('')
    setStatusMessage('')

    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Formato inválido. Aceito PNG, JPG, SVG, WebP.')
      return
    }

    if (selected.size > MAX_SIZE) {
      setError('Arquivo muito grande. Máximo 2MB.')
      return
    }

    setFile(selected)

    const reader = new FileReader()
    reader.onload = (event) => setPreview(event.target?.result || null)
    reader.readAsDataURL(selected)
  }, [])

  /* ----------------------- Fluxo Síncrono da IA ----------------------- */
  const handleExtractColors = async () => {
    if (!file) return

    setExtracting(true)
    setError('')
    setStatusMessage('')

    try {
      const { data } = await uploadTenantBranding(file)

      const remoteLogo = withCacheBust(data.logo_url)

      setColors(data.palette)
      setLogoUrl(remoteLogo)
      setPreview(current => current || remoteLogo)

      setStatusMessage('Cores extraídas com sucesso!')

    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar branding')
    } finally {
      setExtracting(false)
    }
  }

  /* ----------------------- Aplicar manualmente ----------------------- */
  const handleApplyColors = async () => {
    setApplying(true)
    setError('')
    setStatusMessage('')

    try {
      const finalUrl =
        preview?.startsWith('data:') ? logoUrl : preview

      await updateTenantSettings({
        logo_url: finalUrl,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
        background_color: colors.background,
        text_color: colors.text
      })

      setStatusMessage('Configurações aplicadas com sucesso!')

      if (onBrandingApplied) await onBrandingApplied()

    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao aplicar configurações')
    } finally {
      setApplying(false)
      setFile(null)
    }
  }

  const dropzoneText = preview
    ? 'Clique para trocar a logo'
    : 'Arraste sua logo aqui ou clique para selecionar'

  /* ----------------------- Interface ----------------------- */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">🎨 Branding Inteligente com IA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Envie sua logo e personalize automaticamente as cores do seu tema.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Upload da logo</h3>
            <p className="text-xs text-slate-500">Formatos: PNG, JPG, SVG, WebP. Máx 2MB.</p>
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault()
              handleFile(e.dataTransfer.files?.[0])
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-blue-400 hover:bg-blue-50"
          >
            {preview ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-40 w-auto rounded-xl border bg-white p-3 shadow-sm object-contain"
                />

                <p className="text-xs text-slate-700">
                  {file?.name || 'Logo carregada'}
                </p>

                <p className="text-xs text-slate-400">{dropzoneText}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex h-12 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  ↑
                </div>
                <p className="text-xs font-medium text-slate-700">{dropzoneText}</p>
                <p className="text-xs text-slate-400">
                  A paleta será sugerida automaticamente.
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={ALLOWED_TYPES.join(',')}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && <div className="mt-3 text-xs text-red-600">{error}</div>}
          {statusMessage && (
            <div className="mt-3 text-xs text-green-600">{statusMessage}</div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleExtractColors}
              disabled={!file || extracting}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {extracting ? 'Processando...' : 'Gerar paleta com IA'}
            </button>

            <button
              onClick={handleApplyColors}
              disabled={extracting || applying}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-400"
            >
              {applying ? 'Salvando...' : 'Aplicar configurações'}
            </button>
          </div>
        </div>

        {/* Paleta */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900 mb-2">Paleta de cores</h3>

          <EditableColorRow
            label="Primary"
            color={colors.primary}
            onChange={(v) => setColors({ ...colors, primary: v })}
          />

          <EditableColorRow
            label="Secondary"
            color={colors.secondary}
            onChange={(v) => setColors({ ...colors, secondary: v })}
          />

          <EditableColorRow
            label="Accent"
            color={colors.accent}
            onChange={(v) => setColors({ ...colors, accent: v })}
          />

          <EditableColorRow
            label="Background"
            color={colors.background}
            onChange={(v) => setColors({ ...colors, background: v })}
          />

          <EditableColorRow
            label="Text"
            color={colors.text}
            onChange={(v) => setColors({ ...colors, text: v })}
          />
        </div>

        {/* Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm col-span-2 lg:col-span-1">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Preview visual</h3>

          <SitePreview
            colors={colors}
            logoUrl={logoUrl}
            localPreview={preview}
          />
        </div>
      </div>
    </div>
  )
}
