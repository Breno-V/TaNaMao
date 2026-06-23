import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function formatDateWatermark() {
  const d = new Date()
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`
}

export default function LoginForm({ onSwitchToRegister, theme, onToggleTheme }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !senha) return
    setSubmitting(true)
    setError('')
    try {
      await login(email.trim(), senha)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <button className="auth-theme-toggle" onClick={onToggleTheme} title={theme === 'light' ? 'Modo escuro' : 'Modo claro'} aria-label={theme === 'light' ? 'Modo escuro' : 'Modo claro'}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {theme === 'light' ? (
            <>
              <path d="M9 3.5V2M9 14.5V16M3.5 9H2M14.5 9H16" strokeWidth="2" />
              <circle cx="9" cy="9" r="5" />
              <circle cx="9" cy="9" r="2" opacity="0.4" />
              <path d="M5.5 5.5L4 4M12.5 12.5L14 14M5.5 12.5L4 14M12.5 5.5L14 4" strokeWidth="2" />
            </>
          ) : (
            <path d="M15.5 10.5A6.5 6.5 0 0 1 7.5 2.5 6.5 6.5 0 1 0 15.5 10.5Z" />
          )}
        </svg>
      </button>
      <div className="auth-watermark" aria-hidden="true">
        {formatDateWatermark()}
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <h1 className="auth-brand-title">TáNaMão</h1>
          <span className="auth-brand-sub">tá na mão, sua organização</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              className="auth-input"
              type="password"
              placeholder="sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting || !email.trim() || !senha}
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Não tem conta?{' '}
          <button
            type="button"
            className="auth-link"
            onClick={onSwitchToRegister}
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  )
}
