import React, { useState, useEffect } from 'react'
import { dev2Service } from '../services/dev2Service'

export function EventsView({ user }) {
  const [events, setEvents] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  
  const [editing, setEditing] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  // true only if this user created the current active club
  const isClubHead = user?.isClubLead === true || user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN'
  const clubId = user?.activeClubId


  useEffect(() => {
    loadEvents()
  }, [clubId])

  const loadEvents = async () => {
    try {
      const data = await dev2Service.getEvents(clubId || undefined)
      setEvents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load events:', error)
      setEvents([])
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!newTitle.trim() || !clubId) return

    try {
      await dev2Service.createEvent({
        name: newTitle.trim(),
        startDate: newDate || new Date().toISOString(),
        endDate: newDate || new Date().toISOString(),
        deadline: newDeadline || null,
        clubId,
      })
      
      setNewTitle('')
      setNewDate('')
      setNewDeadline('')
      setShowCreate(false)
      loadEvents()
    } catch (err) {
      console.error('Failed to create event:', err)
      alert('Failed to create event.')
    }
  }

  const startEdit = (ev) => {
    setEditing(ev)
    setEditTitle(ev.name || ev.title)
    setEditDate(ev.startDate ? ev.startDate.split('T')[0] : '')
    setEditDeadline(ev.deadline ? ev.deadline.split('T')[0] : '')
  }

  const saveEdit = async () => {
    if (!editing || !editTitle.trim()) return

    try {
      await dev2Service.updateEvent(editing.id, {
        name: editTitle.trim(),
        startDate: editDate,
        endDate: editDate,
        deadline: editDeadline || null
      })
      setEditing(null)
      loadEvents()
    } catch (err) {
      console.error('Failed to save event:', err)
      alert('Failed to save event.')
    }
  }

  const deleteEvent = async (id) => {
    try {
      await dev2Service.deleteEvent(id)
      loadEvents()
    } catch (err) {
      console.error('Failed to delete event:', err)
    }
  }

  const renderCountdown = (deadlineStr) => {
    if (!deadlineStr) return null
    const msLeft = new Date(deadlineStr) - new Date()
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) {
      return <span className="px-2 py-1 text-[10px] rounded-full bg-red/15 text-red font-semibold animate-pulse">OVERDUE</span>
    } else if (daysLeft <= 3) {
      return <span className="px-2 py-1 text-[10px] rounded-full bg-yellow/15 text-yellow font-semibold animate-bounce">{daysLeft} days left ⏳</span>
    } else {
      return <span className="px-2 py-1 text-[10px] rounded-full bg-green/15 text-green">{daysLeft} days left</span>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">
            {user?.activeClubId ? 'Club Events' : 'Events'}
          </h2>

          <p className="text-muted text-sm">
            {user?.activeClubName
              ? user.activeClubName + ' events'
              : 'Upcoming events'}
          </p>
        </div>

        {isClubHead && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>📅</span> + Organize Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">📅</span>
          <p className="text-muted mt-2">No events yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-card border border-border rounded-xl p-5"
            >
              {editing?.id === ev.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                    placeholder="Event name"
                  />

                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                    />
                    <input
                      type="date"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                      placeholder="Deadline (optional)"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditing(null)}
                      className="bg-card border border-border text-muted px-3 py-1.5 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: '#4f46e520' }}
                  >
                    📅
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-fg">
                      {ev.name || ev.title}
                    </h3>

                    <p className="text-xs text-muted">
                      {ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString()
                        : 'No date'}
                    </p>
                  </div>

                  <span className="px-2 py-1 text-[10px] rounded-full bg-surface text-muted border border-border">
                    {ev.status || ev.type}
                  </span>
                  
                  {renderCountdown(ev.deadline)}

                  {isClubHead && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(ev)}
                        className="px-2 py-1 bg-surface text-muted hover:text-fg rounded text-[10px]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="px-2 py-1 bg-red/10 text-red rounded text-[10px]"
                      >
                        Del
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-[400px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-fg">Create Event</h3>

              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 hover:bg-card rounded-lg"
              >
                <span className="text-muted">✕</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                placeholder="Event name"
                required
              />

              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted">Event Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                    required
                  />
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-muted">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg border text-sm"
                  style={{ borderColor: '#2a2a32', color: '#aaa' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: '#4f46e5' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}