import React, { useEffect, useState } from 'react'
import { TranscriptInput } from '../components/meetings/TranscriptInput'
import { ExtractedActions } from '../components/meetings/ExtractedActions'
import { AiChatAssistant } from '../components/meetings/AiChatAssistant'
import { dev2Service } from '../services/dev2Service'

export function MeetingsView({ user }) {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
        <div className="col-span-1 flex flex-col gap-6">
          <TranscriptInput meetingId={meetings[0]?.id} onResult={(tasks) => setExtractedActions(tasks.map((task, index) => ({
            id: task.taskId || `${task.title}-${index}`,
            text: task.title,
            owner: task.owner || 'Unassigned',
            priority: task.priority || 'medium',
          })))} />
        </div>
        <div className="col-span-1">
          <ExtractedActions actions={extractedActions || undefined} user={user} />
        </div>
        <div className="col-span-1 h-[500px] lg:h-full">
          <AiChatAssistant eventId={meetings[0]?.id} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-fg mb-4">Past Meetings</h3>
        <div className="space-y-2">
          {meetings.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-fg">{m.title}</p>
                <p className="text-xs text-muted">{m.date ? new Date(m.date).toLocaleDateString() : 'No date'} · {m.duration || 60}min · {(m.participants || []).length} participants</p>
              </div>
              <span className="self-start sm:self-center text-[10px] bg-green/15 text-green px-2 py-1 rounded-full uppercase font-semibold">Completed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
