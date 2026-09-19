import React, { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { apiRequest } from '../services/api'

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
    try {
      let res;
      try {
        res = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      } catch (loginErr) {
        if (loginErr.status === 401) {
          // Auto-register to preserve demo behavior
          const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          res = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
          });
        } else {
          throw loginErr;
        }
      }

      if (res?.token) {
        localStorage.setItem('accessToken', res.token);
      }
      
      const user = res?.user || { name: email, email };
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (onLogin) onLogin(user);
    } catch (err) {
      setError(err?.message || 'Invalid email or password (min 8 chars required for new accounts)')
    }
    setLoading(false)
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: "#141417" }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#fff" }}>Welcome Back</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 rounded-lg font-bold text-white" style={{ background: "#4f46e5" }}>Login</button>
        </form>
        <p className="text-center text-xs text-muted mt-6">Demo: any email + password (6+ chars)</p>
      </div>
    </div>
  );
}
