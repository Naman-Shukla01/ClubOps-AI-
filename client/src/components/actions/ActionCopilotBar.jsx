import React, { useState } from 'react'
import {
  Send,
  Sparkles,
  Loader2,
  Check,
  Edit2,
} from 'lucide-react'
import { dev1Service } from '../../services/dev1Service'

const examples = [
  'Create a task for finalizing venue contract',
  'Send reminder to volunteers about Sunday shift',
  'Update budget for catering increase',
]

export default function ActionCopilotBar({ onTaskCreated }) {
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdTask, setCreatedTask] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  const handleSubmit = async () => {
    if (!command.trim()) return

    setLoading(true)

    const task = {
      id: Date.now(),
      title: command.trim(),
      status: 'todo',
      priority: 'medium',
      assignee: '',
      tags: ['copilot'],
      dueDate: '',
    }

    try {
      const response = await dev1Service.createTask(task)

      const created =
        response?.data ||
        response ||
        task

      setCreatedTask({
        ...task,
        ...created,
        title: created.title || task.title,
      })

      if (onTaskCreated) {
        onTaskCreated({
          ...task,
          ...created,
          title: created.title || task.title,
        })
      }
    } catch {
      // Keep the prototype functional even when backend is unavailable.
      setCreatedTask(task)

      if (onTaskCreated) {
        onTaskCreated(task)
      }
    }

    setCommand('')
    setLoading(false)
  }

  const startEdit = () => {
    if (!createdTask) return

    setEditForm({
      ...createdTask,
    })

    setEditing(true)
  }

  const saveEdit = async () => {
    if (!createdTask || !editForm.title?.trim()) return

    const updatedTask = {
      ...createdTask,
      ...editForm,
      title: editForm.title.trim(),
    }

    try {
      await dev1Service.updateTask(
        createdTask.id,
        updatedTask
      )
    } catch (error) {
      console.error(
        'Unable to update task:',
        error
      )
    }

    setCreatedTask(updatedTask)

    if (onTaskCreated) {
      onTaskCreated(updatedTask)
    }

    setEditing(false)
  }

  const clearTask = () => {
    setCreatedTask(null)
    setEditing(false)
    setEditForm({})

    if (onTaskCreated) {
      onTaskCreated(null)
    }
  }

  /*
   * Created task view
   */
  if (createdTask && !editing) {
    return (
      <div className="bg-surface border border-green/30 rounded-2xl p-5 shadow-glow">
        <div className="flex items-center gap-2 mb-3">
          <Check
            size={18}
            className="text-green"
          />

          <h4 className="text-sm font-semibold text-green">
            Task Created!
          </h4>

          <button
            onClick={clearTask}
            className="ml-auto text-muted hover:text-fg text-xs"
          >
            ✕ Clear
          </button>
        </div>

        <div className="bg-card rounded-xl p-4 mb-3">
          <p className="text-sm font-medium text-fg">
            {createdTask.title}
          </p>

          <div className="flex gap-4 mt-2 text-xs text-muted">
            <span>
              📋 {createdTask.status || 'todo'}
            </span>

            <span>
              🏷 {createdTask.priority || 'medium'}
            </span>

            <span>
              👤 {createdTask.assignee || 'Unassigned'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={startEdit}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit2 size={13} />
            Edit Task
          </button>

          <button
            onClick={clearTask}
            className="px-4 py-2 bg-card border border-border text-muted hover:text-fg rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  /*
   * Edit task view
   */
  if (editing && createdTask) {
    return (
      <div className="bg-surface border border-accent/30 rounded-2xl p-5 shadow-glow">
        <div className="flex items-center gap-2 mb-3">
          <Edit2
            size={18}
            className="text-accent"
          />

          <h4 className="text-sm font-semibold text-accent">
            Edit Task
          </h4>
        </div>

        <div className="space-y-3">
          <input
            value={editForm.title || ''}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                title: e.target.value,
              })
            }
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
            placeholder="Task title"
          />

          <div className="grid grid-cols-3 gap-3">
            <select
              value={
                editForm.priority || 'medium'
              }
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  priority: e.target.value,
                })
              }
              className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
            >
              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>

            <input
              value={editForm.assignee || ''}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  assignee: e.target.value,
                })
              }
              className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
              placeholder="Assignee"
            />

            <input
              type="date"
              value={editForm.dueDate || ''}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  dueDate: e.target.value,
                })
              }
              className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="px-4 py-2 bg-green hover:bg-green/80 text-black rounded-xl text-xs font-semibold transition-colors"
            >
              <Check
                size={13}
                className="inline mr-1"
              />
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-card border border-border text-muted hover:text-fg rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  /*
   * Default Copilot view
   */
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Sparkles
          size={16}
          className="text-accent shrink-0"
        />

        <h4 className="text-sm font-semibold text-fg">
          Action Copilot
        </h4>

        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full ml-auto">
          AI-Powered
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2 focus-within:border-accent transition-colors">
          <input
            value={command}
            onChange={(e) =>
              setCommand(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            placeholder="Describe what you want to do..."
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted px-2"
          />

          <button
            onClick={handleSubmit}
            disabled={
              loading || !command.trim()
            }
            className={`p-2 rounded-lg transition-all ${loading || !command.trim()
              ? 'bg-surface text-muted cursor-not-allowed'
              : 'bg-accent hover:bg-accentHover text-white'
              }`}
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() =>
                setCommand(example)
              }
              className="text-[11px] bg-card text-muted hover:text-fg hover:bg-cardHover px-2.5 py-1 rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}