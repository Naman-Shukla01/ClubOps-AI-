import React, { useState, useEffect } from 'react'

export function TasksView({ user }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')

  const [editing, setEditing] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editStatus, setEditStatus] = useState('todo')
  const [editAssignee, setEditAssignee] = useState('')

  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newAssignee, setNewAssignee] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

  const isClubHead = user?.role === 'club-head'
  const clubId = user?.activeClubId

  useEffect(() => {
    loadTasks()
  }, [clubId])

  const loadTasks = async () => {
    setLoading(true)

    if (!clubId) {
      setTasks([])
      setLoading(false)
      return
    }

    const key = `tasks_${clubId}`
    const stored = localStorage.getItem(key)

    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch {
        localStorage.removeItem(key)
        setTasks([])
      }

      setLoading(false)
      return
    }

    const initialTasks = [
      {
        id: `${clubId}-task-1`,
        title: `${user?.activeClubName || 'Club'} Event Planning`,
        status: 'todo',
        priority: 'high',
        assignee: user?.name || 'Unassigned',
        dueDate: '2026-10-10',
        clubId,
        tags: ['club'],
        updates: [],
      },
      {
        id: `${clubId}-task-2`,
        title: 'Prepare event requirements',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Club Volunteer',
        dueDate: '2026-10-15',
        clubId,
        tags: ['club'],
        updates: [],
      },
    ]

    setTasks(initialTasks)
    localStorage.setItem(key, JSON.stringify(initialTasks))
    setLoading(false)
  }

  const saveTasksState = (updated) => {
    setTasks(updated)
    localStorage.setItem(`tasks_${clubId}`, JSON.stringify(updated))
  }

  const handleCreate = (e) => {
    e.preventDefault()

    if (!newTitle.trim() || !clubId) return

    const task = {
      id: Date.now(),
      title: newTitle.trim(),
      status: 'todo',
      priority: newPriority,
      assignee: newAssignee.trim() || 'Unassigned',
      dueDate: newDueDate,
      clubId,
      tags: ['club'],
      updates: [],
    }

    saveTasksState([task, ...tasks])

    setNewTitle('')
    setNewPriority('medium')
    setNewAssignee('')
    setNewDueDate('')
    setShowCreate(false)
  }

  const handleStatusChange = (task, nextStatus) => {
    // Club heads can update any task.
    // Regular members can update only their own assigned tasks.
    const canUpdateStatus =
      isClubHead ||
      (
        task.assignee &&
        user?.name &&
        task.assignee.toLowerCase().trim() === user.name.toLowerCase().trim()
      )

    if (!canUpdateStatus) return

    let updateNote = ''

    if (nextStatus === 'completed') {
      const inputNote = prompt(
        'Add work completion note (optional):',
        'Task completed successfully!'
      )

      if (inputNote !== null) {
        updateNote = inputNote
      }
    }

    const updated = tasks.map((t) => {
      if (t.id === task.id) {
        const notes = [...(t.updates || [])]

        if (updateNote) {
          notes.push({
            text: updateNote,
            by: user?.name || 'Volunteer',
            at: new Date().toLocaleTimeString(),
          })
        }

        return {
          ...t,
          status: nextStatus,
          updates: notes,
        }
      }

      return t
    })

    saveTasksState(updated)
  }

  const startEdit = (task) => {
    if (!isClubHead) return

    setEditing(task)
    setEditTitle(task.title)
    setEditStatus(task.status)
    setEditAssignee(task.assignee)
  }

  const saveEdit = () => {
    if (!editing || !editTitle.trim() || !isClubHead) return

    const updated = tasks.map((t) =>
      t.id === editing.id
        ? {
          ...t,
          title: editTitle.trim(),
          status: editStatus,
          assignee: editAssignee.trim() || 'Unassigned',
        }
        : t
    )

    saveTasksState(updated)
    setEditing(null)
  }

  const deleteTask = (taskId) => {
    if (!isClubHead) return

    saveTasksState(tasks.filter((t) => t.id !== taskId))
  }

  const allFiltered =
    filter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === filter)

  const myTasks = allFiltered.filter(
    (t) =>
      t.assignee &&
      user?.name &&
      t.assignee.toLowerCase().trim() === user.name.toLowerCase().trim()
  )

  const otherTasks = allFiltered.filter(
    (t) =>
      !(
        t.assignee &&
        user?.name &&
        t.assignee.toLowerCase().trim() === user.name.toLowerCase().trim()
      )
  )

  const priorityColors = {
    high: 'bg-red/15 text-red',
    medium: 'bg-yellow/15 text-yellow',
    low: 'bg-green/15 text-green',
  }

  const statusColors = {
    todo: 'bg-muted/15 text-muted',
    'in-progress': 'bg-blue/15 text-blue',
    completed: 'bg-green/15 text-green',
  }

  const renderTask = (task) => {
    const isMyTask =
      task.assignee &&
      user?.name &&
      task.assignee.toLowerCase().trim() === user.name.toLowerCase().trim()

    const canUpdateStatus = isClubHead || isMyTask

    return (
      <div
        key={task.id}
        className="bg-card border border-border rounded-xl p-4 space-y-2"
      >
        {editing?.id === task.id ? (
          <div className="space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
              placeholder="Task title"
            />

            <div className="flex gap-2">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-fg"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <input
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-fg outline-none"
                placeholder="Assignee"
              />

              <button
                onClick={saveEdit}
                className="bg-accent text-white px-3 py-2 rounded-lg text-xs"
              >
                ✓ Save
              </button>

              <button
                onClick={() => setEditing(null)}
                className="bg-card border border-border text-muted px-3 py-2 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full ${priorityColors[task.priority] ||
                  'bg-muted/15 text-muted'
                  }`}
              >
                {task.priority || 'medium'}
              </span>

              <span
                className={`px-2 py-0.5 text-[10px] rounded-full ${statusColors[task.status] ||
                  'bg-muted/15 text-muted'
                  }`}
              >
                {task.status || 'todo'}
              </span>

              <span className="flex-1 text-sm text-fg font-medium">
                {task.title}
              </span>

              <span className="text-xs text-muted">
                👤 {task.assignee || 'Unassigned'}
              </span>

              <div className="flex gap-1">
                {isClubHead && (
                  <>
                    <button
                      onClick={() => startEdit(task)}
                      className="px-2 py-1 bg-surface text-muted hover:text-fg rounded text-[10px]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-2 py-1 bg-red/10 text-red rounded text-[10px]"
                    >
                      Del
                    </button>
                  </>
                )}

                {canUpdateStatus && (
                  <button
                    onClick={() =>
                      handleStatusChange(
                        task,
                        task.status === 'todo'
                          ? 'in-progress'
                          : task.status === 'in-progress'
                            ? 'completed'
                            : 'todo'
                      )
                    }
                    className="px-2.5 py-1 bg-accent/20 text-accent font-medium rounded text-[10px] hover:bg-accent/30 transition-colors"
                  >
                    {task.status === 'todo'
                      ? 'Start Task'
                      : task.status === 'in-progress'
                        ? 'Mark Done'
                        : 'Reopen'}
                  </button>
                )}
              </div>
            </div>

            {task.updates && task.updates.length > 0 && (
              <div className="pl-4 border-l-2 border-accent/40 space-y-1 mt-2">
                {task.updates.map((u, idx) => (
                  <p key={idx} className="text-xs text-muted">
                    💬{' '}
                    <span className="font-semibold text-fg">
                      {u.by}
                    </span>
                    : {u.text}{' '}
                    <span className="text-[10px]">
                      ({u.at})
                    </span>
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">
            {clubId ? 'Club Tasks' : 'Tasks'}
          </h2>

          <p className="text-muted text-sm">
            {user?.activeClubName
              ? user.activeClubName + ' tasks'
              : 'Create, assign, and track tasks'}
          </p>
        </div>

        {isClubHead && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>✅</span> + Create Task
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'todo', 'in-progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs ${filter === f
              ? 'bg-accent text-white'
              : 'bg-card text-muted border border-border'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* YOUR TASKS SECTION */}
          <div>
            <h3 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
              <span>🎯</span> Your Tasks

              <span className="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full">
                {myTasks.length}
              </span>
            </h3>

            {myTasks.length === 0 ? (
              <div className="text-center py-6 bg-card border border-border rounded-xl">
                <p className="text-muted text-sm">
                  No tasks assigned to you
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.map(renderTask)}
              </div>
            )}
          </div>

          {/* OTHER CLUB TASKS SECTION */}
          <div>
            <h3 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
              <span>📋</span> Other Club Tasks

              <span className="bg-muted/20 text-muted text-[10px] px-2 py-0.5 rounded-full">
                {otherTasks.length}
              </span>
            </h3>

            {otherTasks.length === 0 ? (
              <div className="text-center py-6 bg-card border border-border rounded-xl">
                <p className="text-muted text-sm">
                  No other tasks in this club
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherTasks.map(renderTask)}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-fg">
                Create Task
              </h3>

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
                placeholder="Task title"
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <input
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                  placeholder="Assignee"
                />

                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: '#2a2a32',
                    color: '#aaa',
                  }}
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