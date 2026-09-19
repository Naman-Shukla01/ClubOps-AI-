import React from 'react'

const statusColors = { active: 'text-green', busy: 'text-yellow', idle: 'text-muted' }

export function VolunteerCard({ volunteer }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-accent/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/40 to-blue/40 flex items-center justify-center text-white text-sm font-bold">
          {volunteer.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-fg">{volunteer.name}</h4>
          <span className={`text-[10px] font-medium ${statusColors[volunteer.status]}`}>● {volunteer.status}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {volunteer.skills.map((skill) => (
          <span key={skill} className="text-[10px] bg-surface text-muted px-2 py-1 rounded-lg">{skill}</span>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted">Capacity</span>
          <span className="text-[11px] font-semibold text-fg">{volunteer.capacity}%</span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${volunteer.capacity > 90 ? 'bg-red' : volunteer.capacity > 70 ? 'bg-yellow' : 'bg-green'}`}
            style={{ width: `${volunteer.capacity}%` }}></div>
        </div>
      </div>
    </div>
  )
}