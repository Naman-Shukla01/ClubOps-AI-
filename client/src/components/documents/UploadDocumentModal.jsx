import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { dev2Service } from '../../services/dev2Service';

export function UploadDocumentModal({ activeClubId, onClose, onUploadComplete }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    dev2Service
      .getEvents(activeClubId)
      .then((evs) => {
        const list = Array.isArray(evs) ? evs : [];
        setEvents(list);
        if (list.length > 0) {
          setSelectedEvent(list[0].id || list[0]._id);
        }
      })
      .catch(console.error);
  }, [activeClubId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !title || !file) {
      setError('Event, Title, and File are required');
      return;
    }
    setError('');
    setLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('event', selectedEvent);
      if (activeClubId) {
        formData.append('club', activeClubId);
      }
      formData.append('title', title);
      formData.append('description', description);
      
      const fileType = file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.txt') ? 'TXT' : 'DOCX';
      formData.append('type', fileType);
      formData.append('file', file);

      const res = await dev2Service.uploadDocument(formData);
      if (res && res.aiAnalysis) {
        setAnalysisResult(res);
      } else {
        onUploadComplete?.(res);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload document');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%] flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-fg">Upload Document & AI Parse</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-card rounded-lg">
            <X size={16} className="text-muted" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>}
          
          {analysisResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <h4 className="text-sm font-bold text-green-400 mb-1">Upload Successful!</h4>
                <p className="text-xs text-green-400/80">AI has successfully processed this document.</p>
              </div>
              
              {analysisResult.aiAnalysis.summary && (
                <div>
                  <h4 className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">Summary</h4>
                  <p className="text-sm text-fg/90 bg-card p-3 rounded-lg leading-relaxed">{analysisResult.aiAnalysis.summary}</p>
                </div>
              )}
              
              {analysisResult.createdTasks?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">Generated Tasks ({analysisResult.createdTasks.length})</h4>
                  <ul className="space-y-2">
                    {analysisResult.createdTasks.map((task, i) => (
                      <li key={i} className="text-sm text-fg bg-card p-3 rounded-lg border border-border flex flex-col gap-1">
                        <span className="font-medium">{task.title}</span>
                        {task.deadline && <span className="text-xs text-muted">Deadline: {new Date(task.deadline).toLocaleDateString()}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResult.createdRisks?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider">Identified Risks ({analysisResult.createdRisks.length})</h4>
                  <ul className="space-y-2">
                    {analysisResult.createdRisks.map((risk, i) => (
                      <li key={i} className="text-sm text-fg bg-card p-3 rounded-lg border border-red-500/20 flex flex-col gap-1">
                        <span className="font-medium">{risk.title}</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          risk.severity === 'high' || risk.severity === 'critical' ? 'text-red-400' :
                          risk.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          Severity: {risk.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button 
                onClick={() => onUploadComplete(analysisResult.data)} 
                className="w-full mt-4 py-2.5 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-semibold transition-colors">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Related Event</label>
                <select 
                  value={selectedEvent} 
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent appearance-none">
                  <option value="" disabled>Select an event...</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.name || ev.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Document Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                  placeholder="e.g., Spring Hackathon Requirements"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent resize-none h-20"
                  placeholder="Brief description of the document..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">File (.pdf, .txt)</label>
                <div className="relative border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-card hover:bg-card/80 transition-colors">
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.docx" 
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2 text-accent">
                      <FileText size={24} />
                      <span className="text-sm font-medium text-fg text-center">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted">
                      <Upload size={24} />
                      <span className="text-sm font-medium">Click or drag file to upload</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading || !file || !title || !selectedEvent}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    loading || !file || !title || !selectedEvent
                      ? 'bg-card text-muted cursor-not-allowed'
                      : 'bg-accent hover:bg-accentHover text-white'
                  }`}>
                  {loading ? 'AI is processing...' : 'Upload & Automate'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
