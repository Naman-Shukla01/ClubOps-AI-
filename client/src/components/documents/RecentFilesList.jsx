import React from 'react'
import { Sparkles, Calendar, CheckSquare, ShieldAlert, FileText, ChevronRight } from 'lucide-react'

const typeStyles = {
  PDF: 'bg-red-500/10 text-red-400 border border-red-500/20',
  DOCX: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  DOC: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  TXT: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  XLSX: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
}

export function RecentFilesList({ files, onSelect, onSummarize }) {
  if (!files || files.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted">
        No documents in this list.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/60">
      {files.map((file) => {
        const ai = file.aiAnalysis || {}
        const hasSummary = Boolean(ai.summary)
        const taskCount = Array.isArray(ai.tasks) ? ai.tasks.length : 0
        const riskCount = Array.isArray(ai.risks) ? ai.risks.length : 0
        const eventName = file.event?.name || file.event?.title

        return (
          <div
            key={file.id}
            onClick={() => onSelect?.(file)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-card/70 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl ${
                  typeStyles[file.type] || 'bg-accent/10 text-accent'
                } flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 sm:mt-0`}
              >
                {file.type || 'PDF'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold text-fg group-hover:text-accent transition-colors truncate">
                    {file.name}
                  </p>
                  {hasSummary && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold flex items-center gap-1 shrink-0">
                      <Sparkles size={10} /> AI Analyzed
                    </span>
                  )}
                  {eventName && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-card border border-border text-muted font-medium flex items-center gap-1 shrink-0">
                      <Calendar size={10} /> {eventName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted mt-1 flex-wrap">
                  <span>{file.size}</span>
                  <span>·</span>
                  <span>Modified {file.modified}</span>

                  {(taskCount > 0 || riskCount > 0) && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-2">
                        {taskCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckSquare size={11} /> {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                          </span>
                        )}
                        {riskCount > 0 && (
                          <span className="flex items-center gap-1 text-red-400 font-semibold">
                            <ShieldAlert size={11} /> {riskCount} {riskCount === 1 ? 'risk' : 'risks'}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSummarize?.(file)
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg text-xs font-semibold transition-all"
              >
                <Sparkles size={12} />
                <span>{hasSummary ? 'Inspect AI' : 'Analyze'}</span>
              </button>
              <ChevronRight size={16} className="text-muted group-hover:text-accent transition-colors" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RecentFilesList