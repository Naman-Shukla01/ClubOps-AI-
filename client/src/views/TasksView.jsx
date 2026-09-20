import React, { useState, useEffect } from 'react';
import { dev1Service } from '../services/dev1Service';
import { dev2Service } from '../services/dev2Service';

export function TasksView({ user }) {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('todo');
  const [editAssignee, setEditAssignee] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEventId, setNewEventId] = useState('');

  const isClubHead =
    user?.role === 'club-head' ||
    user?.role === 'lead' ||
    user?.role === 'EVENT_MANAGER' ||
    user?.role === 'ADMIN';

  const clubId = user?.activeClubId;

  useEffect(() => {
    loadData();
  }, [clubId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, eventsData] = await Promise.all([
        dev1Service.getTasks(),
        dev2Service.getEvents(),
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Failed to load tasks/events:', error);
      setTasks([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const taskPayload = {
      title: newTitle.trim(),
      status: 'todo',
      priority: newPriority,
      assignee: newAssignee.trim() || user?.name || 'Unassigned',
      dueDate: newDueDate || 'TBD',
    };
    try {
      const created = await dev1Service.createTask(taskPayload);
      const newTask = created?.data || created || { ...taskPayload, id: Date.now() };
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.warn('Backend task creation error, fallback local insert:', err);
      const localTask = { id: Date.now(), ...taskPayload };
      setTasks((prev) => [localTask, ...prev]);
    }
    setNewTitle('');
    setNewPriority('medium');
    setNewAssignee('');
    setNewDueDate('');
    setNewEventId('');
    setShowCreate(false);
  };

  const handleStatusChange = async (task, nextStatus) => {
    const isMyTask =
      task.assignee &&
      user?.name &&
      task.assignee.toLowerCase().trim() === user.name.toLowerCase().trim();
    const canUpdate = isClubHead || isMyTask;
    if (!canUpdate) return;
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, status: nextStatus } : t
    );
    setTasks(updatedTasks);
    try {
      await dev1Service.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      console.warn('Task status update backend sync failed:', err);
    }
  };

  const startEdit = (task) => {
    if (!isClubHead) return;
    setEditing(task);
    setEditTitle(task.title || '');
    setEditStatus(task.status || 'todo');
    setEditAssignee(task.assignee || '');
  };

  const saveEdit = async () => {
    if (!editing || !editTitle.trim() || !isClubHead) return;
    const updatedTasks = tasks.map((t) =>
      t.id === editing.id
        ? { ...t, title: editTitle.trim(), status: editStatus, assignee: editAssignee.trim() || 'Unassigned' }
        : t
    );
    setTasks(updatedTasks);
    setEditing(null);
    try {
      await dev1Service.updateTask(editing.id, {
        title: editTitle.trim(),
        status: editStatus,
        assignee: editAssignee.trim(),
      });
    } catch (err) {
      console.warn('Backend update failed:', err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!isClubHead) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await dev1Service.deleteTask(taskId);
    } catch (err) {
      console.warn('Backend delete failed:', err);
    }
  };

  const allFiltered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const myTasks = allFiltered.filter(
    (t) => t.assignee && user?.name && t.assignee.toLowerCase().trim() === user.name.toLowerCase().trim()
  );
  const otherTasks = allFiltered.filter(
    (t) => !(t.assignee && user?.name && t.assignee.toLowerCase().trim() === user.name.toLowerCase().trim())
  );

  const priorityColors = {
    high: 'bg-red/15 text-red',
    critical: 'bg-red/20 text-red font-bold',
    medium: 'bg-yellow/15 text-yellow',
    low: 'bg-green/15 text-green',
  };

  const statusColors = {
    todo: 'bg-muted/15 text-muted',
    'in-progress': 'bg-blue/15 text-blue',
    in_progress: 'bg-blue/15 text-blue',
    completed: 'bg-green/15 text-green',
  };

  const renderTask = (task) => {
    const isMyTask =
      task.assignee &&
      user?.name &&
      task.assignee.toLowerCase().trim() === user.name.toLowerCase().trim();
    const canUpdate = isClubHead || isMyTask;
    return (
      <div key={task.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
        {editing?.id === task.id ? (
          <div className="space-y-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
              placeholder="Task title"
            />
            <div className="flex gap-2">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-fg"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <input
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-fg outline-none"
                placeholder="Assignee"
              />
              <button onClick={saveEdit} className="bg-accent text-white px-3 py-2 rounded-lg text-xs">
                ✓ Save
              </button>
              <button onClick={() => setEditing(null)} className="bg-card border border-border text-muted px-3 py-2 rounded-lg text-xs">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${priorityColors[task.priority] || 'bg-muted/15 text-muted'}`}> {task.priority || 'medium'} </span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${statusColors[task.status] || 'bg-muted/15 text-muted'}`}> {task.status || 'todo'} </span>
            <span className="flex-1 text-sm text-fg font-medium">{task.title}</span>
            <span className="text-xs text-muted">👤 {task.assignee || 'Unassigned'}</span>
            {task.event?.name && (
              <span className="text-xs text-accent px-2 py-0.5 bg-accent/10 rounded-full flex items-center gap-1 border border-accent/20">
                📅 {task.event.name}
              </span>
            )}
            {isClubHead && (
              <div className="flex gap-1">
                <button onClick={() => startEdit(task)} className="px-2 py-1 bg-surface text-muted hover:text-fg rounded text-[10px]">Edit</button>
                <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red/10 text-red rounded text-[10px]">Del</button>
              </div>
            )}
            {canUpdate && (
              <button
                onClick={() =>
                  handleStatusChange(
                    task,
                    task.status === 'todo'
                      ? 'in-progress'
                      : task.status === 'in-progress' || task.status === 'in_progress'
                      ? 'completed'
                      : 'todo'
                  )
                }
                className="px-2.5 py-1 bg-accent/20 text-accent font-medium rounded text-[10px] hover:bg-accent/30 transition-colors"
              >
                {task.status === 'todo'
                  ? 'Start Task'
                  : task.status === 'in-progress' || task.status === 'in_progress'
                  ? 'Mark Done'
                  : 'Reopen'}
              </button>
            )}
          </div>
        )}
        {task.updates && task.updates.length > 0 && (
          <div className="pl-4 border-l-2 border-accent/40 space-y-1 mt-2">
            {task.updates.map((u, idx) => (
              <p key={idx} className="text-xs text-muted">
                💬 <span className="font-semibold text-fg">{u.by}</span>: {u.text}{' '}<span className="text-[10px]">({u.at})</span>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-fg">{clubId ? 'Club Tasks' : 'Tasks'}</h2>
          <p className="text-muted text-sm">
            {user?.activeClubName ? `${user.activeClubName} tasks` : 'Create, assign, and track tasks'}
          </p>
        </div>
        {isClubHead && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>✅</span> + Create Task
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'todo', 'in-progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs ${filter === f ? 'bg-accent text-white' : 'bg-card text-muted border border-border'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
              <span>🎯</span> Your Tasks <span className="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full">{myTasks.length}</span>
            </h3>
            {myTasks.length === 0 ? (
              <div className="text-center py-6 bg-card border border-border rounded-xl">
                <p className="text-muted text-sm">No tasks assigned to you</p>
              </div>
            ) : (
              <div className="space-y-3">{myTasks.map(renderTask)}</div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
              <span>📋</span> Other Club Tasks <span className="bg-muted/20 text-muted text-[10px] px-2 py-0.5 rounded-full">{otherTasks.length}</span>
            </h3>
            {otherTasks.length === 0 ? (
              <div className="text-center py-6 bg-card border border-border rounded-xl">
                <p className="text-muted text-sm">No other tasks in this club</p>
              </div>
            ) : (
              <div className="space-y-3">{otherTasks.map(renderTask)}</div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-surface border border-border rounded-2xl w-[500px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-fg">Create Task</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-card rounded-lg"><span className="text-muted">✕</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none focus:border-accent"
                placeholder="Task title"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted">Event</label>
                  <select
                    value={newEventId}
                    onChange={(e) => setNewEventId(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                  >
                    <option value="">No Event</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title || ev.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Assignee</label>
                  <input
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                    placeholder="Assignee"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-fg outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border" style={{ borderColor: '#2a2a32', color: '#aaa' }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg text-white text-sm font-medium" style={{ background: '#4f46e5' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}