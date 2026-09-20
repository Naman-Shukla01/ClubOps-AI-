import React, { useState, useEffect } from 'react'
import { ClubCard } from '../components/clubs/ClubCard'
import { CreateClubModal } from '../components/clubs/CreateClubModal'
import { clubService } from '../services/clubService'
import { normalizeRole } from '../utils/permissions'

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
  }, [user?.id])

  const loadClubs = async () => {
    setLoading(true)
    try {
      const res = await clubService.getClubs()
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []
      setClubs(list)

      const memberIdsSet = new Set()
      const memberClubsList = []

      list.forEach((c) => {
        const isMember = c.isMember || (Array.isArray(c.memberIds) && c.memberIds.map(String).includes(String(user?.id)))
        if (isMember) {
          memberIdsSet.add(String(c.id || c._id))
          memberClubsList.push({ id: c.id, name: c.name, icon: c.icon || '🏛️' })
        }
      })

      setJoinedClubs(memberIdsSet)

      if (setUser) {
        setUser((prev) => {
          if (!prev) return prev
          if (memberClubsList.length === 0) {
            const updated = { ...prev, joinedClubs: [], activeClubId: null, activeClubName: '', activeClubIcon: '' }
            localStorage.setItem('currentUser', JSON.stringify(updated))
            return updated
          }
          const activeClubId = prev.activeClubId && memberIdsSet.has(String(prev.activeClubId))
            ? prev.activeClubId
            : memberClubsList[0].id
          const activeObj = memberClubsList.find((mc) => String(mc.id) === String(activeClubId)) || memberClubsList[0]
          const updated = {
            ...prev,
            joinedClubs: memberClubsList,
            activeClubId: activeObj.id,
            activeClubName: activeObj.name,
            activeClubIcon: activeObj.icon,
          }
          localStorage.setItem('currentUser', JSON.stringify(updated))
          return updated
        })
      }
    } catch {
      setClubs([])
    }
    setLoading(false)
  }

  const isHead = (club) => {
    if (!user || !club) return false
    if (normalizeRole(user.role) === 'ADMIN') return true
    return String(club?.head?._id || club?.head?.id || club?.head || '') === String(user.id)
  }

  const handleCreate = async (form) => {
    setShowCreate(false)
    setLoading(true)
    try {
      const res = await clubService.createClub({ ...form, head: { name: user.name, email: user.email } })
      const created = res?.data
      if (!created) throw new Error('Club creation returned no saved club')
      setClubs((p) => [created, ...p])

      const cu = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const currentJoined = cu.joinedClubs || []
      const updatedJoined = [...currentJoined.filter((c) => c.id !== created.id), { id: created.id, name: created.name, icon: created.icon || '⭐', isLead: true }]
      cu.joinedClubs = updatedJoined
      cu.activeClubId = created.id
      cu.activeClubName = created.name
      cu.activeClubIcon = created.icon || '⭐'
      cu.role = res?.userRole || 'EVENT_MANAGER'
      localStorage.setItem('currentUser', JSON.stringify(cu))
      if (setUser) setUser({ ...cu })
      setJoinedClubs((p) => new Set([...p, created.id]))
    } catch (err) {
      setError(err?.message || 'Failed')
      setTimeout(() => setError(''), 3000)
    }
    setLoading(false)
  }

  const handleJoin = async (club) => {
    setActionLoading(club.id)
    try {
      await clubService.joinClub(club.id)
    } catch (error) {
      setError(error?.message || 'Failed to join club')
      setActionLoading(null)
      return
    }

    const memberClubObj = { id: club.id, name: club.name, icon: club.icon || '🏛️' }
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}')
    const currentJoined = cu.joinedClubs || []
    const updatedJoined = [...currentJoined.filter((c) => String(c.id) !== String(club.id)), memberClubObj]
    
    cu.joinedClubs = updatedJoined
    cu.activeClubId = club.id
    cu.activeClubName = club.name
    cu.activeClubIcon = club.icon || '🏛️'
    localStorage.setItem('currentUser', JSON.stringify(cu))
    if (setUser) setUser({ ...cu })

    setJoinedClubs((p) => new Set([...p, String(club.id)]))
    setClubs((p) => p.map((c) => (c.id === club.id ? { ...c, members: c.members + 1, isMember: true } : c)))
    setActionLoading(null)
  }

  const handleSetActive = (club) => {
    // Purely sets active club in state & local storage without calling backend join
    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}')
    cu.activeClubId = club.id
    cu.activeClubName = club.name
    cu.activeClubIcon = club.icon || '🏛️'
    localStorage.setItem('currentUser', JSON.stringify(cu))
    if (setUser) setUser({ ...cu })
  }

  const handleLeave = async (clubId) => {
    setActionLoading(clubId)
    try {
      await clubService.leaveClub(clubId)
    } catch (error) {
      setError(error?.message || 'Failed to leave club')
      setActionLoading(null)
      return
    }

    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}')
    cu.joinedClubs = (cu.joinedClubs || []).filter((c) => String(c.id) !== String(clubId))
    if (String(cu.activeClubId) === String(clubId)) {
      const first = cu.joinedClubs[0]
      cu.activeClubId = first?.id || null
      cu.activeClubName = first?.name || ''
      cu.activeClubIcon = first?.icon || ''
    }
    localStorage.setItem('currentUser', JSON.stringify(cu))
    if (setUser) setUser({ ...cu })

    setJoinedClubs((p) => {
      const n = new Set(p)
      n.delete(clubId)
      return n
    })
    setClubs((p) => p.map((c) => (c.id === clubId ? { ...c, members: Math.max(0, c.members - 1), isMember: false } : c)))
    setActionLoading(null)
  }

  const handleManage = (club) => {
    if (!isHead(club)) return
    setSelectedClub(club)
    setShowCreate(true)
  }

  const handleSaveClub = async (form) => {
    if (selectedClub) {
      if (!isHead(selectedClub)) {
        const permissionError = new Error('You can only manage clubs you created.')
        setError(permissionError.message)
        setTimeout(() => setError(''), 3000)
        throw permissionError
      }

      const clubId = selectedClub.id || selectedClub._id
      setActionLoading(clubId)
      try {
        const payload = {
          name: form.name,
          icon: form.icon,
          color: form.color,
          description: form.description,
          maxMembers: form.maxMembers,
          skills: typeof form.skills === 'string'
            ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : form.skills,
        }
        const updatedClub = await clubService.updateClub(clubId, payload)
        setClubs((prev) => prev.map((club) => (
          String(club.id || club._id) === String(clubId) ? updatedClub : club
        )))

        const cu = JSON.parse(localStorage.getItem('currentUser') || '{}')
        if (String(cu.activeClubId) === String(clubId)) {
          cu.activeClubName = updatedClub.name || cu.activeClubName
          cu.activeClubIcon = updatedClub.icon || cu.activeClubIcon
          cu.joinedClubs = (cu.joinedClubs || []).map((club) => (
            String(club.id) === String(clubId)
              ? { ...club, name: updatedClub.name, icon: updatedClub.icon || club.icon }
              : club
          ))
          localStorage.setItem('currentUser', JSON.stringify(cu))
          if (setUser) setUser({ ...cu })
        }

        setShowCreate(false)
        setSelectedClub(null)
      } catch (err) {
        setError(err?.message || 'Failed to update club')
        setTimeout(() => setError(''), 3000)
        throw err
      } finally {
        setActionLoading(null)
      }
    } else {
      await handleCreate(form)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">Clubs</h2>
          <p className="text-muted text-sm">Join multiple clubs & manage events</p>
        </div>
        <button
          onClick={() => {
            setSelectedClub(null)
            setShowCreate(true)
          }}
          className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm"
        >
          + Create Club
        </button>
      </div>

      {error && <div className="mb-4 bg-red/10 border border-red/30 text-red px-4 py-2 rounded-xl text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse"></div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">&#127968;</p>
          <p className="text-muted">No clubs yet. Create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isMember={joinedClubs.has(String(club.id || club._id))}
              isHead={isHead(club)}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onManage={handleManage}
              onSetActive={handleSetActive}
              loading={actionLoading === club.id}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClubModal
          initialClub={selectedClub}
          onClose={() => {
            setShowCreate(false)
            setSelectedClub(null)
          }}
          onCreate={handleSaveClub}
        />
      )}
    </div>
  )
}
