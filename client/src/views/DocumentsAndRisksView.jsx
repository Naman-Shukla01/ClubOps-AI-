import React, { useState, useEffect } from 'react'
import { FolderCard } from '../components/documents/FolderCard'
import { RecentFilesList } from '../components/documents/RecentFilesList'
import { DocumentModal } from '../components/documents/DocumentModal'
import { RiskColumn } from '../components/risks/RiskColumn'
import { dev2Service } from '../services/dev2Service'

const riskColumns = [
  { title: 'Critical Risks', sev: 'critical', color: '#ef4444' },
  { title: 'High Risks', sev: 'high', color: '#f87171' },
  { title: 'Medium Risks', sev: 'medium', color: '#fbbf24' },
  { title: 'Low Risks', sev: 'low', color: '#34d399' },
]

export function DocumentsAndRisksView() {
  const [folders, setFolders] = useState([])
  const [recentFiles, setRecentFiles] = useState([])
  const [risks, setRisks] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [documents, events] = await Promise.all([
        dev2Service.getDocuments(),
        dev2Service.getEvents(),
      ])

      const nextFolders = Array.from(new Set(documents.map((document) => document.type || 'PDF'))).map((type, index) => ({
        id: index + 1,
        name: type.toUpperCase(),
        icon: type === 'PDF' ? '📄' : type === 'DOCX' ? '📝' : '📊',
        count: documents.filter((document) => (document.type || 'PDF') === type).length,
        color: type === 'PDF' ? '#7c5cfc' : type === 'DOCX' ? '#60a5fa' : '#34d399',
      }))
      const nextRecentFiles = documents.map((document, index) => ({
        id: document.id || index + 1,
        name: document.title || `Document ${index + 1}`,
        type: (document.type || 'PDF').toUpperCase(),
        modified: document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Recently',
        size: 'N/A',
      }))

      setFolders(nextFolders)
      setRecentFiles(nextRecentFiles)

      if (events[0]?.id) {
        const scan = await dev2Service.analyzeRisks({ eventId: events[0].id })
        setRisks(Array.isArray(scan?.risks) ? scan.risks : [])
      }
    } catch (error) {
      console.error('Failed to load documents and risks:', error)
      setFolders([])
      setRecentFiles([])
      setRisks([])
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-6 h-full">
      <div className="w-[380px] min-w-[340px] flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-fg mb-4">📁 Documents</h2>
          <div className="grid grid-cols-2 gap-3">{folders.map((f) => <FolderCard key={f.id} folder={f} />)}</div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-fg mb-4">📄 Recent Files</h2>
          <div className="bg-surface border border-border rounded-2xl p-2">
            <RecentFilesList files={recentFiles} onSelect={setSelectedFile} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-fg">⚠️ Risk Radar</h2>
          <span className="text-xs text-muted bg-card px-3 py-1.5 rounded-full">{risks.length} risks</span>
        </div>
        {loading ? <p className="text-muted">Loading...</p> : (
          <div className="flex gap-5">
            {riskColumns.map((col) => (
              <RiskColumn key={col.title} title={col.title} risks={risks.filter((r) => r.severity === col.sev)} color={col.color} />
            ))}
          </div>
        )}
      </div>
      {selectedFile && <DocumentModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
    </div>
  )
}