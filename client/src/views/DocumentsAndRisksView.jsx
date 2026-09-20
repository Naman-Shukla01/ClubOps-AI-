import React, { useState } from 'react'
import { DocumentsView } from './DocumentsView'
import { RisksView } from './RisksView'
import { FolderCard } from '../components/documents/FolderCard'
import { RecentFilesList } from '../components/documents/RecentFilesList'
import { DocumentModal } from '../components/documents/DocumentModal'
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal'
import { RiskColumn } from '../components/risks/RiskColumn'
import { dev2Service } from '../services/dev2Service'
import { useEffect } from 'react'
import { FileText, ShieldAlert, LayoutGrid } from 'lucide-react'

const riskColumns = [
  { title: 'Critical Risks', sev: 'critical', color: '#ef4444' },
  { title: 'High Risks', sev: 'high', color: '#f87171' },
  { title: 'Medium Risks', sev: 'medium', color: '#fbbf24' },
  { title: 'Low Risks', sev: 'low', color: '#34d399' },
]

export function DocumentsAndRisksView({ user }) {
  const [activeTab, setActiveTab] = useState('split') // 'split' | 'documents' | 'risks'
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
  const [risks, setRisks] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
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
    if (activeTab === 'split') {
      loadData()
    }
  }, [activeClubId, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      const [documents, events, riskData] = await Promise.all([
        dev2Service.getDocuments(activeClubId).catch(() => []),
        dev2Service.getEvents(activeClubId).catch(() => []),
        dev2Service.getRisks(activeClubId).catch(() => []),
      ])

      const docList = Array.isArray(documents) ? documents : []
      const nextFolders = Array.from(new Set(docList.map((doc) => doc.type || 'PDF'))).map((type, index) => ({
        id: index + 1,
        name: type.toUpperCase(),
        icon: type === 'PDF' ? '📄' : type === 'DOCX' || type === 'DOC' ? '📝' : '📊',
        count: docList.filter((doc) => (doc.type || 'PDF') === type).length,
        color: type === 'PDF' ? '#7c5cfc' : type === 'DOCX' || type === 'DOC' ? '#60a5fa' : '#34d399',
      }))

      const nextRecentFiles = docList.map((doc, index) => ({
        id: doc.id || doc._id || index + 1,
        name: doc.title || `Document ${index + 1}`,
        type: (doc.type || 'PDF').toUpperCase(),
        modified: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Recently',
        size: doc.content ? `${Math.round(doc.content.length / 1024)} KB text` : 'N/A',
        content: doc.content || '',
        aiAnalysis: doc.aiAnalysis || null,
        club: doc.club || null,
        event: doc.event || null,
      }))

      setFolders(nextFolders)
      setRecentFiles(nextRecentFiles)

      const activeRisks = Array.isArray(riskData) ? riskData : []
      if (activeRisks.length > 0) {
        setRisks(activeRisks)
      } else if (events[0]?.id) {
        const scan = await dev2Service.analyzeRisks({ eventId: events[0].id }).catch(() => null)
        setRisks(Array.isArray(scan?.risks) ? scan.risks : [])
      } else {
        setRisks([])
      }
    } catch (error) {
      console.error('Failed to load documents and risks:', error)
      setFolders([])
      setRecentFiles([])
      setRisks([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full pb-10">
      {/* Top View Selector Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            📄 Documents & Risk Intelligence
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage club document repository and monitor real-time AI risk analysis
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface border border-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'split'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            <LayoutGrid size={14} />
            Split View
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'documents'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            <FileText size={14} />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'risks'
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            <ShieldAlert size={14} />
            Risk Radar
          </button>
        </div>
      </div>

      {/* Render active view tab */}
      {activeTab === 'documents' ? (
        <DocumentsView user={currentUser} />
      ) : activeTab === 'risks' ? (
        <RisksView user={currentUser} />
      ) : (
        /* Split Dual-Column View */
        <div className="flex flex-col lg:flex-row gap-6 min-h-full">
          {/* Left Column: Documents & Recent Files */}
          <div className="w-full lg:w-[380px] lg:min-w-[340px] flex flex-col gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                    📁 Documents
                  </h2>
                  {activeClubName && (
                    <p className="text-xs text-muted">
                      {activeClubIcon} {activeClubName}
                    </p>
                  )}
                </div>

                {isClubHead ? (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accentHover transition-colors flex items-center gap-1 shadow-md shadow-accent/20"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload
                  </button>
                ) : (
                  <span className="text-[11px] text-muted bg-card px-2.5 py-1 rounded-full border border-border">
                    Member View
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {folders.length > 0 ? (
                  folders.map((f) => <FolderCard key={f.id} folder={f} />)
                ) : (
                  <div className="col-span-2 bg-card/40 border border-border rounded-xl p-4 text-center text-xs text-muted">
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-fg">📄 Recent Files</h2>
                <span className="text-xs text-muted">{recentFiles.length} files</span>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-2">
                <RecentFilesList
                  files={recentFiles}
                  onSelect={setSelectedFile}
                  onSummarize={(file) => setSelectedFile(file)}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Risk Radar */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-fg flex items-center gap-2">
                  ⚠️ Risk Radar
                </h2>
                <p className="text-xs text-muted">Real-time operational & compliance risk detection</p>
              </div>
              <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full">
                {risks.length} active risks
              </span>
            </div>

            {loading ? (
              <p className="text-muted text-sm">Loading documents & risks...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {riskColumns.map((col) => (
                  <RiskColumn
                    key={col.title}
                    title={col.title}
                    risks={risks.filter((r) => (r.severity || '').toLowerCase() === col.sev)}
                    color={col.color}
                  />
                ))}
              </div>
            )}
          </div>

          {selectedFile && (
            <DocumentModal
              file={selectedFile}
              isClubHead={isClubHead}
              onClose={() => setSelectedFile(null)}
              onUpdate={loadData}
            />
          )}

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
      )}
    </div>
  )
}

export default DocumentsAndRisksView