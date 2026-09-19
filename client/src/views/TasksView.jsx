import React, { useState, useEffect, useRef } from 'react'
import { KanbanBoard } from '../components/tasks/KanbanBoard'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { dev1Service } from '../services/dev1Service'

export function TasksView({ onTaskCreated, user }) {
  const [tasks, setTasks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [highlightedId, setHighlightedId] = useState(null)
  const prevLen = useRef(0)

  useEffect(() => { loadTasks() }, [])

  useEffect(() => {
    if (tasks.length > prevLen.current) {
      const newest = tasks[tasks.length - 1]
      if (newest) { setHighlightedId(newest.id); setTimeout(() => setHighlightedId(null), 3000) }
      if (onTaskCreated) onTaskCreated(newest)
    }
    prevLen.current = tasks.length
  }, [tasks])

  const loadTasks = async () => {
    try { const res = await dev1Service.getTasks(); setTasks(res?.data || res || []) } catch (error) { console.error(error) }
    setLoading(false)
  }

  const handleAdd = async (form) => {
    try {
      const createdTask = await dev1Service.createTask({ ...form, dueDate: form.dueDate || 'TBD' })
      setTasks((previous) => [...previous, createdTask])
      setShowModal(false)
    } catch (error) {
      console.error('Task creation failed:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-fg">Tasks</h2>
        {user?.role !== 'VOLUNTEER' && <button onClick={() => setShowModal(true)} className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">+ New Task</button>}
      </div>
      {loading ? <p className="text-muted">Loading...</p> : <KanbanBoard tasks={tasks} highlightedId={highlightedId} canManage={user?.role !== 'VOLUNTEER'} />}
      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  )
}