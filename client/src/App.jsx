import React, { useState, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DocumentsAndRisksView } from './views/DocumentsAndRisksView'
import { DashboardView } from './views/DashboardView'
import { TasksView } from './views/TasksView'
import { VolunteersView } from './views/VolunteersView'
import { MeetingsView } from './views/MeetingsView'
import { EventsView } from './views/EventsView'
import { AnnouncementsView } from './views/AnnouncementsView'
import Login from './pages/Login'
import ProfileModal from './components/layout/ProfileModal'
import ActionCopilotBar from './components/actions/ActionCopilotBar'
import { apiRequest } from './services/api.js'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'] },
  { id: 'documents', label: 'Documents & Risks', icon: '📁', roles: ['ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'] },
  { id: 'tasks', label: 'Tasks', icon: '✅', roles: ['ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'] },
  { id: 'volunteers', label: 'Volunteers', icon: '👥', roles: ['ADMIN', 'EVENT_MANAGER'] },
  { id: 'meetings', label: 'Meetings', icon: '🎙️', roles: ['ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'] },
  { id: 'events', label: 'Events', icon: '📅', roles: ['ADMIN', 'EVENT_MANAGER', 'VOLUNTEER'] },
  { id: 'announcements', label: 'Announcements', icon: '📢', roles: ['ADMIN', 'EVENT_MANAGER'] },
]

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('documents')
  const [newTaskId, setNewTaskId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [authError, setAuthError] = useState('')
  const [loggedInUser, setLoggedInUser] = useState(null)

  useEffect(() => {
    const handleAuthRequired = (event) => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setIsLoggedIn(false)
      setAuthError(event.detail?.message || 'Your session has expired. Please sign in again.')
    }
    const handleForbidden = (event) => {
      setAuthError(event.detail?.message || 'You do not have permission to perform this action.')
    }
    window.addEventListener('clubops:auth-required', handleAuthRequired)
    window.addEventListener('clubops:forbidden', handleForbidden)
    const cleanup = () => {
      window.removeEventListener('clubops:auth-required', handleAuthRequired)
      window.removeEventListener('clubops:forbidden', handleForbidden)
    }

    const hash = new URLSearchParams(window.location.hash.slice(1))
    const oauthToken = hash.get('oauth_token')
    const oauthError = hash.get('oauth_error')

    if (oauthError) {
      setAuthError(oauthError)
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
      return cleanup
    }

    if (oauthToken) {
      localStorage.setItem('accessToken', oauthToken)
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
      apiRequest('/auth/me').then((result) => {
        localStorage.setItem('user', JSON.stringify(result.user))
        setLoggedInUser(result.user)
        setIsLoggedIn(true)
      }).catch((error) => {
        localStorage.removeItem('accessToken')
        setAuthError(error.message || 'Google authentication failed')
      })
      return cleanup
    }

    const token = localStorage.getItem('accessToken')
    if (!token) return cleanup

    apiRequest('/auth/me').then((result) => {
      localStorage.setItem('user', JSON.stringify(result.user))
      setLoggedInUser(result.user)
      setIsLoggedIn(true)
    }).catch(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    })

    return cleanup
  }, [])

  if (!isLoggedIn) return <Login initialError={authError} onLogin={(u) => { setLoggedInUser(u); setIsLoggedIn(true) }} />

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={loggedInUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
        onProfileClick={() => setShowProfile(true)}
        onLogout={() => { localStorage.removeItem('user'); localStorage.removeItem('accessToken'); window.location.reload() }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {authError && <p className="mb-4 text-xs text-red" role="alert">{authError}</p>}
          {activeTab === 'dashboard' && <DashboardView user={loggedInUser} />}
          {activeTab === 'documents' && <DocumentsAndRisksView />}
          {activeTab === 'tasks' && <TasksView key={newTaskId || 'default'} user={loggedInUser} />}
          {activeTab === 'volunteers' && <VolunteersView />}
          {activeTab === 'meetings' && <MeetingsView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'announcements' && <AnnouncementsView user={loggedInUser} />}
        </main>
      </div>
      {showProfile && <ProfileModal user={loggedInUser} onClose={() => setShowProfile(false)} />}
    </div>
  )
}