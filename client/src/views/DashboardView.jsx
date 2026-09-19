import React, { useState, useEffect } from 'react'
import ActionCopilotBar from '../components/actions/ActionCopilotBar'
import { dev1Service } from '../services/dev1Service'
import { dev2Service } from '../services/dev2Service'

export function DashboardView({ user }) {
  const [stats, setStats] = useState({ events: 0, tasks: 0, risks: 0, volunteers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    try {
      const [eventsRes, tasksRes, risksRes, volRes] = await Promise.all([dev2Service.getEvents(), dev1Service.getTasks(), dev2Service.getRisks(), dev1Service.getVolunteers()])
      setStats({
        events: (eventsRes?.data || eventsRes || []).length,
        tasks: (tasksRes?.data || tasksRes || []).length,
        risks: (risksRes?.data || risksRes || []).length,
        volunteers: (volRes?.data || volRes || []).length,
      })
    } catch { console.error('Failed') }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-muted text-sm">Here is your event overview</p>
      </div>
      <ActionCopilotBar />
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Events', value: loading ? '...' : stats.events },
          { label: 'Tasks', value: loading ? '...' : stats.tasks },
          { label: 'Risks', value: loading ? '...' : stats.risks },
          { label: 'Volunteers', value: loading ? '...' : stats.volunteers },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-fg">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}