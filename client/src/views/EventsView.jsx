import React from 'react'

export function EventsView() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-fg mb-6">Events</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-fg mb-4">🗓️ Milestones</h3>
          <div className="space-y-3">
            {['Venue confirmed', 'Speakers confirmed', 'Marketing launch', 'Registration opens', 'Event day'].map((m, i) => (
              <div key={m} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 3 ? 'bg-green text-black' : 'bg-border text-muted'}`}>{i < 3 ? '✓' : i + 1}</div>
                <span className={`text-sm ${i < 3 ? 'text-fg' : 'text-muted'}`}>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-fg mb-4">💰 Budget Roadmap</h3>
          <div className="space-y-3">
            {[
              { label: 'Venue', spent: 8000, total: 10000 },
              { label: 'Catering', spent: 4500, total: 6000 },
              { label: 'Marketing', spent: 2000, total: 3000 },
              { label: 'AV/Tech', spent: 1500, total: 2000 },
            ].map((b) => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-fg">{b.label}</span>
                  <span className="text-muted">${b.spent.toLocaleString()} / ${b.total.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(b.spent / b.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}