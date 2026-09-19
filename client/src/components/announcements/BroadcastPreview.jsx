import React, { useEffect, useState } from 'react'
import {
  X,
  Send,
  Mail,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react'

export function BroadcastPreview({ announcement, onClose }) {
  const [channels, setChannels] = useState(
    announcement?.channels || ['WhatsApp', 'Email', 'Discord']
  )

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setChannels(
      announcement?.channels || ['WhatsApp', 'Email', 'Discord']
    )
    setCopied(false)
  }, [announcement])

  if (!announcement) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-muted">
          Select an announcement
        </p>
      </div>
    )
  }

  const title = announcement.title || 'Untitled'
  const content = announcement.content || 'No content'

  const channelFormats = {
    WhatsApp: (text) =>
      `🔔 *Announcement*\n\n${text}\n\n📍 EventHub Team`,

    Discord: (text) =>
      `📢 **Announcement**\n\n${text}\n\n— EventHub Team`,

    Email: (text) =>
      `Subject: Event Update\n\n${text}\n\n— EventHub Team`,

    Telegram: (text) =>
      `📢 ${text}\n\n— EventHub Team`,
  }

  const previewText = channels
    .map(
      (channel) =>
        channelFormats[channel]?.(content) || ''
    )
    .filter(Boolean)
    .join('\n\n---\n\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  const toggleChannel = (channel) => {
    setChannels((previous) =>
      previous.includes(channel)
        ? previous.filter((item) => item !== channel)
        : [...previous, channel]
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">
            Broadcast Preview
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-card rounded-lg"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Announcement Info */}
          <div>
            <h4 className="font-bold text-fg text-lg">
              {title}
            </h4>

            <p className="text-xs text-muted mt-1">
              Status: {announcement.status || 'draft'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Channels */}
          <div>
            <p className="text-xs text-muted mb-2">
              Will be sent to:
            </p>

            <div className="flex flex-wrap gap-2">
              {channels.length === 0 ? (
                <span className="text-xs text-muted">
                  No channels selected
                </span>
              ) : (
                channels.map((channel) => (
                  <span
                    key={channel}
                    className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-fg"
                  >
                    {channel === 'WhatsApp' && (
                      <MessageCircle size={12} />
                    )}

                    {channel === 'Email' && (
                      <Mail size={12} />
                    )}

                    {(channel === 'Discord' ||
                      channel === 'Telegram') && (
                        <Send size={12} />
                      )}

                    {channel}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Channel Toggle */}
          <div>
            <p className="text-xs text-muted mb-2">
              Preview channels
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                'WhatsApp',
                'Email',
                'Discord',
                'Telegram',
              ].map((channel) => {
                const active = channels.includes(channel)

                return (
                  <button
                    key={channel}
                    onClick={() =>
                      toggleChannel(channel)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${active
                      ? 'bg-accent/15 text-accent'
                      : 'bg-card text-muted hover:text-fg'
                      }`}
                  >
                    {channel === 'WhatsApp' && (
                      <MessageCircle size={12} />
                    )}

                    {channel === 'Email' && (
                      <Mail size={12} />
                    )}

                    {(channel === 'Discord' ||
                      channel === 'Telegram') && (
                        <Send size={12} />
                      )}

                    {channel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Generated Preview */}
          {previewText && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted">
                  Message Preview
                </p>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-muted hover:text-fg"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-fg whitespace-pre-wrap">
                {previewText}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border text-sm"
              style={{
                borderColor: '#2a2a32',
                color: '#aaa',
              }}
            >
              Close
            </button>

            <button
              className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
              style={{ background: '#4f46e5' }}
            >
              Send Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BroadcastPreview