import { useMemo, useState } from 'react'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('A confirmação não confere.')
      return
    }

    try {
      setLoading(true)
      const { data } = await resetPassword(token, password)
      setMessage(data.message || 'Senha redefinida com sucesso.')
      setPassword('')
      setConfirm('')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <a href="/login" className="text-blue-600 hover:underline text-sm">&larr; Voltar ao login</a>
        <h1 className="text-2xl font-bold mt-4 mb-6">Redefinir senha</h1>

        {!token && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">Token ausente no link.</p>}
        {message && <p className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <input
          type="password"
          placeholder="Nova senha"
          className="w-full p-3 border rounded mb-4"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirmar nova senha"
          className="w-full p-3 border rounded mb-6"
          value={confirm}
          onChange={event => setConfirm(event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
