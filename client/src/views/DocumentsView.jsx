import React, { useState, useEffect } from 'react'
import { FolderCard } from '../components/documents/FolderCard'
import { RecentFilesList } from '../components/documents/RecentFilesList'
import { DocumentModal } from '../components/documents/DocumentModal'
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal'
import { dev2Service } from '../services/dev2Service'
import { FileText, Sparkles, Upload, Search, Filter, RefreshCw, Layers, ArrowUpDown } from 'lucide-react'

export function DocumentsView({ user }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return user || JSON.parse(localStorage.getItem('currentUser') || '{}')
    } catch {
      return {}
    }
  })

  const [folders, setFolders] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [recentFiles, setRecentFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'oldest' | 'title'
  const [loading, setLoading] = useState(true)

  const activeClubId = currentUser?.activeClubId
  const activeClubName = currentUser?.activeClubName
  const activeClubIcon = currentUser?.activeClubIcon || '🏛️'

  const userRole = (currentUser?.role || '').toLowerCase()
  const isClubHead =
    userRole === 'club-head' ||
    userRole === 'event_manager' ||
    userRole === 'admin' ||
    userRole === 'lead'

  useEffect(() => {
    if (user) setCurrentUser(user)
  }, [user])

  useEffect(() => {
    loadData()
  }, [activeClubId])

  const loadData = async () => {
    setLoading(true)
    try {
      const documents = await dev2Service.getDocuments(activeClubId)
      const docList = Array.isArray(documents) ? documents : []

      const typeCounts = docList.reduce((acc, doc) => {
        const t = (doc.type || 'PDF').toUpperCase()
        acc[t] = (acc[t] || 0) + 1
        return acc
      }, {})

      const standardTypes = ['PDF', 'DOCX', 'TXT']
      const detectedTypes = Array.from(new Set([...standardTypes, ...Object.keys(typeCounts)]))

      const nextFolders = detectedTypes.map((type, index) => ({
        id: index + 1,
        name: type,
        icon: type === 'PDF' ? '📄' : type === 'DOCX' || type === 'DOC' ? '📝' : type === 'TXT' ? '📋' : '📊',
        count: typeCounts[type] || 0,
        color: type === 'PDF' ? '#ef4444' : type === 'DOCX' || type === 'DOC' ? '#3b82f6' : type === 'TXT' ? '#f59e0b' : '#10b981',
      }))

      const nextRecentFiles = docList.map((doc, index) => ({
        id: doc.id || doc._id || index + 1,
        name: doc.title || `Document ${index + 1}`,
        description: doc.description || '',
        type: (doc.type || 'PDF').toUpperCase(),
        modified: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Recently',
        rawDate: doc.createdAt || doc.updatedAt,
        size: doc.content ? `${Math.round(doc.content.length / 1024)} KB` : '1 KB',
        content: doc.content || '',
        aiAnalysis: doc.aiAnalysis || null,
        club: doc.club || null,
        event: doc.event || null,
        fileUrl: doc.fileUrl || '',
      }))

      setFolders(nextFolders)
      setRecentFiles(nextRecentFiles)
    } catch (error) {
      console.error('Failed to load documents:', error)
      setFolders([])
      setRecentFiles([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = recentFiles
    .filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = typeFilter === 'ALL' || file.type === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.rawDate || 0) - new Date(a.rawDate || 0)
      if (sortBy === 'oldest') return new Date(a.rawDate || 0) - new Date(b.rawDate || 0)
      if (sortBy === 'title') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="space-y-6 min-h-full pb-10">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-surface to-card border border-border p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-xl border border-accent/20">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-fg">
                  📁 Document Center
                </h1>
                {activeClubName && (
                  <span className="text-xs bg-card border border-border px-2.5 py-0.5 rounded-full text-muted flex items-center gap-1 font-semibold">
                    <span>{activeClubIcon}</span>
                    <span>{activeClubName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                AI-driven document intelligence, automatic workflow extraction, and interactive document Q&A
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-muted hover:text-fg hover:bg-card border border-border rounded-xl transition-colors disabled:opacity-50"
            title="Refresh repository"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          {isClubHead ? (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2.5 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              <Upload size={14} />
              <span>Upload Document</span>
            </button>
          ) : (
            <span className="text-xs text-muted bg-card px-3 py-1.5 rounded-xl border border-border">
              👀 Member Read-Only View
            </span>
          )}
        </div>
      </div>

      {/* Document Categories / Folder Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} /> Document Categories
          </h3>
          {typeFilter !== 'ALL' && (
            <button
              onClick={() => setTypeFilter('ALL')}
              className="text-xs text-accent hover:underline font-semibold"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {folders.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              isSelected={typeFilter === f.name}
              onClick={() => setTypeFilter(typeFilter === f.name ? 'ALL' : f.name)}
            />
          ))}
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-surface border border-border p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, notes, or extracted content..."
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-fg placeholder:text-muted outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl">
            {['ALL', 'PDF', 'DOCX', 'TXT'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === type
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-xl text-xs text-muted">
            <ArrowUpDown size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-fg outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Library Repository */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div>
            <h3 className="font-bold text-fg text-sm flex items-center gap-2">
              📄 Uploaded Files & Guidelines
            </h3>
            <p className="text-xs text-muted">Click any document to inspect extracted tasks, risks, or ask questions</p>
          </div>
          <span className="text-xs text-muted font-semibold bg-card px-3 py-1 rounded-full border border-border">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-2">
            <Sparkles size={20} className="animate-spin text-accent" />
            <span>Loading documents from club repository...</span>
          </div>
        ) : filteredFiles.length > 0 ? (
          <RecentFilesList
            files={filteredFiles}
            onSelect={setSelectedFile}
            onSummarize={(file) => setSelectedFile(file)}
          />
        ) : (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-muted">
              <FileText size={22} />
            </div>
            <div>
              <p className="font-semibold text-fg text-sm">No documents found</p>
              <p className="text-muted text-xs mt-0.5">
                {searchQuery || typeFilter !== 'ALL'
                  ? 'No documents match your filter. Try adjusting your search query.'
                  : 'Upload event schedules, rules, or budget sheets to activate AI parsing.'}
              </p>
            </div>
            {isClubHead && !searchQuery && typeFilter === 'ALL' && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 px-4 py-2 bg-accent hover:bg-accentHover text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-accent/20"
              >
                + Upload First Document
              </button>
            )}
          </div>
        )}
      </div>

      {/* Document Detail & AI Modal */}
      {selectedFile && (
        <DocumentModal
          file={selectedFile}
          isClubHead={isClubHead}
          onClose={() => setSelectedFile(null)}
          onUpdate={loadData}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadDocumentModal
          activeClubId={activeClubId}
          onClose={() => {
            setShowUpload(false)
            loadData()
          }}
          onUploadComplete={() => {
            setShowUpload(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

export default DocumentsView
