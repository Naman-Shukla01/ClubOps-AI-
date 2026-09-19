import React, { useState, useEffect } from 'react'
import ActionCopilotBar from '../components/actions/ActionCopilotBar'
import { clubService } from '../services/clubService'

export function DashboardView({ user, setActiveTab }) {
  const [stats, setStats] = useState({
    tasks: 0,
    events: 0,
    volunteers: 0,
  })

  const [activeClub, setActiveClub] = useState(null)

  const isClubHead = user?.role === 'club-head'

  useEffect(() => {
    const loadClub = async () => {
      if (!user?.activeClubId) {
        setActiveClub(null)
        return
      }

      try {
        const res = await clubService.getClub(user.activeClubId)

        if (res?.data?.id) {
          setActiveClub(res.data)
        }
      } catch {
        setActiveClub(null)
      }
    }

    loadClub()
  }, [user?.activeClubId])

  useEffect(() => {
    const loadStats = () => {
      if (!user?.activeClubId) {
        setStats({
          tasks: 0,
          events: 0,
          volunteers: 0,
        })
        return
      }

      const clubId = user.activeClubId

      const tasks = JSON.parse(
        localStorage.getItem(`tasks_${clubId}`) || '[]'
      )

      const events = JSON.parse(
        localStorage.getItem(`events_${clubId}`) || '[]'
      )

      const volunteers = JSON.parse(
        localStorage.getItem(`volunteers_${clubId}`) || '[]'
      )

      setStats({
        tasks: tasks.length,
        events: events.length,
        volunteers: volunteers.length,
      })
    }

    loadStats()

    window.addEventListener('storage', loadStats)

    return () => {
      window.removeEventListener('storage', loadStats)
    }
  }, [user?.activeClubId])

  const goTo = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  if (activeClub) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-fg">
              {activeClub.icon || '🏠'} {activeClub.name}
            </h2>

            <p className="text-muted text-sm">
              {isClubHead ? 'Club Head' : 'Member'} · {user?.activeClubName}
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
            <p className="text-xs text-muted mb-1">Members</p>
            <span className="text-3xl font-bold text-fg">
              {activeClub.members || 0}
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted mb-1">Tasks</p>
            <span className="text-3xl font-bold text-fg">
              {stats.tasks}
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted mb-1">Events</p>
            <span className="text-3xl font-bold text-fg">
              {stats.events || activeClub.events || 0}
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-fg mb-3">Quick Actions</h3>

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

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-fg mb-2">Club Info</h3>

          <p className="text-sm text-muted">
            {activeClub.description || 'No description'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-fg">
          Welcome back, {user?.name?.split(' ')[0] || 'Guest'}
        </h2>

        <p className="text-muted text-sm">
          Join a club to see its dashboard
        </p>
      </div>

      <ActionCopilotBar />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Events', value: 0, change: '+0', positive: true },
          { label: 'Tasks', value: 0, change: '+0', positive: true },
          { label: 'Risks', value: 0, change: '0', positive: false },
          { label: 'Volunteers', value: 0, change: '+0', positive: true },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <p className="text-xs text-muted mb-1">{s.label}</p>

            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-fg">
                {s.value}
              </span>

              <span
                className={`text-xs font-semibold ${s.positive ? 'text-green' : 'text-red'
                  }`}
              >
                {s.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <span className="text-4xl">🏠</span>
        <p className="text-muted mt-2">
          Join a club to get started
        </p>
      </div>
    </div>
  )
}