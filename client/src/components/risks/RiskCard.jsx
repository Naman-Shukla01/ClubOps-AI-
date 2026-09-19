import React from 'react'

const severityColors = {
  critical: { bar: 'bg-red', badge: 'bg-red/15 text-red' },
  high: { bar: 'bg-red', badge: 'bg-red/15 text-red' },
  medium: { bar: 'bg-yellow', badge: 'bg-yellow/15 text-yellow' },
  low: { bar: 'bg-green', badge: 'bg-green/15 text-green' },
}

export function RiskCard({ risk }) {
  const c = severityColors[risk.severity] || severityColors.medium
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-all">
      <div className={`w-full h-1 ${c.bar} rounded-full mb-3 opacity-70`}></div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-fg leading-snug">{risk.title}</h4>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.badge}`}>
          {risk.severity.toUpperCase()}
        </span>
      </div>
      <p className="text-[11px] text-muted mb-1">{risk.type || risk.category || 'other'}</p>
      <div className="flex items-center gap-1.5 text-[11px] text-fg/70">
        <span className="opacity-60">🛡</span>
        <span>{risk.description || risk.mitigation || 'No description available.'}</span>
      </div>
      <div className="mt-2">
        <span className={`text-[10px] font-medium ${risk.status === 'acknowledged' ? 'text-green' : 'text-muted'}`}>
          {risk.status === 'acknowledged' ? '✓ Acknowledged' : '● Active'}
        </span>
      </div>
    </div>
  )
}