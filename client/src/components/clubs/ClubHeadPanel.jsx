import React, { useState, useEffect } from 'react'
import { X, Users, Calendar, CheckSquare, Edit2, Plus } from 'lucide-react'
import { clubService } from '../../services/clubService'

export function ClubHeadPanel({ club, onClose, user }) {
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => { loadData() }, [club?.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mRes, eRes, tRes] = await Promise.all([
        clubService.getClubMembers(club.id),
        clubService.getClubEvents(club.id),
        clubService.getClub(club.id),
      ])
      if (mRes?.data) setMembers(mRes.data)
      if (eRes?.data) setEvents(eRes.data)
      if (tRes?.data?.tasks) setTasks(tRes.data.tasks)
    } catch {}
    setLoading(false)
  }

  const handleAddEvent = async () => {
    const name = prompt('Event name:')
    if (!name) return
    try {
      await clubService.createClubEvent(club.id, { title: name, date: new Date().toISOString() })
      loadData()
    } catch {}
  }

  return (
    <div className="bg-surface border border-accent/30 rounded-2xl w-[500px] max-w-[90%] shadow-glow" onClick={(e) => e.stopPropagation()}>
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{club.icon}</span>
          <div>
            <h3 className="font-semibold text-fg text-lg">{club.name}</h3>
            <p className="text-xs text-muted">Club Head View</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg"><X size={16} className="text-muted" /></button>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          <button onClick={() => setActiveTab('members')} className={`bg-card border rounded-xl p-3 text-left transition-all ${activeTab === 'members' ? 'border-accent' : 'border-border hover:border-accent/30'}`}>
            <Users size={16} className="text-accent mb-1" />
            <p className="font-bold text-fg">{members.length || club.members}</p>
            <p className="text-[10px] text-muted">Members</p>
          </button>
          <button onClick={() => setActiveTab('events')} className={`bg-card border rounded-xl p-3 text-left transition-all ${activeTab === 'events' ? 'border-accent' : 'border-border hover:border-accent/30'}`}>
            <Calendar size={16} className="text-accent mb-1" />
            <p className="font-bold text-fg">{events.length || club.events}</p>
            <p className="text-[10px] text-muted">Events</p>
          </button>
          <button onClick={() => setActiveTab('tasks')} className={`bg-card border rounded-xl p-3 text-left transition-all ${activeTab === 'tasks' ? 'border-accent' : 'border-border hover:border-accent/30'}`}>
            <CheckSquare size={16} className="text-accent mb-1" />
            <p className="font-bold text-fg">{tasks.length || Math.floor((club.members || 0) * 0.3)}</p>
            <p className="text-[10px] text-muted">Tasks</p>
          </button>
        </div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-fg">{activeTab === 'members' ? 'Members' : activeTab === 'events' ? 'Events' : 'Tasks'}</h4>
          {activeTab === 'events' && (
            <button onClick={handleAddEvent} className="flex items-center gap-1 text-[11px] bg-accent text-white px-2 py-1 rounded-lg hover:bg-accentHover transition-colors"><Plus size={10} /> Add</button>
          )}
        </div>
        {loading ? <p className="text-muted text-sm">Loading...</p> : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {activeTab === 'members' && members.length === 0 && <p className="text-muted text-sm">No members yet</p>}
            {activeTab === 'members' && members.map((m) => (
              <div key={m.id || m.name} className="flex items-center gap-3 p-2 bg-card rounded-lg">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">{(m.name || 'U').split(' ').map(n => n[0]).join('')}</div>
                <span className="text-sm text-fg">{m.name || m.email}</span>
                {m.role === 'head' && <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full ml-auto">Head</span>}
              </div>
            ))}
            {activeTab === 'events' && events.length === 0 && <p className="text-muted text-sm">No events yet</p>}
            {activeTab === 'events' && events.map((ev) => (
              <div key={ev.id} className="p-2 bg-card rounded-lg text-sm text-fg">{ev.title || 'Untitled Event'}</div>
            ))}
            {activeTab === 'tasks' && tasks.length === 0 && <p className="text-muted text-sm">No tasks yet</p>}
            {activeTab === 'tasks' && tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 p-2 bg-card rounded-lg text-sm text-fg">
                <span className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green' : 'bg-yellow'}`}></span>
                {t.title || 'Task'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}