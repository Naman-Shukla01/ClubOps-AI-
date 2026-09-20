import React from 'react'
import { TaskCard } from './TaskCard'
import { Plus } from 'lucide-react'

const columns = [
  { id: 'todo', label: 'To Do', color: '#71718a' },
  { id: 'in-progress', label: 'In Progress', color: '#60a5fa' },
  { id: 'completed', label: 'Completed', color: '#34d399' },
]

export function KanbanBoard({ tasks, highlightedId, canManage = false }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[min(260px,85vw)] flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }}></div>
              <h3 className="text-sm font-semibold text-fg">{col.label}</h3>
              <span className="text-xs text-muted bg-card px-1.5 py-0.5 rounded-full">
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </div>
            {canManage && <button className="p-1 hover:bg-card rounded">
              <Plus size={12} className="text-muted" />
            </button>}
          </div>
          <div className="space-y-3 min-h-[100px] bg-surface/50 rounded-xl p-2">
            {tasks.filter((t) => t.status === col.id).map((task) => (
              <div key={task.id} style={task.id === highlightedId ? { animation: 'pulse 1.5s ease', boxShadow: '0 0 0 2px #7c5cfc' } : {}}>
                <TaskCard task={task} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}