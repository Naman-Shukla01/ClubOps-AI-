import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'

export function CreateTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', priority: 'medium', assignee: '', dueDate: '', tags: '' })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[440px] max-w-[calc(100%-1.5rem)] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">Create Task</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted mb-1.5 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Task title" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted mb-1.5 block">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted mb-1.5 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted mb-1.5 block">Assignee</label>
            <input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent" placeholder="Name" />
          </div>
          <button onClick={() => { onAdd(form); onClose() }}
            className="w-full bg-accent hover:bg-accentHover text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>
    </div>
  )
}