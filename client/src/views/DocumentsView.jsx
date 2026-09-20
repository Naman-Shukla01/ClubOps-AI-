import React, { useState, useEffect } from 'react'
import { FolderCard } from '../components/documents/FolderCard'
import { RecentFilesList } from '../components/documents/RecentFilesList'
import { DocumentModal } from '../components/documents/DocumentModal'
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal'
import { dev2Service } from '../services/dev2Service'
import { FileText, Sparkles, Upload, Search, Filter } from 'lucide-react'

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

      const nextFolders = Array.from(new Set(docList.map((document) => document.type || 'PDF'))).map((type, index) => ({
        id: index + 1,
        name: type.toUpperCase(),
        icon: type === 'PDF' ? '📄' : type === 'DOCX' || type === 'DOC' ? '📝' : '📊',
        count: docList.filter((document) => (document.type || 'PDF') === type).length,
        color: type === 'PDF' ? '#7c5cfc' : type === 'DOCX' || type === 'DOC' ? '#60a5fa' : '#34d399',
      }))

      const nextRecentFiles = docList.map((document, index) => ({
        id: document.id || index + 1,
        name: document.title || `Document ${index + 1}`,
        type: (document.type || 'PDF').toUpperCase(),
        modified: document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Recently',
        size: document.content ? `${Math.round(document.content.length / 1024)} KB text` : 'N/A',
        content: document.content || '',
        aiAnalysis: document.aiAnalysis || null,
        club: document.club || null,
        event: document.event || null,
      }))

      setFolders(nextFolders)
      setRecentFiles(nextRecentFiles)
    } catch (error) {
      console.error('Failed to load documents:', error)
      setFolders([])
      setRecentFiles([])
    }
    setLoading(false)
  }

  const filteredFiles = recentFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'ALL' || file.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6 min-h-full pb-10">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card/80 to-surface border border-border/80 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent/10 text-accent rounded-xl border border-accent/20">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-fg flex items-center gap-2">
                📁 Document Center
              </h2>
              <p className="text-xs text-muted">
                {activeClubName ? `${activeClubIcon} ${activeClubName} · ` : ''}
                AI-powered document summarization, extraction, and interactive Q&A
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isClubHead ? (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              <Upload size={15} />
              <span>Upload Document</span>
            </button>
          ) : (
            <span className="text-xs text-muted bg-card px-3 py-1.5 rounded-full border border-border">
              👀 Member Read-Only View
            </span>
          )}
        </div>
      </div>

      {/* Folder Categories */}
      <div>
        <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Document Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {folders.length > 0 ? (
            folders.map((f) => <FolderCard key={f.id} folder={f} />)
          ) : (
            <div className="col-span-full bg-card/30 border border-border rounded-xl p-5 text-center text-xs text-muted">
              No categories created yet. Upload a document to get started.
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-card/60 border border-border rounded-xl text-xs text-fg placeholder:text-muted outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PDF', 'DOCX', 'TXT'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === type
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-card border border-border text-muted hover:text-fg'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Library List */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div>
            <h3 className="font-bold text-fg text-sm flex items-center gap-2">
              📄 Uploaded Files & Guidelines
            </h3>
            <p className="text-xs text-muted">Click any document to generate instant summaries or ask questions</p>
          </div>
          <span className="text-xs text-muted font-medium bg-card px-2.5 py-1 rounded-full border border-border">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center gap-2">
            <Sparkles size={20} className="animate-spin text-accent" />
            <span>Loading documents...</span>
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
                {searchQuery ? 'Try adjusting your search filter.' : 'Upload club guidelines or orientation lists to begin.'}
              </p>
            </div>
            {isClubHead && !searchQuery && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 px-3.5 py-1.5 bg-accent hover:bg-accentHover text-white text-xs font-semibold rounded-xl transition-all"
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
