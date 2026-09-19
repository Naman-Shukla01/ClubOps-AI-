import React, { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((r) => setTimeout(r, 1000))
    if (email && password.length >= 6) {
      const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const user = { name, role: 'Event Lead', email }
      localStorage.setItem('user', JSON.stringify(user))
      if (onLogin) onLogin(user)
    } else {
      setError('Enter valid email and password (min 6 chars)')
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
        <p className="text-center text-xs text-muted mt-6">Demo: any email + password (6+ chars)</p>
      </div>
    </div>
  )
}