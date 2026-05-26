import { useState } from 'react'
import { changePassword } from '../api/auth'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'A confirmação não confere com a nova senha.' })
      return
    }

    try {
      setSaving(true)
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Senha alterada com sucesso.' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erro ao alterar senha.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-xl">
        <a href="/" className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Voltar ao Dashboard</a>
        <h1 className="text-2xl font-bold mb-6">Alterar senha</h1>

        {message && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
          <Field label="Senha atual" value={currentPassword} onChange={setCurrentPassword} />
          <Field label="Nova senha" value={newPassword} onChange={setNewPassword} />
          <Field label="Confirmar nova senha" value={confirmPassword} onChange={setConfirmPassword} />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {saving ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="password"
        value={value}
        onChange={event => onChange(event.target.value)}
        required
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  )
}
