import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { uploadTenantBranding, getBrandingStatus, updateTenantSettings } from '../api/tenant'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
const MAX_SIZE = 2 * 1024 * 1024

const DEFAULT_COLORS = {
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#f59e0b',
  background: '#f8fafc',
  text: '#0f172a'
}

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
        className="font-mono text-sm text-slate-600 border border-slate-200 rounded-lg px-2 py-1 w-24 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  )
}

function SitePreview({ colors, logoUrl }) {
  const previewVars = useMemo(() => ({
    '--brand-primary': colors.primary,
    '--brand-secondary': colors.secondary,
    '--brand-accent': colors.accent,
    '--brand-background': colors.background,
    '--brand-text': colors.text
  }), [colors])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={previewVars}>
      <div className="bg-[var(--brand-primary)] px-5 py-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-10 w-auto rounded bg-white p-1" />
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

      <div className="bg-[var(--brand-background)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--brand-text)]">Ofertas em destaque</h4>
          <span className="rounded-full bg-[var(--brand-secondary)] px-2 py-0.5 text-xs font-semibold text-white">
            Semana
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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

export default function BrandingUpload({ onBrandingApplied, currentSettings }) {
  // Se já existirem cores salvas no tenant, usamos elas como ponto de partida.
  // Caso contrário, usamos a paleta padrão (DEFAULT_COLORS).
  const initialColors = useMemo(() => {
    if (currentSettings?.primary_color) {
      return {
        primary: currentSettings.primary_color,
        secondary: currentSettings.secondary_color || DEFAULT_COLORS.secondary,
        accent: currentSettings.accent_color || DEFAULT_COLORS.accent,
        background: currentSettings.background_color || DEFAULT_COLORS.background,
        text: currentSettings.text_color || DEFAULT_COLORS.text
      }
    }
    return DEFAULT_COLORS;
  }, [currentSettings]);

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(currentSettings?.logo_url || null)
  const [logoUrl, setLogoUrl] = useState(currentSettings?.logo_url || null)
  const [extracting, setExtracting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [colors, setColors] = useState(initialColors)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Sincroniza o estado se as configurações do tenant mudarem externamente
  useEffect(() => {
    if (currentSettings?.primary_color) {
      setColors({
        primary: currentSettings.primary_color,
        secondary: currentSettings.secondary_color,
        accent: currentSettings.accent_color,
        background: currentSettings.background_color,
        text: currentSettings.text_color
      });
    }
    if (currentSettings?.logo_url) {
      setPreview(currentSettings.logo_url);
      setLogoUrl(currentSettings.logo_url);
    }
  }, [currentSettings]);

  const fileInputRef = useRef(null)
  const pollRef = useRef(null)

  const reset = useCallback(() => {
    setFile(null)
    setPreview(null)
    setLogoUrl(null)
    setExtracting(false)
    setApplying(false)
    setColors(DEFAULT_COLORS)
    setError('')
    setStatusMessage('')
    if (pollRef.current) clearTimeout(pollRef.current)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleFile = useCallback((selectedFile) => {
    setError('')
    setStatusMessage('')

    if (!selectedFile) return

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Formato inválido. Aceito: PNG, JPG, SVG ou WebP.')
      return
    }

    if (selectedFile.size > MAX_SIZE) {
      setError('Arquivo muito grande. Máximo 2MB.')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (event) => setPreview(event.target?.result || null)
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleExtractColors = async () => {
    if (!file) return

    setError('')
    setStatusMessage('')
    setExtracting(true)
    setColors(DEFAULT_COLORS)

    try {
      const { data } = await uploadTenantBranding(file)
      const jobId = data.job_id
      setLogoUrl(data.logo_url)

      let attempts = 0

      const poll = async () => {
        attempts += 1

        try {
          const { data: job } = await getBrandingStatus(jobId)

          if (job.status === 'completed') {
            setColors(job.colors || DEFAULT_COLORS)
            setLogoUrl(job.logo_url || data.logo_url || null)
            setExtracting(false)
            setStatusMessage('Cores sugeridas com sucesso! Você pode ajustá-las abaixo antes de aplicar.')
            return
          }

          if (job.status === 'failed') {
            setExtracting(false)
            setError(job.error || 'Falha na extração. Usando paleta padrão.')
            return
          }

          if (attempts >= 15) {
            setExtracting(false)
            setError('Tempo limite excedido. Usando paleta padrão.')
            return
          }

          pollRef.current = setTimeout(poll, 2000)
        } catch (pollErr) {
          setExtracting(false)
          setError('Erro no polling: ' + pollErr.message)
        }
      }

      poll()
    } catch (uploadErr) {
      setExtracting(false)
      setError('Erro no upload: ' + uploadErr.message)
    }
  }

  const handleColorChange = (key, value) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyColors = async () => {
    try {
      setApplying(true)
      setError('')
      setStatusMessage('')

      await updateTenantSettings({
        logo_url: logoUrl,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        accent_color: colors.accent,
        background_color: colors.background,
        text_color: colors.text
      })

      setStatusMessage('Configurações de branding aplicadas com sucesso!')
      if (onBrandingApplied) onBrandingApplied()
    } catch (err) {
      setError('Erro ao aplicar: ' + err.message)
    } finally {
      setApplying(false)
    }
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current)
    }
  }, [])

  const dropzoneText = preview
    ? 'Clique para trocar a logo'
    : 'Arraste sua logo aqui ou clique para selecionar'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">🎨 Branding Inteligente com IA</h2>
        <p className="mt-1 text-sm text-slate-500">
          Envie a logomarca do supermercado para sugerir a paleta de cores. Você pode personalizar os valores gerados livremente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Upload da logo</h3>
              <p className="mt-1 text-xs text-slate-500">Formatos aceitos: PNG, JPG, SVG e WebP. Máximo: 2MB.</p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={preview} alt="Preview" className="max-h-40 w-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm" />
                  <p className="text-xs font-medium text-slate-700">{file?.name}</p>
                  <p className="text-xs text-slate-400">{dropzoneText}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-12 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">↑</div>
                  <p className="text-xs font-medium text-slate-700">{dropzoneText}</p>
                  <p className="text-xs text-slate-400">A paleta será sugerida automaticamente após o upload.</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {statusMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
                {statusMessage}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleExtractColors}
                disabled={!file || extracting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {extracting ? 'Extraindo...' : 'Sugerir cores com IA'}
              </button>

              <button
                onClick={handleApplyColors}
                disabled={extracting || applying}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {applying ? 'Aplicando...' : 'Aplicar cores'}
              </button>

              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Regenerar
              </button>
            </div>

            {extracting && (
              <p className="mt-4 text-xs text-slate-500">Aguarde, extraindo cores... (até 30s)</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Paleta de Cores (Editável)</h3>
              <p className="mt-1 text-xs text-slate-500">Ajuste os seletores ou digite os códigos hexadecimais diretamente.</p>
            </div>

            <div className="space-y-3">
              <EditableColorRow label="Primary (Cor Principal)" color={colors.primary} onChange={(val) => handleColorChange('primary', val)} />
              <EditableColorRow label="Secondary (Cor Secundária)" color={colors.secondary} onChange={(val) => handleColorChange('secondary', val)} />
              <EditableColorRow label="Accent (Destaques)" color={colors.accent} onChange={(val) => handleColorChange('accent', val)} />
              <EditableColorRow label="Background (Fundo)" color={colors.background} onChange={(val) => handleColorChange('background', val)} />
              <EditableColorRow label="Text (Texto)" color={colors.text} onChange={(val) => handleColorChange('text', val)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Preview visual em tempo real</h3>
            <p className="mt-1 text-xs text-slate-500">Simulação do site público atualizada instantaneamente conforme você edita.</p>
          </div>

          <SitePreview colors={colors} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  )
}