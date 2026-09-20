export function ClubCard({ club, isMember, isHead, onJoin, onLeave, onManage, onSetActive, loading }) {
  const maxMembers = club.maxMembers || 50
  const members = club.members || 0
  const isFull = members >= maxMembers
  const percent = maxMembers > 0 ? Math.min((members / maxMembers) * 100, 100) : 0

  return (
    <div className={`bg-card border border-border rounded-2xl p-5 hover:border-accent/30 transition-all ${loading ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${club.color || '#7c5cfc'}18` }}>{club.icon || '🏛️'}</div>
          <div className="min-w-0">
            <h3 className="font-semibold text-fg text-sm truncate">{club.name}</h3>
            <p className="text-[11px] text-muted">{members}/{maxMembers} members</p>
          </div>
        </div>
        {isHead && <button onClick={(e) => { e.stopPropagation(); onManage?.(club); }} className="shrink-0 text-[10px] bg-accent/15 text-accent px-2 py-1 rounded-full hover:bg-accent/25 transition-colors">Manage</button>}
      </div>
      <p className="text-xs text-fg/70 mb-3 leading-relaxed">{club.description || 'No description'}</p>
      {club.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {club.skills.map((s) => <span key={s} className="text-[10px] bg-surface text-muted px-2 py-0.5 rounded">{s}</span>)}
        </div>
      )}
      <div className="flex items-center justify-between text-[11px] text-muted mb-3">
        <span>Head: {club.head?.name || 'TBD'}</span>
        <span>{club.events || 0} events</span>
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all ${isFull ? 'bg-red' : 'bg-green'}`} style={{ width: `${percent}%` }}></div>
      </div>
      <div className="flex gap-2">
        {isMember ? (
          <>
            <button onClick={(e) => { e.stopPropagation(); onLeave?.(club.id); }} disabled={loading} className="px-3 py-1.5 bg-red/10 text-red text-xs font-semibold rounded-lg hover:bg-red/20 disabled:opacity-50">Leave</button>
            <button onClick={(e) => { e.stopPropagation(); onSetActive?.(club); }} disabled={loading} className="flex-1 px-3 py-1.5 bg-accent/20 text-accent text-xs font-semibold rounded-lg hover:bg-accent/30 transition-colors">Set Active</button>
          </>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onJoin?.(club); }} disabled={loading || isFull} className="flex-1 px-3 py-1.5 bg-accent hover:bg-accentHover text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
            {isFull ? 'Full' : 'Join Club'}
          </button>
        )}
      </div>
    </div>
  )
}
