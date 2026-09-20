import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

const ICONS = ['⭐', '💻', '🎭', '⚽', '🎤', '🌍', '🎨', '📚', '🔬', '🎵', '🏆', '💡', '🚀', '📊', '🧠']

export function CreateClubModal({ onClose, onCreate, initialClub }) {
  const [form, setForm] = useState({
    name: initialClub?.name || '',
    icon: initialClub?.icon || '⭐',
    description: initialClub?.description || '',
    maxMembers: initialClub?.maxMembers || 50,
    skills: Array.isArray(initialClub?.skills) ? initialClub.skills.join(', ') : (initialClub?.skills || '')
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      await onCreate({ ...initialClub, ...form })
    } catch (err) {
      setError(err?.message || 'Failed to save club')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[480px] max-w-[calc(100%-1.5rem)] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">{initialClub ? 'Edit Club Details' : 'Create New Club'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg"><X size={16} className="text-muted" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Club Name *</label>
            <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError('') }} required
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Club name" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent resize-none" placeholder="What does your club do?" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Max Members</label>
              <input type="number" value={form.maxMembers} onChange={(e) => setForm({ ...form, maxMembers: parseInt(e.target.value) || 50 })} min="5" max="200"
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Icon</label>
              <div className="flex flex-wrap gap-1">
                {ICONS.slice(0, 10).map((ic) => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${form.icon === ic ? 'bg-accent/30 border border-accent' : 'bg-card border border-border hover:border-accent/30'}`}>{ic}</button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Focus Areas (comma separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Tech, AI, Web Dev" />
          </div>
          {error && <p className="text-xs text-red">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accentHover text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <Plus size={16} /> {loading ? 'Saving...' : (initialClub ? 'Save Club Details' : 'Create Club')}
          </button>
        </form>
      </div>
    </div>
  )
}
