import React, { useEffect, useState } from 'react'
import { TranscriptInput } from '../components/meetings/TranscriptInput'
import { ExtractedActions } from '../components/meetings/ExtractedActions'
import { AiChatAssistant } from '../components/meetings/AiChatAssistant'
import { dev2Service } from '../services/dev2Service'
import { Calendar, Plus, RefreshCw, Users, Clock, CheckCircle2, ChevronRight } from 'lucide-react'

export function MeetingsView({ user }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return user || JSON.parse(localStorage.getItem('currentUser') || '{}')
    } catch {
      return {}
    }
  })

  const [meetings, setMeetings] = useState([])
  const [events, setEvents] = useState([])
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [extractedActions, setExtractedActions] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newEventId, setNewEventId] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [creating, setCreating] = useState(false)

  const activeClubId = currentUser?.activeClubId
  const activeClubName = currentUser?.activeClubName
  const activeClubIcon = currentUser?.activeClubIcon || '🏛️'

  const userRole = (currentUser?.role || '').toLowerCase()
  const isClubHead =
    userRole === 'club-head' ||
    userRole === 'event_manager' ||
    userRole === 'admin' ||
    userRole === 'lead'

  useEffect(() => {
    if (user) setCurrentUser(user)
  }, [user])

  useEffect(() => {
    loadData()
  }, [activeClubId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [meetingData, eventData] = await Promise.all([
        dev2Service.getMeetings(activeClubId).catch(() => []),
        dev2Service.getEvents(activeClubId).catch(() => []),
      ])

      const meetingList = Array.isArray(meetingData) ? meetingData : []
      const eventList = Array.isArray(eventData) ? eventData : []
      setMeetings(meetingList)
      setEvents(eventList)
      if (meetingList.length > 0 && !selectedMeeting) {
        setSelectedMeeting(meetingList[0])
      }
    } catch (err) {
      console.error('Failed to load meetings data:', err)
      setMeetings([])
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newEventId) {
      alert('Please provide a meeting title and select an associated event.')
      return
    }
    setCreating(true)
    try {
      const created = await dev2Service.createMeeting({
        title: newTitle.trim(),
        event: newEventId,
        date: new Date(newDate).toISOString(),
      })
      setShowCreateModal(false)
      setNewTitle('')
      await loadData()
      if (created?.id) {
        setSelectedMeeting(created)
      }
    } catch (err) {
      console.error('Failed to create meeting:', err)
      alert(err?.message || 'Failed to create meeting.')
    } finally {
      setCreating(false)
    }
  }

  const activeEventId = selectedMeeting?.event || events[0]?.id || events[0]?._id

  return (
    <div className="space-y-6 min-h-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
              🗣️ Meetings & AI Copilot
            </h1>
            {activeClubName && (
              <span className="text-xs bg-card border border-border px-3 py-1 rounded-full text-muted flex items-center gap-1.5 shadow-sm">
                <span>{activeClubIcon}</span>
                <span className="font-semibold text-fg/90">{activeClubName}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            Transcribe meeting notes, extract actionable tasks with Gemini, and dispatch workflows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-muted hover:text-fg hover:bg-card border border-border rounded-xl transition-colors disabled:opacity-50"
            title="Refresh meetings"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {isClubHead && events.length > 0 && (
            <button
              onClick={() => {
                setNewEventId(events[0]?.id || events[0]?._id || '')
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl hover:bg-accentHover transition-all shadow-lg shadow-accent/20"
            >
              <Plus size={14} />
              New Meeting
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column AI Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[520px]">
        {/* Column 1: Transcript Input */}
        <div className="flex flex-col gap-6">
          <TranscriptInput
            meetingId={selectedMeeting?.id}
            onResult={(tasks) =>
              setExtractedActions(
                tasks.map((task, index) => ({
                  id: task.taskId || `${task.title}-${index}`,
                  text: task.title,
                  owner: task.owner || 'Unassigned',
                  priority: task.priority || 'medium',
                }))
              )
            }
          />
        </div>

        {/* Column 2: Extracted Actions */}
        <div className="flex flex-col">
          <ExtractedActions
            actions={extractedActions || undefined}
            clubId={activeClubId}
            eventId={activeEventId}
          />
        </div>

        {/* Column 3: AI Assistant */}
        <div className="flex flex-col h-full">
          <AiChatAssistant
            eventId={activeEventId}
            clubId={activeClubId}
            onTasksChanged={() => loadData()}
          />
        </div>
      </div>

      {/* Past Meetings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-fg flex items-center gap-2">
            <Calendar size={18} className="text-accent" />
            Meeting History
          </h3>
          <span className="text-xs text-muted">{meetings.length} recorded</span>
        </div>

        {loading ? (
          <div className="bg-card border border-border p-6 rounded-2xl text-center text-xs text-muted">
            Loading past meetings...
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-card border border-border p-6 rounded-2xl text-center text-xs text-muted">
            No meetings recorded yet for this club. Create a meeting or paste a transcript to begin!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`border rounded-xl p-4 flex items-start justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-accent/10 border-accent/40 shadow-sm'
                      : 'bg-card border-border hover:border-accent/30'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-fg truncate">{m.title}</p>
                      {isSelected && (
                        <span className="text-[9px] bg-accent text-white px-2 py-0.5 rounded-full uppercase font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {m.date ? new Date(m.date).toLocaleDateString() : 'No date'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {m.duration || 60}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {(m.participants || []).length || 1}
                      </span>
                    </div>
                    {m.summary && (
                      <p className="text-xs text-fg/80 line-clamp-2 mt-1 italic">
                        "{m.summary}"
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className={`shrink-0 mt-1 ${isSelected ? 'text-accent' : 'text-muted'}`} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-fg flex items-center gap-2">
              <Calendar size={20} className="text-accent" />
              Schedule / Record New Meeting
            </h3>

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1 font-medium">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Weekly Sync & Logistics Review"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1 font-medium">Associated Event</label>
                <select
                  required
                  value={newEventId}
                  onChange={(e) => setNewEventId(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                >
                  <option value="">Select an Event...</option>
                  {events.map((ev) => (
                    <option key={ev.id || ev._id} value={ev.id || ev._id}>
                      {ev.title || ev.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted block mb-1 font-medium">Meeting Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-fg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-xl hover:bg-accentHover transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeetingsView