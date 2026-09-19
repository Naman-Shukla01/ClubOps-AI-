import React, { useState, useEffect } from 'react'
import { VolunteerCard } from '../components/volunteers/VolunteerCard'
import { AddVolunteerModal } from '../components/volunteers/AddVolunteerModal'
import { dev1Service } from '../services/dev1Service'

export function VolunteersView({ user }) {
  const [volunteers, setVolunteers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const clubId = user?.activeClubId

  useEffect(() => {
    loadVolunteers()
  }, [clubId])

  const loadVolunteers = async () => {
    setLoading(true)

    if (!clubId) {
      setVolunteers([])
      setLoading(false)
      return
    }

    const key = `volunteers_${clubId}`
    const stored = localStorage.getItem(key)

    if (stored) {
      setVolunteers(JSON.parse(stored))
      setLoading(false)
      return
    }

    try {
      const res = await dev1Service.getVolunteers()
      let data = res?.data || res || []

      data = data.filter(
        (v) => !v.clubId || String(v.clubId) === String(clubId)
      )

      if (!data.length) {
        data = [
          {
            id: `${clubId}-vol-1`,
            name: 'Club Volunteer',
            role: 'Volunteer',
            capacity: 50,
            status: 'active',
            clubId,
          },
        ]
      }

      setVolunteers(data)
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      setVolunteers([])
    }

    setLoading(false)
  }

  const handleAdd = (form) => {
    const newVol = {
      ...form,
      id: Date.now(),
      capacity: 50,
      status: 'active',
      clubId,
    }

    const updated = [...volunteers, newVol]
    setVolunteers(updated)

    localStorage.setItem(`volunteers_${clubId}`, JSON.stringify(updated))
    dev1Service.createVolunteer(newVol).catch(() => { })
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-fg">Volunteers</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span>👥</span> + Add Volunteer
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : volunteers.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl">👥</span>
          <p className="text-muted mt-2">No volunteers yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {volunteers.map((v) => (
            <VolunteerCard key={v.id} volunteer={v} />
          ))}
        </div>
      )}

      {showModal && (
        <AddVolunteerModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}
