import React from 'react'

export function FolderCard({ folder, onClick, isSelected }) {
  return (
    <div
      onClick={onClick}
      className={`group border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-accent/10 border-accent shadow-md shadow-accent/10'
          : 'bg-card border-border hover:border-accent/40 hover:bg-cardHover'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl"
          style={{ background: `${folder.color}18` }}
        >
          {folder.icon}
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
            isSelected
              ? 'bg-accent text-white'
              : 'text-muted bg-surface group-hover:bg-accent/10 group-hover:text-accent'
          }`}
        >
          {folder.count} {folder.count === 1 ? 'file' : 'files'}
        </span>
      </div>
      <h3 className="font-semibold text-fg text-sm">{folder.name}</h3>
    </div>
  )
}

export default FolderCard