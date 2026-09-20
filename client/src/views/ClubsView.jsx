import React, { useState, useEffect } from 'react'
import { ClubCard } from '../components/clubs/ClubCard'
import { CreateClubModal } from '../components/clubs/CreateClubModal'
import { clubService } from '../services/clubService'

export function ClubsView({ user, setUser, setActiveTab }) {
  const [clubs, setClubs] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinedClubs, setJoinedClubs] = useState(new Set())
  const [selectedClub, setSelectedClub] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadClubs()
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const joinedIds = (cu.joinedClubs || []).map((c) => c.id)
    if (cu.activeClubId) joinedIds.push(cu.activeClubId)
    setJoinedClubs(new Set(joinedIds))
  }, [])

  const loadClubs = async () => {
    setLoading(true)
    try {
      const res = await clubService.getClubs()
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setClubs(list)
    } catch {
      setClubs([])
    }
    setLoading(false)
  }

  const isHead = (club) => user && (club?.head?.name === user.name || user.role === 'club-head')

  const handleCreate = async (form) => {
    setShowCreate(false)
    setLoading(true)
    try {
      const res = await clubService.createClub({ ...form, head: { name: user.name, email: user.email } })
      const created = res?.data || { ...form, id: Date.now(), icon: form.icon || '⭐', color: '#7c5cfc', members: 1, events: 0, skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [], head: { name: user.name, email: user.email } }
      setClubs((p) => [created, ...p])

      const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
      const currentJoined = cu.joinedClubs || []
      const updatedJoined = [...currentJoined.filter(c => c.id !== created.id), { id: created.id, name: created.name, icon: created.icon || '⭐', isLead: true }]
      cu.joinedClubs = updatedJoined
      cu.activeClubId = created.id
      cu.activeClubName = created.name
      cu.activeClubIcon = created.icon || '⭐'
      // Mark this user as lead organizer of the club they created
      cu.isClubLead = true
      cu.role = res?.userRole || 'EVENT_MANAGER'
      localStorage.setItem("currentUser", JSON.stringify(cu))
      if (setUser) setUser({ ...cu })
      setJoinedClubs((p) => new Set([...p, created.id]))
    } catch (err) { setError(err?.message || 'Failed'); setTimeout(() => setError(''), 3000) }
    setLoading(false)
  }

  const handleJoin = async (club) => {
    setActionLoading(club.id)
    try { await clubService.joinClub(club.id) } catch { }
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const currentJoined = cu.joinedClubs || []
    const updatedJoined = [...currentJoined.filter(c => c.id !== club.id), { id: club.id, name: club.name, icon: club.icon || '🏛️', isLead: false }]
    cu.joinedClubs = updatedJoined
    cu.activeClubId = club.id
    cu.activeClubName = club.name
    cu.activeClubIcon = club.icon || '🏛️'
    cu.members = (cu.members || 0) + 1
    // Joining = volunteer, NOT lead organizer
    cu.isClubLead = false
    cu.role = cu.role === 'EVENT_MANAGER' ? 'EVENT_MANAGER' : 'VOLUNTEER'
    localStorage.setItem("currentUser", JSON.stringify(cu))
    if (setUser) setUser({ ...cu })
    setJoinedClubs((p) => new Set([...p, club.id]))
    setClubs((p) => p.map((c) => c.id === club.id ? { ...c, members: c.members + 1 } : c))
    setActionLoading(null)
  }

  const handleLeave = async (clubId) => {
    setActionLoading(clubId)
    try { await clubService.leaveClub(clubId) } catch { }
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
    cu.joinedClubs = (cu.joinedClubs || []).filter((c) => c.id !== clubId)
    if (cu.activeClubId === clubId) {
      const first = cu.joinedClubs[0]
      cu.activeClubId = first?.id || null
      cu.activeClubName = first?.name || ''
      cu.activeClubIcon = first?.icon || ''
    }
    localStorage.setItem("currentUser", JSON.stringify(cu))
    if (setUser) setUser(cu)
    setJoinedClubs((p) => { const n = new Set(p); n.delete(clubId); return n })
    setClubs((p) => p.map((c) => c.id === clubId ? { ...c, members: Math.max(0, c.members - 1) } : c))
    setActionLoading(null)
  }

  const handleManage = (club) => {
    setSelectedClub(club)
    setShowCreate(true)
  }

  const handleSaveClub = async (form) => {
    if (selectedClub) {
      // Editing existing club
      const updatedList = clubs.map((c) =>
        String(c.id) === String(selectedClub.id)
          ? {
            ...c,
            ...form,
            skills: typeof form.skills === 'string' ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : form.skills
          }
          : c
      )
      setClubs(updatedList)

      // Save to custom created_clubs in localStorage
      const custom = JSON.parse(localStorage.getItem("created_clubs") || "[]")
      const updatedCustom = custom.map((c) =>
        String(c.id) === String(selectedClub.id) ? { ...c, ...form } : c
      )
      if (!custom.some(c => String(c.id) === String(selectedClub.id))) {
        updatedCustom.push({ ...selectedClub, ...form })
      }
      localStorage.setItem("created_clubs", JSON.stringify(updatedCustom))

      // Update current user if active
      const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
      if (String(cu.activeClubId) === String(selectedClub.id)) {
        cu.activeClubName = form.name || cu.activeClubName
        cu.activeClubIcon = form.icon || cu.activeClubIcon
        localStorage.setItem("currentUser", JSON.stringify(cu))
        if (setUser) setUser(cu)
      }

      setShowCreate(false)
      setSelectedClub(null)
    } else {
      await handleCreate(form)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-2xl font-bold text-fg">Clubs</h2><p className="text-muted text-sm">Join multiple clubs & manage events</p></div>
        <button onClick={() => { setSelectedClub(null); setShowCreate(true) }} className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm">+ Create Club</button>
      </div>
      {error && <div className="mb-4 bg-red/10 border border-red/30 text-red px-4 py-2 rounded-xl text-sm">{error}</div>}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse"></div>)}</div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20"><p className="text-4xl mb-4">&#127968;</p><p className="text-muted">No clubs yet. Create one!</p></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} isMember={joinedClubs.has(club.id)} isHead={isHead(club)} onJoin={handleJoin} onLeave={handleLeave} onManage={handleManage} loading={loading} />
          ))}
        </div>
      )}
      {showCreate && (
        <CreateClubModal
          initialClub={selectedClub}
          onClose={() => { setShowCreate(false); setSelectedClub(null) }}
          onCreate={handleSaveClub}
        />
      )}
    </div>
  )
}
