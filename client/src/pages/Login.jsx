<<<<<<< HEAD
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
=======
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
>>>>>>> dee661aee8efa31dbcab097b1cd8eb12a2cd9c42
    }
    try {
      let loggedUser = null;

      // Check registered users in all_users
      const allUsers = JSON.parse(localStorage.getItem("all_users") || "[]");
      const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.password && found.password !== password) {
          setError("Incorrect password.");
          return;
        }
        loggedUser = found;
      } else {
        // Fallback for demo login
        loggedUser = {
          name: email.split('@')[0] || "User",
          email,
          role: "club-head",
          activeClubId: "1",
          activeClubName: "Tech Innovators Club",
          activeClubIcon: "💻",
          joinedClubs: [
            { id: "1", name: "Tech Innovators Club", icon: "💻" },
            { id: "2", name: "Cultural Vibes", icon: "🎭" }
          ]
        };
      }

      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      if (onLogin) onLogin(loggedUser);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials.");
    }
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
<<<<<<< HEAD
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
=======
        <p className="text-center mt-4 text-sm" style={{ color: "#888" }}>Don't have an account? <Link to="/register" className="text-indigo-400 font-semibold cursor-pointer">Register</Link></p>
>>>>>>> dee661aee8efa31dbcab097b1cd8eb12a2cd9c42
      </div>
    </div>
  );
}
