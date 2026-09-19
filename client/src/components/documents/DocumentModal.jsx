
import React from 'react'
import { X } from 'lucide-react'

export function DocumentModal({ file, onClose }) {
  if (!file) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[640px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">{file.name}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="bg-card rounded-xl p-4 text-sm text-muted leading-relaxed font-mono">
            <p>Document preview for: {file.name}</p>
            <p>Size: {file.size} · Modified: {file.modified}</p>
          </div>
        </div>
      </div>
    </div>
  )
}