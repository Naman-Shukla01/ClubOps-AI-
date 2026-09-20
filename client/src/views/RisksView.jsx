import React from 'react'
import { ShieldAlert } from 'lucide-react'

export function RisksView() {
  return (
    <div className="min-h-full pb-10">
      {/* Development Stage Notice Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-card border border-amber-500/30 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-fg">⚠️ Risk Radar & Early Warning</h2>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ⚙️ In Development
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-card text-muted border border-border">
                  Beta Preview
                </span>
              </div>
              <p className="text-xs text-fg/80 mt-1 max-w-2xl leading-relaxed">
                This intelligent operational risk detection suite is currently under active development. It analyzes event schedules, volunteer allocations, budget constraints, and safety guidelines to proactively flag hazards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 border border-border rounded-xl text-xs font-semibold text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Scanning Engine Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RisksView
