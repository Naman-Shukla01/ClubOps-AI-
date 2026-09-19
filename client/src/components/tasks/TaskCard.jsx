import React from 'react'

const priorityColors = {
  high: 'bg-red/15 text-red',
  medium: 'bg-yellow/15 text-yellow',
  low: 'bg-green/15 text-green',
}

export function TaskCard({ task }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 hover:border-accent/30 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-fg mb-3 leading-snug">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
            {(task.assignee || 'Unassigned').split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="text-[11px] text-muted">{task.assignee}</span>
        </div>
        <span className="text-[10px] text-muted">📅 {task.dueDate}</span>
      </div>
      <div className="flex gap-1 mt-2">
        {(task.tags || []).map((tag) => (
          <span key={tag} className="text-[9px] bg-surface text-muted px-1.5 py-0.5 rounded">{tag}</span>
        ))}
      </div>
    </div>
  )
}