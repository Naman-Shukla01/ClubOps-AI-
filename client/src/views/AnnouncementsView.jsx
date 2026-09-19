import React, { useState } from 'react'
import BroadcastPreview from '../components/announcements/BroadcastPreview'
import { announcements as initialAnnouncements } from '../data/mockData'
import { Plus } from 'lucide-react'
import { dev2Service } from '../services/dev2Service'

export function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [selectedId, setSelectedId] = useState(initialAnnouncements[0]?.id || null)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [channels, setChannels] = useState(['WhatsApp'])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    const newAnn = { id: Date.now(), title: newTitle, content: newContent, channels, status: 'draft' }
    setAnnouncements((p) => [newAnn, ...p])
    setSelectedId(newAnn.id)
    setNewTitle('')
    setNewContent('')
    setShowForm(false)
    try { await dev2Service.createRisk({ title: newTitle, category: 'Announcement', severity: 'low', mitigation: newContent }) } catch { }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-fg">Announcements</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Announcement title" className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent mb-3" />
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Content..." rows={3} className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent mb-3 resize-none" />
          <div className="flex items-center gap-3">
            {['WhatsApp', 'Discord', 'Email'].map((ch) => (
              <button key={ch} onClick={() => setChannels((p) => p.includes(ch) ? p.filter((c) => c !== ch) : [...p, ch])} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${channels.includes(ch) ? 'bg-accent/15 text-accent' : 'bg-surface text-muted'}`}>{ch}</button>
            ))}
            <button onClick={handleCreate} className="bg-green hover:bg-green/80 text-black px-4 py-1.5 rounded-lg text-xs font-semibold">Create & Save</button>
          </div>
        </div>
      )}
      <div className="flex gap-6">
        <div className="w-[280px] space-y-2">
          {announcements.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)} className={`w-full text-left p-3 rounded-xl transition-all ${selectedId === a.id ? 'bg-accent/10 border border-accent/30' : 'bg-card border border-border hover:bg-cardHover'}`}>
              <p className="text-sm font-medium text-fg">{a.title}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.status === 'scheduled' ? 'bg-yellow/15 text-yellow' : a.status === 'sent' ? 'bg-green/15 text-green' : 'bg-accent/15 text-accent'}`}>{a.status.toUpperCase()}</span>
            </button>
          ))}
        </div>
        <div className="flex-1"><BroadcastPreview announcement={announcements.find((a) => a.id === selectedId)} /></div>
      </div>
    </div>
  )
}