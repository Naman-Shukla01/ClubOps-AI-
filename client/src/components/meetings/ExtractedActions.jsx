import React, { useState, useEffect } from 'react'
import { Check, Plus, RefreshCw } from 'lucide-react'
import { dev1Service } from '../../services/dev1Service'
import { canManageClubWork } from '../../utils/permissions'

const DEFAULT_ACTIONS = []

export function ExtractedActions({ actions: providedActions = DEFAULT_ACTIONS, user }) {
  const [actions, setActions] = useState(providedActions || DEFAULT_ACTIONS)
  const [loading, setLoading] = useState(false)
  const [syncedIds, setSyncedIds] = useState(new Set())
  const canCreateTasks = canManageClubWork(user)

  useEffect(() => {
    if (providedActions && Array.isArray(providedActions)) {
      setActions(providedActions)
      setSyncedIds(new Set())
    }
  }, [providedActions?.length, JSON.stringify(providedActions)])

  const handleSync = async () => {
    if (!canCreateTasks) return
    setLoading(true)
    for (const action of actions) {
      if (!syncedIds.has(action.id)) {
        await dev1Service.createTask({ title: action.text, status: 'todo', priority: action.priority, assignee: action.owner, tags: ['meeting-action'] }).catch(console.error)
        setSyncedIds((prev) => new Set([...prev, action.id]))
      }
    }
    setLoading(false)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h4 className="text-sm font-semibold text-fg">Extracted Actions</h4>
          <p className="text-[11px] text-muted">{actions.length} items parsed</p>
        </div>
        {canCreateTasks && <button onClick={handleSync} disabled={loading || actions.length === 0 || syncedIds.size === actions.length}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            loading ? 'bg-accent/20 text-accent cursor-wait' :
            syncedIds.size === actions.length && actions.length > 0 ? 'bg-green/15 text-green cursor-default' :
            'bg-accent hover:bg-accentHover text-white'
          }`}>
          {loading ? <RefreshCw size={13} className="animate-spin" /> : syncedIds.size === actions.length && actions.length > 0 ? <Check size={13} /> : <Plus size={13} />}
          {loading ? 'Syncing...' : syncedIds.size === actions.length && actions.length > 0 ? 'All Synced' : 'Sync to Tasks'}
        </button>}
      </div>
      <div className="divide-y divide-border">
        {actions.length === 0 ? (
          <p className="p-4 text-xs text-muted text-center">No action items extracted yet. Process a meeting transcript to generate actions.</p>
        ) : (
          actions.map((action) => {
            const synced = syncedIds.has(action.id)
            return (
              <div key={action.id} className="flex items-center gap-3 p-3.5 hover:bg-card/50 transition-colors">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${synced ? 'bg-green border-green' : 'border-border'}`}>
                  {synced && <Check size={12} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${synced ? 'text-muted line-through' : 'text-fg'}`}>{action.text}</p>
                  <p className="text-[11px] text-muted">{action.owner} · {action.priority} priority</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
