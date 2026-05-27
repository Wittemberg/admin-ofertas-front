export function getErrorMessage(err, fallback = 'Nao foi possivel concluir a operacao.') {
  const data = err?.response?.data

  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors[0]?.message || data.errors[0]?.error || fallback
  }
  if (err?.message && !err.response) return err.message

  return fallback
}
