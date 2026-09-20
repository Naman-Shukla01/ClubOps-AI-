import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      try {
        // Attempt login
        res = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        });
      } catch (loginErr) {
        // If login fails with 401, auto‑register to keep demo flow
        if (loginErr.status === 401) {
          const name = email.split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          try {
            res = await apiRequest('/auth/register', {
              method: 'POST',
              body: JSON.stringify({ name, email: email.trim(), password }),
            });
          } catch (regErr) {
            if (regErr.status === 409) {
              throw new Error('Invalid email or password');
            }
            throw regErr;
          }
        } else {
          throw loginErr;
        }
      }

      if (res?.token) {
        localStorage.setItem('accessToken', res.token);
      }

      let user = res?.user || { name: email, email };

      // Initialize default active club if not present
      try {
        const clubsRes = await apiRequest('/clubs', { method: 'GET' });
        const clubsList = Array.isArray(clubsRes?.data) ? clubsRes.data : (Array.isArray(clubsRes) ? clubsRes : []);
        if (clubsList.length > 0) {
          const first = clubsList[0];
          user = {
            ...user,
            activeClubId: user.activeClubId || first.id || first._id,
            activeClubName: user.activeClubName || first.name,
            activeClubIcon: user.activeClubIcon || first.icon || '🚀',
            joinedClubs: clubsList,
          };
        }
      } catch {
        if (!user.activeClubId) {
          user.activeClubId = '1';
          user.activeClubName = 'Tech Innovators Club';
          user.activeClubIcon = '💻';
        }
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      if (onLogin) onLogin(user);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid email or password (min 8 chars required for new accounts)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: '#141417' }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#fff' }}>Welcome Back</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500"
            style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500"
            style={{ background: '#1e1e24', border: '1px solid #2a2a32' }}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            style={{ background: '#4f46e5' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-indigo-400 font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
}
