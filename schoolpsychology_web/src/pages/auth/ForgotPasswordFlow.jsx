import React, { useState } from 'react'
import VerifyEmail from './VerifyEmail'
import VerifyOtp from './VerifyOTP'
import ChangePassword from './ForgotPassword'
import { Link } from 'react-router-dom'

export default function ForgotPasswordFlow() {
  const [step, setStep] = useState('email') // email | otp | reset | done
  const [email, setEmail] = useState('')

  return (
    <div className={`max-h-screen flex items-center justify-center`}>
      <div className={`mx-auto max-w-md w-full`}>
        {/* Header */}
        <div className="mb-8 flex items-center gap-3 justify-center">
          <p className="text-lg font-bold opacity-80">
            Securely recover access to your account
          </p>
        </div>

        {/* Card */}
        <div className={` rounded-3xl p-6 shadow-sm ring-1 ring-gray-200`}>
          {/* Stepper */}
          <ol className="mb-6 flex items-center justify-between text-xs opacity-80">
            {[
              { id: 'email', label: 'Verify email' },
              { id: 'otp', label: 'Verify code' },
              { id: 'reset', label: 'Change password' },
            ].map((s, i) => {
              const active = step === s.id
              const done =
                (step === 'otp' && i <= 0) ||
                (step === 'reset' && i <= 1) ||
                step === 'done'
              return (
                <li key={s.id} className="flex flex-1 items-center">
                  <div
                    className={`flex items-center gap-2 ${i !== 0 ? 'pl-2' : ''}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${done ? 'bg-blue-600 text-white' : active ? 'border border-blue-600 text-blue-600' : 'border border-gray-400 text-gray-500'}`}
                    >
                      {i + 1}
                    </span>
                    <span className={`${active ? 'font-medium' : ''}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && <div className="mx-2 h-px flex-1 bg-gray-400/30" />}
                </li>
              )
            })}
          </ol>

          {step === 'email' && (
            <VerifyEmail
              onSuccess={em => {
                setEmail(em)
                setStep('otp')
              }}
            />
          )}

          {step === 'otp' && (
            <VerifyOtp
              email={email}
              onBack={() => setStep('email')}
              onSuccess={() => setStep('reset')}
            />
          )}

          {step === 'reset' && (
            <ChangePassword
              email={email}
              onBack={() => setStep('otp')}
              onSuccess={() => setStep('done')}
            />
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-green-100 p-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-full w-full text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                Password changed successfully
              </h3>
              <p className="mt-2 opacity-80">
                You can now sign in with your new password.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm opacity-80">
          <p>
            Remembered it?{' '}
            <Link className="font-medium underline" to="/login">
              Go back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
