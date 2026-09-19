import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Command, Sparkles } from 'lucide-react'

const searchResults = [
  { type: 'Document', title: 'Annual Gala Proposal.pdf', section: 'Event Proposals' },
  { type: 'Task', title: 'Finalize venue contract', section: 'Tasks · To Do' },
  { type: 'Risk', title: 'Venue cancellation risk', section: 'Risks · High' },
  { type: 'Volunteer', title: 'Sarah Chen', section: 'Volunteers · Active' },
  { type: 'Meeting', title: 'Weekly Planning Call', section: 'Meetings · Sep 17' },
  { type: 'File', title: 'Q4 Budget Review.xlsx', section: 'Budgets' },
  { type: 'Task', title: 'Send speaker invitations', section: 'Tasks · To Do' },
]

export function AiSearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = query ? searchResults.filter((r) => r.title.toLowerCase().includes(query.toLowerCase())) : searchResults

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-24" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[520px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Sparkles className="text-accent shrink-0" size={18} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask AI or search anything..." className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-muted" />
          <kbd className="flex items-center gap-0.5 text-[10px] bg-card text-muted px-1.5 py-0.5 rounded"><Command size={10} />K</kbd>
        </div>
        <div className="p-2 max-h-[360px] overflow-y-auto">
          {!query && <div className="px-3 py-2 text-[11px] text-muted">Try: "find budget risks" or "create task for catering"</div>}
          {filtered.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Search size={14} className="text-accent" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg truncate">{r.title}</p>
                <p className="text-[11px] text-muted">{r.section}</p>
              </div>
              <span className="text-[10px] bg-card text-muted px-2 py-0.5 rounded-full">{r.type}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">No results found</div>}
        </div>
      </div>
    </div>
  )
}