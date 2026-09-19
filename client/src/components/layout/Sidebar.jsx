import React from 'react'

export function Sidebar({ user, activeTab, onTabChange, tabs, onProfileClick, onLogout }) {
  return (
    <aside className="w-64 min-w-[260px] bg-surface border-r border-border flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue flex items-center justify-center text-white font-bold text-lg shadow-glow">A</div>
          <div>
            <h1 className="font-bold text-fg text-sm tracking-tight">EventHub</h1>
            <p className="text-muted text-[11px]">Event Management Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {tabs.filter((tab) => !tab.roles || tab.roles.includes(user.role)).map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-muted hover:text-fg hover:bg-card'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-xl text-xs text-red hover:bg-red/10 transition-colors">
          🚪 Logout
        </button>
      </div>
      <div className="p-4 border-t border-border cursor-pointer" onClick={onProfileClick}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue flex items-center justify-center text-white text-xs font-bold">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg truncate">{user.name}</p>
            <p className="text-[11px] text-muted">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}