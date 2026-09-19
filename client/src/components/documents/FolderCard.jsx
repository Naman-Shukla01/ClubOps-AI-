import React from 'react'

export function FolderCard({ folder }) {
  return (
    <div className="group bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:bg-cardHover transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${folder.color}18` }}>
          {folder.icon}
        </div>
        <span className="text-xs text-muted bg-surface px-2.5 py-1 rounded-full group-hover:bg-accent/10 group-hover:text-accent transition-colors">
          {folder.count} files
        </span>
      </div>
      <h3 className="font-semibold text-fg text-sm">{folder.name}</h3>
    </div>
  )
}