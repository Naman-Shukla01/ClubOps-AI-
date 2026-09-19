import React, { useState } from 'react'
import { X } from 'lucide-react'

export function AddVolunteerModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', skills: '', capacity: 50 })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">Add Volunteer</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Skills (comma separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Registration, Customer Service" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Initial Capacity: {form.capacity}%</label>
            <input type="range" min="0" max="100" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })} className="w-full accent-accent" />
          </div>
          <button onClick={() => { onAdd({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }); onClose() }}
            className="w-full bg-accent hover:bg-accentHover text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
            Add Volunteer
          </button>
        </div>
      </div>
    </div>
  )
}