import React from 'react'
import { X, Mail, Briefcase, User } from 'lucide-react'

export default function ProfileModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">Profile</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg"><X size={16} className="text-muted" /></button>
        </div>
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-blue flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-glow">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <h2 className="text-xl font-bold text-fg">{user.name}</h2>
          <p className="text-muted text-sm mb-6">{user.role}</p>
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl">
              <Mail size={16} className="text-accent" />
              <span className="text-sm text-fg">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl">
              <Briefcase size={16} className="text-accent" />
              <span className="text-sm text-fg">{user.role}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl">
              <User size={16} className="text-accent" />
              <span className="text-sm text-fg">Member since Sep 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}