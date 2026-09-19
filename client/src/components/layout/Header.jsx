import React, { useState } from 'react'
import { Search, Bell, Settings } from 'lucide-react'
import { AiSearchModal } from '../search/AiSearchModal'

export function Header({ user, setUser, onProfileClick }) {
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
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-sm text-muted hover:border-accent/40 hover:text-fg transition-all w-72">
            <Search size={16} />
            <span>AI Search</span>
            <kbd className="ml-auto text-[10px] bg-border px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>

          {joinedClubs.length > 0 && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-fg">
              <span className="text-muted">Active Club:</span>
              <select
                value={user?.activeClubId || ''}
                onChange={(e) => {
                  const target = joinedClubs.find((c) => String(c.id) === String(e.target.value))
                  if (target) handleSelectClub(target)
                }}
                className="bg-transparent text-fg font-semibold outline-none cursor-pointer"
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
        <div className="flex items-center gap-2">
          <button className="relative p-2.5 rounded-xl hover:bg-card transition-colors">
            <Bell size={17} className="text-muted" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red rounded-full"></span>
          </button>
          <button onClick={onProfileClick} className="p-2.5 rounded-xl hover:bg-card transition-colors">
            <Settings size={17} className="text-muted" />
          </button>
        </div>
      </header>
      {searchOpen && <AiSearchModal onClose={() => setSearchOpen(false)} />}
    </>
  )
}
