import React, { useEffect, useState } from 'react'
import { TranscriptInput } from '../components/meetings/TranscriptInput'
import { ExtractedActions } from '../components/meetings/ExtractedActions'
import { dev2Service } from '../services/dev2Service'

export function MeetingsView() {
  const [meetings, setMeetings] = useState([])
  const [extractedActions, setExtractedActions] = useState(undefined)

  useEffect(() => {
    dev2Service.getMeetings()
      .then(setMeetings)
      .catch(() => setMeetings([]))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fg">Meetings</h2>
      <div className="grid grid-cols-2 gap-6">
        <TranscriptInput meetingId={meetings[0]?.id} onResult={(tasks) => setExtractedActions(tasks.map((task, index) => ({
          id: task.taskId || `${task.title}-${index}`,
          text: task.title,
          owner: task.owner || 'Unassigned',
          priority: task.priority || 'medium',
        })))} />
        <ExtractedActions actions={extractedActions || undefined} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-fg mb-4">Past Meetings</h3>
        <div className="space-y-2">
          {meetings.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-fg">{m.title}</p>
                <p className="text-xs text-muted">{m.date ? new Date(m.date).toLocaleDateString() : 'No date'} · {m.duration || 60}min · {(m.participants || []).length} participants</p>
              </div>
              <span className="text-[10px] bg-green/15 text-green px-2 py-1 rounded-full uppercase font-semibold">Completed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}