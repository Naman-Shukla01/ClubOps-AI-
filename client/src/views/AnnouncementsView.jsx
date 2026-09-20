import React, { useState, useEffect } from 'react'

export function AnnouncementsView({ user }) {
  const [announcements, setAnnouncements] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editStatus, setEditStatus] = useState('draft')
  const [editChannels, setEditChannels] = useState(['WhatsApp'])

  const [previewTitle, setPreviewTitle] = useState('')
  const [previewContent, setPreviewContent] = useState('')
  const [previewChannels, setPreviewChannels] = useState([])

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newChannels, setNewChannels] = useState([
    'WhatsApp',
    'Email',
  ])

  const [loading, setLoading] = useState(false)

  const clubId = user?.activeClubId
  const isClubHead = user?.role === 'club-head' || user?.role === 'lead' || user?.role === 'EVENT_MANAGER' || user?.role === 'ADMIN'

  useEffect(() => {
    loadAnnouncements()
  }, [clubId])

  const loadAnnouncements = () => {
    setLoading(true)
    setAnnouncements([])
    setLoading(false)
  }

  const handleCreate = (e) => {
    e.preventDefault()

    if (!newTitle.trim() || !clubId) return

    const announcement = {
      id: String(Date.now()),
      title: newTitle.trim(),
      content: newContent.trim(),
      channels: [...newChannels],
      status: 'draft',
      clubId,
      clubName: user?.activeClubName || '',
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    }

    setAnnouncements((prev) => [announcement, ...prev])

    setNewTitle('')
    setNewContent('')
    setNewChannels(['WhatsApp', 'Email'])
    setShowCreate(false)
  }

  const startEdit = (ann) => {
    setEditing(ann)
    setEditTitle(ann.title || '')
    setEditContent(ann.content || '')
    setEditStatus(ann.status || 'draft')
    setEditChannels(ann.channels || ['WhatsApp'])
  }

  const saveEdit = () => {
    if (!editing || !editTitle.trim()) return

    const updated = announcements.map((announcement) =>
      announcement.id === editing.id
        ? {
          ...announcement,
          title: editTitle.trim(),
          content: editContent.trim(),
          status: editStatus,
          channels: [...editChannels],
        }
        : announcement
    )

    setAnnouncements(updated)
    setEditing(null)
  }

  const deleteAnn = (id) => {
    setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id))
  }

  const changeStatus = (id, status) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === id ? { ...announcement, status } : announcement
      )
    )
  }

  const openPreview = (ann) => {
    setPreviewTitle(ann.title || '')
    setPreviewContent(ann.content || '')
    setPreviewChannels(ann.channels || [])
    setPreviewOpen(true)
  }

  const statusStyles = {
    draft: 'bg-yellow/15 text-yellow',
    scheduled: 'bg-blue/15 text-blue',
    sent: 'bg-green/15 text-green',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">
            {clubId ? 'Club Announcements' : 'Announcements'}
          </h2>

          <p className="text-muted text-sm">
            {user?.activeClubName
              ? user.activeClubName + ' announcements'
              : 'Broadcast to members'}
          </p>
        </div>

        {isClubHead && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>📢</span> + New Announcement
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <span className="text-4xl">📢</span>
          <p className="text-muted mt-2">
            No announcements yet
          </p>
        </div>
      ) : (
        /* Announcements */
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-card border border-border rounded-xl p-5"
            >
              {editing?.id === ann.id ? (
                /* Edit Mode */
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(e.target.value)
                    }
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                    placeholder="Title"
                  />

                  <textarea
                    value={editContent}
                    onChange={(e) =>
                      setEditContent(e.target.value)
                    }
                    rows={2}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none"
                    placeholder="Content"
                  />

                  <div className="flex flex-wrap gap-2">
                    {[
                      'WhatsApp',
                      'Email',
                      'Discord',
                      'SMS',
                    ].map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() =>
                          setEditChannels((previous) =>
                            previous.includes(channel)
                              ? previous.filter(
                                (item) => item !== channel
                              )
                              : [...previous, channel]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs ${editChannels.includes(channel)
                          ? 'bg-accent text-white'
                          : 'bg-card text-muted border border-border'
                          }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value)
                      }
                      className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-fg"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">
                        Scheduled
                      </option>
                      <option value="sent">Sent</option>
                    </select>

                    <button
                      onClick={saveEdit}
                      className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      ✓ Save
                    </button>

                    <button
                      onClick={() => setEditing(null)}
                      className="bg-card border border-border text-muted px-3 py-1.5 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-fg">
                        {ann.title}
                      </h3>

                      <p className="text-xs text-muted mt-1">
                        By {ann.createdBy || 'Unknown'} ·{' '}
                        {ann.createdAt
                          ? new Date(
                            ann.createdAt
                          ).toLocaleDateString()
                          : ''}
                      </p>
                    </div>

                    {isClubHead && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(ann)}
                          className="px-2 py-1 bg-surface text-muted hover:text-fg rounded text-[10px]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteAnn(ann.id)}
                          className="px-2 py-1 bg-red/10 text-red rounded text-[10px]"
                        >
                          Del
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-muted mb-3">
                    {ann.content || 'No content'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {(ann.channels || []).map((channel) => (
                        <span
                          key={channel}
                          className="px-2 py-0.5 text-[10px] bg-surface text-fg rounded"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full ${statusStyles[ann.status] ||
                          'bg-muted/15 text-muted'
                          }`}
                      >
                        {ann.status}
                      </span>

                      {isClubHead && ann.status === 'draft' && (
                        <button
                          onClick={() =>
                            changeStatus(
                              ann.id,
                              'scheduled'
                            )
                          }
                          className="text-[10px] bg-accent text-white px-2 py-1 rounded"
                        >
                          Schedule
                        </button>
                      )}

                      {isClubHead &&
                        ann.status === 'scheduled' && (
                          <button
                            onClick={() =>
                              changeStatus(
                                ann.id,
                                'sent'
                              )
                            }
                            className="text-[10px] bg-green text-black px-2 py-1 rounded"
                          >
                            Send
                          </button>
                        )}

                      {ann.status === 'sent' && (
                        <span className="text-[10px] text-green">
                          ✓ Sent
                        </span>
                      )}

                      <button
                        onClick={() => openPreview(ann)}
                        className="text-[10px] bg-card border border-border text-muted px-2 py-1 rounded"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-fg">
                New Announcement
              </h3>

              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 hover:bg-card rounded-lg"
              >
                <span className="text-muted">✕</span>
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              className="p-5 space-y-4"
            >
              <input
                value={newTitle}
                onChange={(e) =>
                  setNewTitle(e.target.value)
                }
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                placeholder="Title"
                required
              />

              <textarea
                value={newContent}
                onChange={(e) =>
                  setNewContent(e.target.value)
                }
                rows={4}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent resize-none"
                placeholder="Content"
              />

              <div>
                <label className="text-xs text-muted mb-1.5 block">
                  Channels
                </label>

                <div className="flex flex-wrap gap-2">
                  {[
                    'WhatsApp',
                    'Email',
                    'Discord',
                    'SMS',
                  ].map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() =>
                        setNewChannels((previous) =>
                          previous.includes(channel)
                            ? previous.filter(
                              (item) =>
                                item !== channel
                            )
                            : [...previous, channel]
                        )
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs ${newChannels.includes(channel)
                        ? 'bg-accent text-white'
                        : 'bg-card text-muted border border-border'
                        }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: '#2a2a32',
                    color: '#aaa',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ background: '#4f46e5' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-fg">
                Announcement Preview
              </h3>

              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1.5 hover:bg-card rounded-lg"
              >
                <span className="text-muted">✕</span>
              </button>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-fg mb-2">
                {previewTitle}
              </h3>

              <p className="text-sm text-muted mb-4 whitespace-pre-wrap">
                {previewContent || 'No content'}
              </p>

              <div className="flex flex-wrap gap-2">
                {previewChannels.map((channel) => (
                  <span
                    key={channel}
                    className="px-2 py-1 text-[10px] bg-card border border-border text-fg rounded"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-border">
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-full py-2 rounded-lg bg-card border border-border text-fg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}