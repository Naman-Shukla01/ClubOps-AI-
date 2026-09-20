import React from 'react'
import { Sparkles } from 'lucide-react'

const typeStyles = {
  PDF: 'bg-red-500/10 text-red-400 border border-red-500/20',
  DOCX: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  DOC: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  TXT: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  XLSX: 'bg-green-500/10 text-green-400 border border-green-500/20',
}

export function RecentFilesList({ files, onSelect, onSummarize }) {
  if (!files || files.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted">
        No documents in this club yet.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {files.map((file) => {
        const hasSummary = Boolean(file.aiAnalysis?.summary)
        return (
          <div
            key={file.id}
            onClick={() => onSelect?.(file)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card transition-colors cursor-pointer group"
          >
            <div
              className={`w-8 h-8 rounded-lg ${
                typeStyles[file.type] || 'bg-accent/10 text-accent'
              } flex items-center justify-center text-[10px] font-bold shrink-0`}
            >
              {file.type || 'PDF'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-fg truncate group-hover:text-accent transition-colors">
                  {file.name}
                </p>
                {hasSummary && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/10 text-accent font-semibold flex items-center gap-0.5 shrink-0">
                    <Sparkles size={10} /> AI
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted">
                {file.size} · {file.modified}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSummarize?.(file)
              }}
              title={hasSummary ? 'View AI Summary' : 'Generate AI Summary'}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-accent/20 text-muted hover:text-accent rounded-lg"
            >
              <Sparkles size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}