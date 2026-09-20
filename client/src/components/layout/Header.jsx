import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'
import { AiSearchModal } from '../search/AiSearchModal'

export function Header({ user, setUser, onProfileClick, onToggleSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false)

  const joinedClubs = user?.joinedClubs || (user?.activeClubId ? [{ id: user.activeClubId, name: user.activeClubName, icon: user.activeClubIcon || '🏛️' }] : [])

  const handleSelectClub = (club) => {
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}")
    cu.activeClubId = club.id
    cu.activeClubName = club.name
    cu.activeClubIcon = club.icon || '🏛️'
    localStorage.setItem("currentUser", JSON.stringify(cu))
    if (setUser) setUser(cu)
  }

  return (
    <>
      <header className="min-h-16 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 lg:px-6 py-2.5 lg:py-0 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-card border border-border text-fg hover:border-accent/40 transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            <span className="text-lg leading-none">☰</span>
          </button>

          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 sm:px-4 py-2 text-sm text-muted hover:border-accent/40 hover:text-fg transition-all flex-1 sm:flex-none sm:w-72">
            <Search size={16} />
            <span className="truncate">AI Search</span>
            <kbd className="hidden sm:inline ml-auto text-[10px] bg-border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          {joinedClubs.length > 0 && (
            <div className="hidden sm:flex min-w-0 max-w-full items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-fg">
              <span className="text-muted shrink-0">Active Club:</span>
              <select
                value={user?.activeClubId || ''}
                onChange={(e) => {
                  const target = joinedClubs.find((c) => String(c.id) === String(e.target.value))
                  if (target) handleSelectClub(target)
                }}
                className="bg-transparent text-fg font-semibold outline-none cursor-pointer min-w-0 max-w-full truncate"
              >
                {joinedClubs.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface text-fg">
                    {c.icon || '🏛️'} {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="relative p-2.5 rounded-xl hover:bg-card transition-colors">
            <Bell size={17} className="text-muted" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full"></span>
          </button>
          <button onClick={onProfileClick} className="p-2.5 rounded-xl hover:bg-card transition-colors">
            <Settings size={17} className="text-muted" />
          </button>
        </div>
      </header>

      {/* Dedicated Mobile Active Club Bar (small screens only) */}
      {joinedClubs.length > 0 && (
        <div className="sm:hidden flex items-center justify-between bg-card/70 border-b border-border px-3 py-2 text-xs text-fg shrink-0">
          <span className="text-muted font-medium shrink-0">Active Club:</span>
          <select
            value={user?.activeClubId || ''}
            onChange={(e) => {
              const target = joinedClubs.find((c) => String(c.id) === String(e.target.value))
              if (target) handleSelectClub(target)
            }}
            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-fg font-semibold outline-none cursor-pointer max-w-[200px] truncate"
          >
            {joinedClubs.map((c) => (
              <option key={c.id} value={c.id} className="bg-surface text-fg">
                {c.icon || '🏛️'} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {searchOpen && <AiSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}
