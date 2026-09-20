import React, { useState, useEffect } from 'react'
import { dev2Service } from '../services/dev2Service'

export function EventsView({ user }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [editing, setEditing] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')

  const isClubHead = user?.role === 'club-head' || user?.role === 'lead' || user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN'
  const clubId = user?.activeClubId

  useEffect(() => {
    loadEvents()
  }, [clubId])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const response = await dev2Service.getEvents()
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : []

      const normalized = list.map((ev) => ({
        id: ev.id || ev._id,
        title: ev.name || ev.title || 'Untitled Event',
        date: ev.startDate || ev.date || new Date().toISOString(),
        type: ev.status || 'upcoming',
        clubId: clubId || '1',
      }))

      setEvents(normalized)
    } catch (error) {
      console.warn('Events fetch API failed:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const startDate = newDate ? new Date(newDate).toISOString() : new Date().toISOString()
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const eventPayload = {
      name: newTitle.trim(),
      title: newTitle.trim(),
      startDate,
      endDate,
      status: 'upcoming',
    }

    try {
      const created = await dev2Service.createEvent(eventPayload)
      const newEv = {
        id: created?.id || created?.data?.id || String(Date.now()),
        title: created?.name || created?.title || newTitle.trim(),
        date: startDate,
        type: 'upcoming',
        clubId: clubId || '1',
      }

      setEvents((prev) => [newEv, ...prev])
    } catch (err) {
      console.warn('Create event backend failed, fallback local update:', err)
      const localEv = {
        id: String(Date.now()),
        title: newTitle.trim(),
        date: startDate,
        type: 'upcoming',
        clubId: clubId || '1',
      }
      setEvents((prev) => [localEv, ...prev])
    }

    setNewTitle('')
    setNewDate('')
    setShowCreate(false)
  }

  const startEdit = (ev) => {
    setEditing(ev)
    setEditTitle(ev.title)
    setEditDate(ev.date ? new Date(ev.date).toISOString().split('T')[0] : '')
  }

  const saveEdit = () => {
    if (!editing || !editTitle.trim()) return

    const updated = events.map((e) =>
      e.id === editing.id
        ? {
          ...e,
          title: editTitle.trim(),
          date: editDate || e.date,
        }
        : e
    )

    setEvents(updated)
    setEditing(null)
  }

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
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

                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                  />

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
                      {ev.title}
                    </h3>

                    <p className="text-xs text-muted">
                      {ev.date
                        ? new Date(ev.date).toLocaleDateString()
                        : 'No date'}
                    </p>
                  </div>

                  <span className="px-2 py-1 text-[10px] rounded-full bg-green/15 text-green">
                    {ev.type}
                  </span>

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

              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
              />

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