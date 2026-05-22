import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  uploadTenantBranding,
  getBrandingStatus,
  updateTenantSettings
} from '../api/tenant'

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp'
]

const MAX_SIZE = 2 * 1024 * 1024

const DEFAULT_COLORS = {
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#f59e0b',
  background: '#f8fafc',
  text: '#0f172a'
}

function ColorRow({ label, color }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className="h-5 w-5 rounded-full border border-slate-300 bg-[var(--swatch)]"
          style={{ '--swatch': color }}
        />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="font-mono text-sm text-slate-500">{color}</span>
    </div>
  )
}

function SitePreview({ colors, logoUrl }) {
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

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={previewVars}
    >
      <div className="bg-[var(--brand-primary)] px-5 py-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-auto rounded bg-white p-1"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-xs font-semibold text-slate-500">
              LOGO
            </div>
          )}

          <div>
            <p className="text-sm text-white/80">Preview do site</p>
            <h3 className="text-lg font-semibold text-white">Minha Loja</h3>
          </div>
        </div>
      </div>

      <div className="bg-[var(--brand-background)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-[var(--brand-text)]">
            Ofertas em destaque
          </h4>
          <span className="rounded-full bg-[var(--brand-secondary)] px-3 py-1 text-xs font-semibold text-white">
            Semana
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-[var(--brand-accent)] p-6" />
              <div className="space-y-2 p-4">
                <p className="font-semibold text-[var(--brand-text)]">
                  Produto {item}
                </p>
                <p className="text-sm text-slate-500">Oferta especial</p>
                <p className="text-lg font-bold text-[var(--brand-secondary)]">
                  `R$ ${item === 1 ? '99,90' : '149,90'}`
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandingUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [applying, setApplying] = useState(false)
  const [colors, setColors] = useState(DEFAULT_COLORS)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

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

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault()
      event.stopPropagation()
      const droppedFile = event.dataTransfer.files?.[0]
      if (droppedFile) handleFile(droppedFile)
    },
    [handleFile]
  )

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
            setStatusMessage('Cores extraídas com sucesso!')
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

      setStatusMessage('Configurações aplicadas com sucesso!')
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
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Branding automático
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Envie a logomarca do tenant para extrair a paleta de cores e visualizar
          o resultado antes de aplicar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Upload da logo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Formatos aceitos: PNG, JPG, SVG e WebP. Tamanho máximo: 2MB.
              </p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 w-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  />
                  <p className="text-sm font-medium text-slate-700">
                    {file?.name}
                  </p>
                  <p className="text-xs text-slate-500">{dropzoneText}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    ↑
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {dropzoneText}
                  </p>
                  <p className="text-xs text-slate-500">
                    A paleta será sugerida automaticamente após o upload.
                  </p>
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

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {statusMessage ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {statusMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleExtractColors}
                disabled={!file || extracting}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {extracting ? 'Extraindo...' : 'Extrair Cores Automaticamente'}
              </button>

              <button
                onClick={handleApplyColors}
                disabled={!logoUrl || extracting || applying}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {applying ? 'Aplicando...' : 'Aplicar Cores'}
              </button>

              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Regenerar
              </button>
            </div>

            {extracting ? (
              <p className="mt-4 text-sm text-slate-500">
                Aguarde, extraindo cores... (até 30s)
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Cores extraídas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Revise a paleta sugerida antes de aplicar no tenant.
              </p>
            </div>

            <div className="space-y-3">
              <ColorRow label="Primary" color={colors.primary} />
              <ColorRow label="Secondary" color={colors.secondary} />
              <ColorRow label="Accent" color={colors.accent} />
              <ColorRow label="Background" color={colors.background} />
              <ColorRow label="Text" color={colors.text} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Preview visual
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Simulação do frontend público usando a identidade visual extraída.
            </p>
          </div>

          <SitePreview colors={colors} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  )
}

export default BrandingUpload