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

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'documents', label: 'Documents & Risks', icon: '📁' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'volunteers', label: 'Volunteers', icon: '👥' },
  { id: 'meetings', label: 'Meetings', icon: '🎙️' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'announcements', label: 'Announcements', icon: '📢' },
]

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('documents')
  const [newTaskId, setNewTaskId] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState({ name: 'Arjun Mehta', role: 'Event Lead', email: 'arjun@org.com' })

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) { setIsLoggedIn(true); setLoggedInUser(JSON.parse(saved)) }
  }, [])

  if (!isLoggedIn) return <Login onLogin={(u) => { setLoggedInUser(u); setIsLoggedIn(true) }} />

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={loggedInUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
        onProfileClick={() => setShowProfile(true)}
        onLogout={() => { localStorage.removeItem('user'); window.location.reload() }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'documents' && <DocumentsAndRisksView />}
          {activeTab === 'tasks' && <TasksView key={newTaskId || 'default'} />}
          {activeTab === 'volunteers' && <VolunteersView />}
          {activeTab === 'meetings' && <MeetingsView />}
          {activeTab === 'events' && <EventsView />}
          {activeTab === 'announcements' && <AnnouncementsView />}
        </main>
      </div>
      {showProfile && <ProfileModal user={loggedInUser} onClose={() => setShowProfile(false)} />}
    </div>
  )
}