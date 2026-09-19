import React, { useEffect, useState } from 'react'
import { Copy, Check, MessageCircle, Send as SendIcon } from 'lucide-react'

const channelFormats = {
  WhatsApp: (c) => `🔔 *Announcement*\n\n${c}\n\n📍 EventHub Team`,
  Discord: (c) => `📢 **Announcement**\n\n${c}\n\n— EventHub Team`,
  Email: (c) => `Subject: Event Update\n\n${c}\n\n— EventHub Team`,
  Telegram: (c) => `📢 ${c}\n\n— EventHub Team`,
}
const channelIcons = { WhatsApp: MessageCircle, Telegram: SendIcon }

export default function BroadcastPreview({ announcement }) {
  const [channels, setChannels] = useState(announcement?.channels || ['WhatsApp'])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setChannels(announcement?.channels || ['WhatsApp'])
    setCopied(false)
  }, [announcement])

  if (!announcement) return <div className="bg-surface border border-border rounded-2xl p-6 text-center"><p className="text-sm text-muted">Select an announcement</p></div>

  const previewText = channels.map((ch) => channelFormats[ch]?.(announcement.content) || '').join('\n\n---\n\n')

  const handleCopy = () => { navigator.clipboard.writeText(previewText); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const toggleChannel = (ch) => setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch])

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-fg">{announcement.title}</h4>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${announcement.status === 'scheduled' ? 'bg-yellow/15 text-yellow' : announcement.status === 'sent' ? 'bg-green/15 text-green' : 'bg-accent/15 text-accent'}`}>{announcement.status.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          {['WhatsApp', 'Telegram'].map((ch) => {
            const Icon = channelIcons[ch]
            const active = channels.includes(ch)
            return (
              <button key={ch} onClick={() => toggleChannel(ch)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${active ? 'bg-accent/15 text-accent' : 'bg-card text-muted hover:text-fg'}`}>
                <Icon size={12} /> {ch}
              </button>
            )
          })}
        </div>
      </div>
      <div className="p-4">
        <div className="bg-card rounded-xl p-4 mb-3">
          <p className="text-[13px] text-fg/80 leading-relaxed whitespace-pre-line font-mono">{previewText}</p>
        </div>
        <button onClick={handleCopy} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${copied ? 'bg-green/15 text-green' : 'bg-accent hover:bg-accentHover text-white'}`}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  )
}