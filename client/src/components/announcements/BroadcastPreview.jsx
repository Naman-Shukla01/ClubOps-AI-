import React from 'react'
import { X, Send, Mail, MessageCircle } from 'lucide-react'

export function BroadcastPreview({ announcement, onClose }) {
  const channels = announcement?.channels || ['WhatsApp', 'Email', 'Discord']
  const content = announcement?.content || 'No content'
  const title = announcement?.title || 'Untitled'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">Broadcast Preview</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg"><X size={16} className="text-muted" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h4 className="font-bold text-fg text-lg">{title}</h4>
            <p className="text-xs text-muted mt-1">Status: {announcement?.status || 'draft'}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted">{content}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-2">Will be sent to:</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <span key={ch} className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-fg">
                  {ch === 'WhatsApp' && <MessageCircle size={12} />}
                  {ch === 'Email' && <Mail size={12} />}
                  {ch === 'Discord' && <Send size={12} />}
                  {ch}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: '#2a2a32', color: '#aaa' }}>Close</button>
            <button className="flex-1 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#4f46e5' }}>Send Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}