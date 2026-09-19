import React from 'react'
import { TranscriptInput } from '../components/meetings/TranscriptInput'
import { ExtractedActions } from '../components/meetings/ExtractedActions'
import { meetings } from '../data/mockData'

export function MeetingsView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg">Meetings</h2>
      <div className="grid grid-cols-2 gap-6">
        <TranscriptInput />
        <ExtractedActions />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-fg mb-4">Past Meetings</h3>
        <div className="space-y-2">
          {meetings.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-fg">{m.title}</p>
                <p className="text-xs text-muted">{m.date} · {m.duration}min · {m.participants.length} participants</p>
              </div>
              <span className="text-[10px] bg-green/15 text-green px-2 py-1 rounded-full uppercase font-semibold">Completed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}