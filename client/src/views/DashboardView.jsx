import React, { useState, useEffect } from 'react'
import ActionCopilotBar from '../components/actions/ActionCopilotBar'
import { clubService } from '../services/clubService'
import { dev1Service } from '../services/dev1Service'
import { dev2Service } from '../services/dev2Service'

export function DashboardView({ user, setActiveTab }) {
  const [stats, setStats] = useState({
    tasks: 0,
    events: 0,
    volunteers: 0,
  })

  const [activeClub, setActiveClub] = useState(null)

  const isClubHead = user?.role === 'club-head' || user?.role === 'lead' || user?.role === 'EVENT_MANAGER'

  useEffect(() => {
    const loadClub = async () => {
      const activeId = user?.activeClubId;
      const isValidObjectId = typeof activeId === 'string' && /^[0-9a-fA-F]{24}$/.test(activeId);

      if (!activeId || !isValidObjectId) {
        setActiveClub({
          id: isValidObjectId ? activeId : null,
          name: user?.activeClubName || 'Dashboard',
          icon: user?.activeClubIcon || '🏠',
          description: '',
          members: 0,
          events: 0,
        });
        return;
      }

      try {
        const res = await clubService.getClub(activeId);
        if (res?.data?.id || res?.data?._id) {
          setActiveClub(res.data);
        } else if (res?.id || res?._id) {
          setActiveClub(res);
        } else {
          setActiveClub({
            id: activeId,
            name: user?.activeClubName || 'Club Dashboard',
            icon: user?.activeClubIcon || '🏛️',
            members: 0,
            events: 0,
          });
        }
      } catch {
        setActiveClub({
          id: activeId,
          name: user?.activeClubName || 'Club Dashboard',
          icon: user?.activeClubIcon || '🏛️',
          members: 0,
          events: 0,
        });
      }
    };

    loadClub();
  }, [user?.activeClubId, user?.activeClubName, user?.activeClubIcon])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [tasksRes, eventsRes, volsRes] = await Promise.all([
          dev1Service.getTasks().catch(() => []),
          dev2Service.getEvents().catch(() => []),
          dev1Service.getVolunteers().catch(() => []),
        ])

        const tasksCount = Array.isArray(tasksRes) ? tasksRes.length : Array.isArray(tasksRes?.data) ? tasksRes.data.length : 0
        const eventsCount = Array.isArray(eventsRes) ? eventsRes.length : Array.isArray(eventsRes?.data) ? eventsRes.data.length : 0
        const volsCount = Array.isArray(volsRes) ? volsRes.length : Array.isArray(volsRes?.data) ? volsRes.data.length : 0

        setStats({
          tasks: tasksCount,
          events: eventsCount,
          volunteers: volsCount,
        })
      } catch (error) {
        console.warn('Dashboard stats API fetch error:', error)
      }
    }

    loadStats()
  }, [user?.activeClubId])

  const goTo = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fg">
            {activeClub?.icon || '🏠'} {activeClub?.name || 'Dashboard'}
          </h2>

          <p className="text-muted text-sm">
            {isClubHead ? 'Club Head' : 'Member'} · {user?.activeClubName || 'All Clubs'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => goTo('Tasks')}
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-xl text-sm"
          >
            Tasks
          </button>

          <button
            onClick={() => goTo('Announcements')}
            className="px-4 py-2 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm"
          >
            Announcements
          </button>

          <button
            onClick={() => goTo('Events')}
            className="px-4 py-2 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm"
          >
            Events
          </button>
        </div>
      </div>

      <ActionCopilotBar />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted mb-1">
            Volunteers
          </p>

          <span className="text-3xl font-bold text-fg">
            {stats.volunteers || activeClub?.members || 0}
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted mb-1">
            Tasks
          </p>

          <span className="text-3xl font-bold text-fg">
            {stats.tasks}
          </span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted mb-1">
            Events
          </p>

          <span className="text-3xl font-bold text-fg">
            {stats.events}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-fg mb-3">
          Quick Actions
        </h3>

        <div className="flex gap-3">
          {isClubHead ? (
            <>
              <button
                onClick={() => goTo('Tasks')}
                className="flex-1 py-3 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-semibold"
              >
                Create Task
              </button>

              <button
                onClick={() => goTo('Announcements')}
                className="flex-1 py-3 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm font-semibold"
              >
                New Announcement
              </button>

              <button
                onClick={() => goTo('Events')}
                className="flex-1 py-3 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm font-semibold"
              >
                Create Event
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => goTo('Tasks')}
                className="flex-1 py-3 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm font-semibold"
              >
                My Tasks
              </button>

              <button
                onClick={() => goTo('Announcements')}
                className="flex-1 py-3 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm font-semibold"
              >
                Announcements
              </button>

              <button
                onClick={() => goTo('Events')}
                className="flex-1 py-3 bg-card border border-border text-fg hover:border-accent/40 rounded-xl text-sm font-semibold"
              >
                Events
              </button>
            </>
          )}
        </div>
      </div>

      {activeClub?.description && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-fg mb-2">
            Club Info
          </h3>

          <p className="text-sm text-muted">
            {activeClub.description}
          </p>
        </div>
      )}
    </div>
  )
}