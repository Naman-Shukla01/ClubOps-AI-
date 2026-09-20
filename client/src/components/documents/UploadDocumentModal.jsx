import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ListTodo, ShieldAlert, Sparkles } from 'lucide-react';
import { dev2Service } from '../../services/dev2Service';

export function UploadDocumentModal({ activeClubId, onClose, onUploadComplete }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedContent, setPastedContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    if (!activeClubId) return;
    dev2Service
      .getEvents(activeClubId)
      .then((evs) => {
        const list = Array.isArray(evs) ? evs : [];
        setEvents(list);
      })
      .catch(console.error);
  }, [activeClubId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Document title is required');
      return;
    }
    if (!pasteMode && !file) {
      setError('Please select a file to upload or switch to paste mode');
      return;
    }
    if (pasteMode && !pastedContent.trim()) {
      setError('Please enter document content');
      return;
    }

    setError('');
    setLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      if (selectedEvent) {
        formData.append('event', selectedEvent);
      }
      if (activeClubId) {
        formData.append('club', activeClubId);
      }
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      if (pasteMode) {
        formData.append('type', 'TXT');
        formData.append('content', pastedContent.trim());
        const blob = new Blob([pastedContent.trim()], { type: 'text/plain' });
        formData.append('file', blob, `${title.replace(/\s+/g, '_')}.txt`);
      } else {
        const ext = file.name.toLowerCase();
        const fileType = ext.endsWith('.pdf') ? 'PDF' : ext.endsWith('.docx') || ext.endsWith('.doc') ? 'DOCX' : 'TXT';
        formData.append('type', fileType);
        formData.append('file', file);
      }

      const res = await dev2Service.uploadDocument(formData);
      if (res && (res.aiAnalysis || res.data?.aiAnalysis)) {
        setAnalysisResult(res);
      } else {
        onUploadComplete?.(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload and parse document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[580px] max-w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent/15 text-accent rounded-xl">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-fg text-base">Upload Document & AI Parse</h3>
              <p className="text-xs text-muted">Automatically extract summaries, action tasks, and compliance risks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg text-muted hover:text-fg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {analysisResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">Document Uploaded & Parsed!</h4>
                  <p className="text-xs text-emerald-400/80 mt-0.5">
                    AI successfully extracted operational insights and synchronized them to your club workspace.
                  </p>
                </div>
              </div>

              {analysisResult.aiAnalysis?.summary && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} />
                    AI Summary
                  </h4>
                  <div className="text-xs text-fg/90 bg-card border border-border p-3.5 rounded-xl leading-relaxed">
                    {analysisResult.aiAnalysis.summary}
                  </div>
                </div>
              )}

              {analysisResult.createdTasks?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo size={13} />
                    Auto-Generated Tasks ({analysisResult.createdTasks.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {analysisResult.createdTasks.map((task, i) => (
                      <div key={i} className="text-xs text-fg bg-card p-2.5 rounded-lg border border-border flex items-center justify-between">
                        <span className="font-medium truncate">{task.title}</span>
                        <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                          {task.priority || 'medium'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.createdRisks?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={13} />
                    Identified Risks ({analysisResult.createdRisks.length})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {analysisResult.createdRisks.map((risk, i) => (
                      <div key={i} className="text-xs text-fg bg-card p-2.5 rounded-lg border border-red-500/20 flex items-center justify-between">
                        <span className="font-medium truncate">{risk.title}</span>
                        <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
                          {risk.severity || 'medium'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onUploadComplete(analysisResult.data || analysisResult)}
                className="w-full mt-4 py-2.5 bg-accent hover:bg-accentHover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20"
              >
                Complete & Return to Documents
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-fg outline-none focus:border-accent"
                  placeholder="e.g., Annual Tech Fest Guidelines & Safety Protocol"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Associated Event (Optional)</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-fg outline-none focus:border-accent"
                  >
                    <option value="">🏛️ Club-Wide Document (No event)</option>
                    {events.map((ev) => (
                      <option key={ev.id || ev._id} value={ev.id || ev._id}>
                        📅 {ev.name || ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Input Format</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-card border border-border p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPasteMode(false)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        !pasteMode ? 'bg-accent text-white' : 'text-muted hover:text-fg'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasteMode(true)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        pasteMode ? 'bg-accent text-white' : 'text-muted hover:text-fg'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-fg outline-none focus:border-accent"
                  placeholder="Short summary or note about this document..."
                />
              </div>

              {pasteMode ? (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">Document Content / Markdown *</label>
                  <textarea
                    rows={6}
                    required={pasteMode}
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    placeholder="Paste guidelines, schedules, rules, or requirements text here..."
                    className="w-full bg-card border border-border rounded-xl p-3.5 text-xs text-fg font-mono leading-relaxed outline-none focus:border-accent resize-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">File (.pdf, .docx, .txt) *</label>
                  <div className="relative border-2 border-dashed border-border hover:border-accent/40 rounded-xl p-6 flex flex-col items-center justify-center bg-card/60 hover:bg-card transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx,.doc"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-1.5 text-accent">
                        <FileText size={28} />
                        <span className="text-xs font-semibold text-fg text-center">{file.name}</span>
                        <span className="text-[10px] text-muted">{Math.round(file.size / 1024)} KB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-muted">
                        <Upload size={26} />
                        <span className="text-xs font-semibold text-fg">Click or drag document file here</span>
                        <span className="text-[10px] text-muted">PDF, DOCX, or TXT up to 15MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-muted hover:text-fg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || (!pasteMode && !file) || (pasteMode && !pastedContent.trim())}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentHover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  <Sparkles size={14} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'AI Parsing Document...' : 'Upload & Run AI Analysis'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadDocumentModal;
