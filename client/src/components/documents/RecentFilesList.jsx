import React from 'react'

const typeStyles = {
  PDF: 'bg-red/10 text-red',
  DOCX: 'bg-blue/10 text-blue',
  XLSX: 'bg-green/10 text-green',
}

export function RecentFilesList({ files, onSelect }) {
  return (
    <div className="space-y-1">
      {files.map((file) => (
        <div key={file.id} onClick={() => onSelect?.(file)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card transition-colors cursor-pointer group">
          <div className={`w-8 h-8 rounded-lg ${typeStyles[file.type]} flex items-center justify-center text-[10px] font-bold`}>
            {file.type}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-fg truncate group-hover:text-accent transition-colors">{file.name}</p>
            <p className="text-[11px] text-muted">{file.size} · {file.modified}</p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-border rounded-lg">
            <span className="text-muted text-sm">⋯</span>
          </button>
        </div>
      ))}
    </div>
  )
}