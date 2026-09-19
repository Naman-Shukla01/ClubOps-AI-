import React, { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { apiRequest } from '../services/api.js'

export default function Login({ onLogin, initialError = '' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      localStorage.setItem('accessToken', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (onLogin) onLogin(result.user)
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue flex items-center justify-center text-white font-bold text-2xl shadow-glow mx-auto mb-4">A</div>
          <h1 className="text-2xl font-bold text-fg">EventHub</h1>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@org.com" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-fg outline-none focus:border-accent transition-colors" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-fg outline-none focus:border-accent transition-colors pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          {error && <p className="text-xs text-red">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accentHover text-white rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Sign In'}
          </button>
        </form>
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-muted">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button type="button" disabled={loading || googleLoading} onClick={() => { setGoogleLoading(true); window.location.assign(googleAuthUrl) }} className="w-full border border-border hover:bg-card text-fg rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <span className="font-bold text-base">G</span>}
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>
        <p className="text-center text-xs text-muted mt-6">Use your ClubOps account credentials</p>
      </div>
    </div>
  )
}