const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
let backendAvailable = false

export const api = {
  get: async (url) => {
    try {
      const res = await fetch(`${API_BASE}${url}`)
      backendAvailable = true
      return res.json()
    } catch { return null }
  },
  post: async (url, data) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      backendAvailable = true
      return res.json()
    } catch { return null }
  },
  put: async (url, data) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    } catch { return null }
  },
  del: async (url) => {
    try {
      return fetch(`${API_BASE}${url}`, { method: 'DELETE' }).then((r) => r.json())
    } catch { return null }
  },
  isAvailable: () => backendAvailable,
}