import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Command, Sparkles } from 'lucide-react'
import { dev1Service } from '../../services/dev1Service'
import { dev2Service } from '../../services/dev2Service'

export function AiSearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [aiAnswer, setAiAnswer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    Promise.all([
      dev2Service.getDocuments(),
      dev1Service.getTasks(),
      dev2Service.getRisks(),
      dev1Service.getVolunteers(),
      dev2Service.getMeetings(),
    ]).then(([documents, tasks, risks, volunteers, meetings]) => {
      setResults([
        ...documents.map((item) => ({ type: 'Document', title: item.title, section: 'Documents' })),
        ...tasks.map((item) => ({ type: 'Task', title: item.title, section: 'Tasks' })),
        ...risks.map((item) => ({ type: 'Risk', title: item.title, section: 'Risks' })),
        ...volunteers.map((item) => ({ type: 'Volunteer', title: item.name, section: 'Volunteers' })),
        ...meetings.map((item) => ({ type: 'Meeting', title: item.title, section: 'Meetings' })),
      ])
    }).catch(() => setResults([])).finally(() => setLoading(false))
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!query || query.length < 5) {
      setAiAnswer(null);
      return;
    }
    const timer = setTimeout(async () => {
      setAiLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/v1/ai/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setAiAnswer(data.answer);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAiLoading(false);
      }
    }, 800); // debounce
    return () => clearTimeout(timer);
  }, [query]);

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
        <div className="p-2 max-h-[460px] overflow-y-auto custom-scrollbar">
          {loading && <div className="px-3 py-6 text-center text-sm text-muted">Loading connected data...</div>}
          
          {!loading && query.length >= 5 && (
            <div className="mb-4 mx-2 mt-2 p-4 bg-accent/10 border border-accent/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-bold text-accent">AI Answer</span>
              </div>
              {aiLoading ? (
                <div className="text-sm text-muted animate-pulse">Thinking...</div>
              ) : (
                <div className="text-sm text-fg whitespace-pre-wrap leading-relaxed">{aiAnswer}</div>
              )}
            </div>
          )}

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
