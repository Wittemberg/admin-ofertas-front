import { useState } from 'react'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data } = await forgotPassword(email)
      setMessage(data.message || 'Verifique seu e-mail para redefinir a senha.')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao solicitar redefinição de senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <a href="/login" className="text-blue-600 hover:underline text-sm">&larr; Voltar ao login</a>
        <h1 className="text-2xl font-bold mt-4 mb-2">Recuperar senha</h1>
        <p className="text-sm text-slate-500 mb-6">
          Informe seu e-mail para receber um link de redefinição.
        </p>

        {message && <p className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
    </div>
  )
}
