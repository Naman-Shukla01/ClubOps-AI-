import React from 'react'
import { X, FileText, CheckSquare, Calendar } from 'lucide-react'

export function DocumentModal({ file, onClose }) {
  if (!file) return null

  const { aiAnalysis } = file

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[800px] max-w-[90%] flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-fg">{file.name}</h3>
              <p className="text-xs text-muted">Modified: {file.modified}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg transition-colors">
            <X size={16} className="text-muted" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {aiAnalysis && aiAnalysis.summary ? (
            <>
              {/* Summary Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} />
                  AI Summary
                </h4>
                <div className="bg-card border border-border p-4 rounded-xl text-sm leading-relaxed text-fg/90">
                  {aiAnalysis.summary}
                </div>
              </div>

              {/* Tasks Section */}
              {aiAnalysis.tasks && aiAnalysis.tasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare size={14} />
                    Extracted Tasks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiAnalysis.tasks.map((task, i) => (
                      <div key={i} className="bg-card border border-border p-3 rounded-xl flex flex-col gap-2">
                        <div className="font-medium text-sm text-fg">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-muted line-clamp-2">{task.description}</div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            task.priority === 'high' || task.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
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
                </div>
              )}

              {/* Risks Section */}
              {aiAnalysis.risks && aiAnalysis.risks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Identified Risks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiAnalysis.risks.map((risk, i) => (
                      <div key={i} className="bg-card border border-red-500/20 p-3 rounded-xl flex flex-col gap-2">
                        <div className="font-medium text-sm text-fg">{risk.title}</div>
                        {risk.description && (
                          <div className="text-xs text-muted line-clamp-2">{risk.description}</div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            risk.severity === 'high' || risk.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                            risk.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {risk.severity || 'medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card rounded-xl p-4 text-sm text-muted leading-relaxed font-mono flex flex-col items-center justify-center py-12">
              <FileText size={32} className="mb-3 opacity-20" />
              <p>No AI analysis available for this document.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}