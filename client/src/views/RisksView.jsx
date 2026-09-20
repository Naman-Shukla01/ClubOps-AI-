import React, { useState, useEffect } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'
import { RiskColumn } from '../components/risks/RiskColumn'
import { dev2Service } from '../services/dev2Service'

const riskColumns = [
  { title: 'Critical Risks', sev: 'critical', color: '#ef4444' },
  { title: 'High Risks', sev: 'high', color: '#f87171' },
  { title: 'Medium Risks', sev: 'medium', color: '#fbbf24' },
  { title: 'Low Risks', sev: 'low', color: '#34d399' },
]

export function RisksView({ user }) {
  const [risks, setRisks] = useState([])
  const [loading, setLoading] = useState(true)

  const activeClubId = user?.activeClubId

  useEffect(() => {
    loadRisks()
  }, [activeClubId])

  const loadRisks = async () => {
    setLoading(true)
    try {
      const data = await dev2Service.getRisks(activeClubId)
      setRisks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load risks:', err)
      setRisks([])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-full pb-10 space-y-6">
      {/* Notice Banner */}
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
                  ⚙️ Active Radar
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-card text-muted border border-border">
                  Beta Preview
                </span>
              </div>
              <p className="text-xs text-fg/80 mt-1 max-w-2xl leading-relaxed">
                This intelligent operational risk detection suite continuously monitors event deadlines, volunteer overload, budget constraints, and safety guidelines to proactively flag hazards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadRisks}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-card/80 border border-border hover:border-accent/40 rounded-xl text-xs font-semibold text-fg transition-all"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-accent' : 'text-muted'} />
              <span>Scan Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Risk Columns Grid */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-border/60">
          <h3 className="text-sm font-bold text-fg">🛡️ Identified Operational Risks</h3>
          <span className="text-xs text-muted font-medium bg-card px-3 py-1 rounded-full border border-border">
            {risks.length} total {risks.length === 1 ? 'risk' : 'risks'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-2">
            <RefreshCw size={20} className="animate-spin text-accent" />
            <span>Scanning for operational risks...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {riskColumns.map((col) => (
              <RiskColumn
                key={col.title}
                title={col.title}
                risks={risks.filter((r) => r.severity === col.sev)}
                color={col.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RisksView
