import React, { useEffect, useState } from 'react'
import { dev2Service } from '../services/dev2Service'

export function EventsView() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    dev2Service.getEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-fg mb-6">Events</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-fg mb-4">🗓️ Milestones</h3>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-sm text-muted">No events found.</p>}
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-border text-muted">{event.status || 'planning'}</div>
                <span className="text-sm text-fg">{event.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-fg mb-4">Event details</h3>
          <p className="text-sm text-muted">Select an event to view its API-backed details.</p>
        </div>
      </div>
    </div>
  )
}