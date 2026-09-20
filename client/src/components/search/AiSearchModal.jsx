import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Command, Sparkles } from 'lucide-react'
import { dev1Service } from '../../services/dev1Service'
import { dev2Service } from '../../services/dev2Service'

export function AiSearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (event) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    window.addEventListener('keydown', handler)

    let mounted = true
    Promise.all([
      dev2Service.getDocuments().catch(() => []),
      dev1Service.getTasks().catch(() => []),
      dev2Service.getRisks().catch(() => []),
      dev1Service.getVolunteers().catch(() => []),
      dev2Service.getMeetings().catch(() => []),
    ]).then(([documents, tasks, risks, volunteers, meetings]) => {
      if (!mounted) return
      const safeDocs = Array.isArray(documents) ? documents : Array.isArray(documents?.data) ? documents.data : []
      const safeTasks = Array.isArray(tasks) ? tasks : Array.isArray(tasks?.data) ? tasks.data : []
      const safeRisks = Array.isArray(risks) ? risks : Array.isArray(risks?.data) ? risks.data : []
      const safeVols = Array.isArray(volunteers) ? volunteers : Array.isArray(volunteers?.data) ? volunteers.data : []
      const safeMeetings = Array.isArray(meetings) ? meetings : Array.isArray(meetings?.data) ? meetings.data : []

      setResults([
        ...safeDocs.map((item) => ({ type: 'Document', title: item.title, section: 'Documents' })),
        ...safeTasks.map((item) => ({ type: 'Task', title: item.title, section: 'Tasks' })),
        ...safeRisks.map((item) => ({ type: 'Risk', title: item.title, section: 'Risks' })),
        ...safeVols.map((item) => ({ type: 'Volunteer', title: item.name, section: 'Volunteers' })),
        ...safeMeetings.map((item) => ({ type: 'Meeting', title: item.title, section: 'Meetings' })),
      ])
    }).catch(() => {
      if (mounted) setResults([])
    }).finally(() => {
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      window.removeEventListener('keydown', handler)
    }
  }, [])

  const filtered = query ? results.filter((result) => result.title?.toLowerCase().includes(query.toLowerCase())) : results

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-24" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[520px] max-w-[90%]" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Sparkles className="text-accent shrink-0" size={18} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search connected ClubOps data..." className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-muted" />
          <button onClick={onClose} className="p-1 text-muted hover:text-fg"><X size={16} /></button>
          <kbd className="flex items-center gap-0.5 text-[10px] bg-card text-muted px-1.5 py-0.5 rounded"><Command size={10} />K</kbd>
        </div>
        <div className="p-2 max-h-[360px] overflow-y-auto">
          {loading && <div className="px-3 py-6 text-center text-sm text-muted">Loading connected data...</div>}
          {!loading && filtered.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">No results found</div>}
          {filtered.map((result, index) => (
            <div key={`${result.type}-${result.title}-${index}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card transition-colors">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><Search size={14} className="text-accent" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg truncate">{result.title}</p>
                <p className="text-[11px] text-muted">{result.section}</p>
              </div>
              <span className="text-[10px] bg-card text-muted px-2 py-0.5 rounded-full">{result.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
