import React, { useState } from 'react'
import { X, FileText, CheckSquare, Calendar, Sparkles, Send, Trash2, Copy, Check, MessageSquare, AlertTriangle, FileCode } from 'lucide-react'
import { dev2Service } from '../../services/dev2Service'

export function DocumentModal({ file, onClose, isClubHead, onUpdate }) {
  if (!file) return null

  const [activeTab, setActiveTab] = useState('summary')
  const [summarizing, setSummarizing] = useState(false)
  const [currentFile, setCurrentFile] = useState(file)
  const [copied, setCopied] = useState(false)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const aiAnalysis = currentFile.aiAnalysis || {}

  const handleSummarize = async () => {
    setSummarizing(true)
    setError('')
    try {
      const res = await dev2Service.summarizeDocument(currentFile.id)
      if (res?.data) {
        const updated = {
          ...currentFile,
          ...res.data,
          aiAnalysis: res.aiAnalysis || res.data.aiAnalysis,
        }
        setCurrentFile(updated)
        onUpdate?.()
      }
    } catch (err) {
      console.error('Summarize error:', err)
      setError(err?.message || 'Failed to summarize document')
    } finally {
      setSummarizing(false)
    }
  }

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim() || asking) return

    const userQ = question.trim()
    setQuestion('')
    setAsking(true)
    setError('')

    const tempHistory = [...chatHistory, { sender: 'user', text: userQ }]
    setChatHistory(tempHistory)

    try {
      const res = await dev2Service.askDocumentQuestion(currentFile.id, userQ)
      setChatHistory([
        ...tempHistory,
        {
          sender: 'ai',
          text: res?.answer || 'No specific answer found in document.',
          points: res?.relevantPoints || [],
        },
      ])
    } catch (err) {
      console.error('Q&A error:', err)
      setChatHistory([
        ...tempHistory,
        { sender: 'ai', text: 'Sorry, could not analyze the question right now. ' + (err.message || '') },
      ])
    } finally {
      setAsking(false)
    }
  }

  const handleCopySummary = () => {
    if (!aiAnalysis?.summary) return
    const textToCopy = `📌 ${currentFile.name} - AI Summary:\n\n${aiAnalysis.summary}\n\n${
      aiAnalysis.keyPoints?.length ? 'Key Highlights:\n' + aiAnalysis.keyPoints.map((p) => '• ' + p).join('\n') : ''
    }`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${currentFile.name}"?`)) return
    setDeleting(true)
    try {
      await dev2Service.deleteDocument(currentFile.id)
      onUpdate?.()
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to delete document')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-[860px] flex flex-col max-h-[92vh] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between p-4 sm:p-5 border-b border-border bg-card/40 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 bg-accent/10 text-accent rounded-xl border border-accent/20 shrink-0">
              <FileText size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-fg text-sm sm:text-base truncate max-w-[280px] sm:max-w-md">{currentFile.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-border text-muted">
                  {currentFile.type || 'PDF'}
                </span>
              </div>
              <p className="text-xs text-muted truncate">
                {currentFile.club?.name ? `Club: ${currentFile.club.name} · ` : ''}
                Modified: {currentFile.modified || 'Recently'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="px-3 py-1.5 bg-accent hover:bg-accentHover text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              <Sparkles size={14} className={summarizing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{summarizing ? 'Analyzing...' : aiAnalysis?.summary ? 'Regenerate AI' : '✨ Summarize with AI'}</span>
              <span className="sm:hidden">{summarizing ? 'AI...' : '✨ AI'}</span>
            </button>

            {isClubHead && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete document"
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-3 sm:px-5 bg-card/20 text-xs font-semibold text-muted gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'summary' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-fg'
            }`}
          >
            <Sparkles size={14} />
            Summary & Insights
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'tasks' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-fg'
            }`}
          >
            <CheckSquare size={14} />
            Tasks ({aiAnalysis?.tasks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'risks' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-fg'
            }`}
          >
            <AlertTriangle size={14} />
            Risks ({aiAnalysis?.risks?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'qa' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-fg'
            }`}
          >
            <MessageSquare size={14} />
            Ask Document AI
          </button>
          {currentFile.content && (
            <button
              onClick={() => setActiveTab('text')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
                activeTab === 'text' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-fg'
              }`}
            >
              <FileCode size={14} />
              Extracted Text
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-5">
              {aiAnalysis?.summary ? (
                <>
                  <div className="bg-card/70 border border-border/80 rounded-2xl p-4 sm:p-5 relative group shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} />
                        Executive AI Summary
                      </h4>
                      <button
                        onClick={handleCopySummary}
                        className="text-xs text-muted hover:text-fg px-2.5 py-1 bg-surface border border-border rounded-lg flex items-center gap-1 transition-colors"
                      >
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-fg/90 whitespace-pre-line font-normal">
                      {typeof aiAnalysis.summary === 'string'
                        ? aiAnalysis.summary.replace(/:\s*\d+[\.\)]?$/, '').replace(/\s+\d+[\.\)]?$/, '.')
                        : ''}
                    </p>
                  </div>

                  {(() => {
                    const rawPoints = Array.isArray(aiAnalysis.keyPoints) ? aiAnalysis.keyPoints : [];
                    const filteredPoints = rawPoints.filter(
                      (p) => typeof p === 'string' && p.trim().length >= 4 && !/^\d+[\.\)]?$/.test(p.trim())
                    );

                    if (filteredPoints.length === 0) return null;

                    return (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-fg uppercase tracking-wider flex items-center gap-1.5">
                          <span>📌 Key Highlights</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {filteredPoints.map((point, i) => (
                            <div
                              key={i}
                              className="bg-card/40 border border-border/60 hover:border-border p-3 rounded-xl text-xs text-fg/90 flex items-start gap-3 transition-colors"
                            >
                              <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed flex-1 font-normal">
                                {point.replace(/^(?:\d+[\.\)]|[-*•])\s*/, '').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {aiAnalysis.importantDates && aiAnalysis.importantDates.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-fg uppercase tracking-wider">📅 Important Dates & Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.importantDates.map((date, i) => (
                          <span
                            key={i}
                            className="text-xs bg-card border border-border px-3 py-1 rounded-full text-muted flex items-center gap-1.5"
                          >
                            <Calendar size={12} className="text-accent" />
                            {date}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-card/40 border border-border rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                    <Sparkles size={28} />
                  </div>
                  <h4 className="font-bold text-fg mb-1">No AI Summary Yet</h4>
                  <p className="text-xs text-muted max-w-sm mb-4">
                    Generate an instant executive summary, key takeaways, task extraction, and risk detection using AI.
                  </p>
                  <button
                    onClick={handleSummarize}
                    disabled={summarizing}
                    className="px-4 py-2 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                  >
                    <Sparkles size={14} className={summarizing ? 'animate-spin' : ''} />
                    {summarizing ? 'Generating AI Summary...' : '✨ Generate AI Summary Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {aiAnalysis?.tasks && aiAnalysis.tasks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAnalysis.tasks.map((task, i) => (
                    <div key={i} className="bg-card border border-border p-3 sm:p-4 rounded-xl flex flex-col justify-between gap-3">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-fg mb-1">{task.title}</div>
                        {task.description && <div className="text-xs text-muted leading-relaxed">{task.description}</div>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            task.priority === 'high' || task.priority === 'critical'
                              ? 'bg-red-500/10 text-red-400'
                              : task.priority === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-green-500/10 text-green-400'
                          }`}
                        >
                          {task.priority || 'medium'}
                        </span>
                        {task.deadline && (
                          <span className="text-xs flex items-center gap-1 text-muted">
                            <Calendar size={12} />
                            {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card/40 border border-border rounded-xl p-8 text-center text-xs text-muted">
                  No actionable tasks identified in this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RISKS */}
          {activeTab === 'risks' && (
            <div className="space-y-3">
              {aiAnalysis?.risks && aiAnalysis.risks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAnalysis.risks.map((risk, i) => (
                    <div key={i} className="bg-card border border-red-500/20 p-3 sm:p-4 rounded-xl flex flex-col justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-fg mb-1 flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                          {risk.title}
                        </div>
                        {risk.description && <div className="text-xs text-muted leading-relaxed">{risk.description}</div>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            risk.severity === 'high' || risk.severity === 'critical'
                              ? 'bg-red-500/10 text-red-400'
                              : risk.severity === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-green-500/10 text-green-400'
                          }`}
                        >
                          {risk.severity || 'medium'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card/40 border border-border rounded-xl p-8 text-center text-xs text-muted">
                  No critical operational risks identified for this document.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Q&A */}
          {activeTab === 'qa' && (
            <div className="flex flex-col h-[340px] sm:h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 sm:pr-2 mb-3">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
                    <MessageSquare size={32} className="text-muted/40 mb-2" />
                    <h5 className="font-semibold text-fg text-sm">Ask AI about this Document</h5>
                    <p className="text-xs text-muted max-w-xs mt-1">
                      Ask questions like "What are the rules?", "What are key deadlines?", or "Who is in charge?".
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-accent text-white rounded-br-none'
                            : 'bg-card border border-border text-fg/90 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        {msg.points && msg.points.length > 0 && (
                          <ul className="mt-2 pt-2 border-t border-border/40 space-y-1">
                            {msg.points.map((pt, pIdx) => (
                              <li key={pIdx} className="text-[11px] text-muted">
                                • {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {asking && (
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Sparkles size={14} className="animate-spin text-accent" />
                    <span>Analyzing document...</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this document..."
                  className="flex-1 px-3 sm:px-4 py-2.5 bg-card border border-border rounded-xl text-xs text-white outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim()}
                  className="px-3 sm:px-4 py-2.5 bg-accent hover:bg-accentHover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <Send size={14} />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: RAW TEXT */}
          {activeTab === 'text' && (
            <div className="bg-card border border-border p-4 rounded-xl max-h-[350px] overflow-y-auto">
              <pre className="text-xs text-muted whitespace-pre-wrap font-mono leading-relaxed">
                {currentFile.content || 'No text extracted.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}