export const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase()
  if (value === 'admin') return 'ADMIN'
  if (value === 'event_manager' || value === 'event manager' || value === 'club-head' || value === 'club head' || value === 'lead') return 'EVENT_MANAGER'
  return value === 'volunteer' ? 'VOLUNTEER' : String(role || '').trim().toUpperCase()
}

export const canManageClubWork = (user) => ['ADMIN', 'EVENT_MANAGER'].includes(normalizeRole(user?.role))
