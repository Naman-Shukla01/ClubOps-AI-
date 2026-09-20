import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { dev2Service } from '../../services/dev2Service';

export function AiChatAssistant({ eventId, clubId, onTasksChanged }) {

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('aiChatMessages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { role: 'assistant', text: 'Hi! I can help you automate actions based on meeting transcripts.\n\nTry commands like:\n• "Create a task for stage setup with high priority"\n• "Assign Sarah to catering due Friday"\n• "Mark audio check as done"' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const userText = input.trim();
    if (!userText || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await dev2Service.postAiChat(userText, eventId, clubId);
      // Backend returns: { success, reply, action, affectedRecord, timestamp }
      const replyText = res?.reply || res?.message || 'Action processed.';
      const records = res?.affectedRecords || (res?.affectedRecord ? [res.affectedRecord] : []);
      const actionType = res?.action?.type;

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: replyText,
        records,
        actionType,
        success: res?.success
      }]);

      if (res?.success && actionType && !['GENERAL_CHAT', 'QUERY_INFO'].includes(actionType)) {
        onTasksChanged?.();
      }
    } catch (err) {
      console.error('AI Chat error:', err);
      const errMsg = `Error: ${err?.message || 'Something went wrong.'}`;
      setMessages(prev => [...prev, { role: 'assistant', text: errMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const renderRecord = (record, idx) => {
    if (!record) return null;
    return (
      <div key={idx} className="mt-3 bg-surface border border-accent/30 rounded-lg p-3 text-xs space-y-1">
        <div className="flex items-center gap-1.5 text-accent font-semibold mb-2">
          <CheckCircle size={12} />
          <span>Saved to Database ✓</span>
        </div>
        {record.title && <p className="text-fg"><span className="text-muted">Task: </span>{record.title}</p>}
        {record.name && <p className="text-fg"><span className="text-muted">Event: </span>{record.name}</p>}
        {record.owner?.name && <p className="text-fg"><span className="text-muted">Assigned to: </span>{record.owner.name}</p>}
        {record.priority && <p className="text-fg"><span className="text-muted">Priority: </span>{record.priority}</p>}
        {record.status && <p className="text-fg"><span className="text-muted">Status: </span>{record.status}</p>}
        {record.deadline && <p className="text-fg"><span className="text-muted">Deadline: </span>{new Date(record.deadline).toLocaleDateString()}</p>}
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-border flex items-center gap-2 bg-accent/5">
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
          <Sparkles size={14} className="text-accent" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-fg">AI Automation Assistant</h4>
          <p className="text-[10px] text-muted">Powered by Gemini · Changes saved to DB instantly</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={12} className="text-accent" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl p-3 text-sm ${
              msg.role === 'user' ? 'bg-accent text-white rounded-tr-sm'
              : msg.isError ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm'
              : 'bg-card border border-border text-fg rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              {msg.records?.map((record, idx) => renderRecord(record, idx))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Bot size={12} className="text-accent" />
            </div>
            <div className="bg-card border border-border rounded-xl rounded-tl-sm p-3 text-sm text-muted flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-accent" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border bg-card">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a command... (Enter to send)"
            rows={2}
            className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-sm text-fg outline-none focus:border-accent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 bg-accent text-white rounded-lg disabled:opacity-40 hover:bg-accentHover transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
