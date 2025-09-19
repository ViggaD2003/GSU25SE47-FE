import React, { useState } from 'react'
import {
  apiResetPassword,
  getPasswordScore,
  maskEmail,
} from './../../utils/helpers'
import StrengthBar from '../../utils/strengthBar'

function Check({ ok }) {
  return (
    <span
      className={`inline-block h-4 w-4 rounded-full border ${ok ? 'bg-green-500 border-green-500' : 'bg-transparent border-gray-300'}`}
      aria-hidden
    />
  )
}

export default function ChangePassword({ email, onSuccess }) {
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const score = getPasswordScore(pw)
  const valid = score >= 3 && pw === confirm

  async function handleSubmit(e) {
    try {
      e.preventDefault()
      setError(null)
      if (!valid)
        return setError(
          'Please meet the requirements and confirm your password.'
        )
      setLoading(true)
      const res = await apiResetPassword(email, pw, confirm)
      if (res.status !== 200)
        return setError(res.message || 'Could not change password.')
      onSuccess()
    } catch (error) {
      console.log('Error resetting password:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>
          Changing password for{' '}
          <span className="font-medium">{maskEmail(email)}</span>
        </span>
      </div>

      <div>
        <label htmlFor="pw" className="block text-sm font-medium">
          New password
        </label>
        <div className="mt-2 flex items-center gap-2">
          <input
            id="pw"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-800"
            value={pw}
            onChange={e => setPw(e.target.value)}
            aria-describedby="pw-help"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <StrengthBar score={score} />
        <ul id="pw-help" className="mt-3 space-y-1 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check ok={pw.length >= 8} /> At least 8 characters
          </li>
          <li className="flex items-center gap-2">
            <Check ok={/[A-Z]/.test(pw)} /> One uppercase letter
          </li>
          <li className="flex items-center gap-2">
            <Check ok={/[a-z]/.test(pw)} /> One lowercase letter
          </li>
          <li className="flex items-center gap-2">
            <Check ok={/[0-9]/.test(pw)} /> One number
          </li>
          <li className="flex items-center gap-2">
            <Check ok={/[^A-Za-z0-9]/.test(pw)} /> One special character
          </li>
        </ul>
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-gray-800"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          aria-invalid={confirm !== '' && confirm !== pw}
        />
        {confirm !== '' && confirm !== pw && (
          <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!valid || loading}
        className="w-full rounded-2xl bg-black px-4 py-3 text-white"
      >
        {loading ? 'Updating…' : 'Change password'}
      </button>
    </form>
  )
}
