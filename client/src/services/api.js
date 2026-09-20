const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
let backendAvailable = false
const authHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = {
  get: async (url) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, { headers: authHeaders() })
      backendAvailable = true
      return res.json()
    } catch {
      return null
    }
  },
  post: async (url, data) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      })
      backendAvailable = true
      return res.json()
    } catch {
      return null
    }
  },
  put: async (url, data) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      })
      backendAvailable = true
      return res.json()
    } catch {
      return null
    }
  },
  patch: async (url, data) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data),
      })
      backendAvailable = true
      return res.json()
    } catch {
      return null
    }
  },
  del: async (url) => {
    try {
      const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: authHeaders() })
      backendAvailable = true
      return res.json()
    } catch {
      return null
    }
  },
  isAvailable: () => backendAvailable,
}

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`
  const isFormData = options.body instanceof FormData;
  const config = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(localStorage.getItem('accessToken') ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json().catch(() => null)
    backendAvailable = true

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = data
      if (response.status === 401) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('currentUser')
        window.dispatchEvent(new CustomEvent('clubops:auth-required', { detail: { message: errorMessage } }))
      } else if (response.status === 403) {
        window.dispatchEvent(new CustomEvent('clubops:forbidden', { detail: { message: errorMessage } }))
      }
      throw error
    }

    return data
  } catch (error) {
    console.error(`API Error on [${config.method || 'GET'} ${url}]:`, error)
    throw error
  }
}

export default api
