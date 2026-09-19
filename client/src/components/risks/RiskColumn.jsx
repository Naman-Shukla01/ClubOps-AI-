import React from 'react'
import { RiskCard } from './RiskCard'

export function RiskColumn({ title, risks, color }) {
  return (
    <div className="flex flex-col min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <span className="text-xs text-muted bg-card px-2 py-0.5 rounded-full">{risks.length}</span>
      </div>
      <div className="space-y-3">
        {risks.map((risk) => <RiskCard key={risk.id} risk={risk} />)}
      </div>
    </div>
  )
}