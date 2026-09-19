import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'
import { AiSearchModal } from '../search/AiSearchModal'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <>
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-sm text-muted hover:border-accent/40 hover:text-fg transition-all w-72">
            <Search size={16} />
            <span>AI Search</span>
            <kbd className="ml-auto text-[10px] bg-border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 rounded-xl hover:bg-card transition-colors">
            <Bell size={17} className="text-muted" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full"></span>
          </button>
          <button className="p-2.5 rounded-xl hover:bg-card transition-colors">
            <Settings size={17} className="text-muted" />
          </button>
        </div>
      </header>
      {searchOpen && <AiSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}