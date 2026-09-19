import React, { useState, useEffect } from 'react'
import { VolunteerCard } from '../components/volunteers/VolunteerCard'
import { AddVolunteerModal } from '../components/volunteers/AddVolunteerModal'
import { dev1Service } from '../services/dev1Service'

export function VolunteersView() {
  const [volunteers, setVolunteers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadVolunteers() }, [])

  const loadVolunteers = async () => {
    try { const res = await dev1Service.getVolunteers(); setVolunteers(res?.data || res || []) } catch (error) { console.error(error) }
    setLoading(false)
  }

  const handleAdd = (form) => {
    const newVol = { ...form, id: Date.now(), capacity: 50, status: 'active' }
    setVolunteers((p) => [...p, newVol])
    dev1Service.createVolunteer(newVol).catch(console.error)
    setShowModal(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-fg">Volunteers</h2>
        <button onClick={() => setShowModal(true)} className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">+ Add Volunteer</button>
      </div>
      {loading ? <p className="text-muted">Loading...</p> : (
        <div className="grid grid-cols-3 gap-4">{volunteers.map((v) => <VolunteerCard key={v.id} volunteer={v} />)}</div>
      )}
      {showModal && <AddVolunteerModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  )
}