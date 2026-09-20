import { apiRequest } from './api.js'

const toData = (payload) => payload?.data ?? payload ?? []

const normalizeTask = (task) => ({
  ...task,
  status: task?.status === 'in_progress' ? 'in-progress' : (task?.status || 'todo'),
  assignee: task?.assignee || task?.owner?.name || 'Unassigned',
  dueDate: task?.dueDate || 'TBD',
  tags: Array.isArray(task?.tags) ? task.tags : [],
})

const toTaskData = (payload) => {
  const data = toData(payload)
  return Array.isArray(data) ? data.map(normalizeTask) : normalizeTask(data)
}

const normalizeTaskPayload = (data = {}) => ({
  ...data,
  owner: data.owner ?? data.assignee ?? undefined,
  deadline: (() => {
    const value = data.deadline ?? data.dueDate
    if (!value || value === 'TBD') return undefined
    return Number.isNaN(new Date(value).getTime()) ? undefined : value
  })(),
})

export const getTasks = async (clubId) => {
  const url = clubId && clubId !== '1' ? `/tasks?clubId=${clubId}` : '/tasks'
  const res = await apiRequest(url, { method: 'GET' })
  return toTaskData(res)
}

export const createTask = async (data) => {
  const res = await apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(normalizeTaskPayload(data)),
  })
  return toTaskData(res)
}

export const updateTask = async (id, data) => {
  const res = await apiRequest(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(normalizeTaskPayload(data)),
  })
  return toTaskData(res)
}

export const deleteTask = async (id) => {
  const res = await apiRequest(`/tasks/${id}`, { method: 'DELETE' })
  return toData(res)
}

export const getVolunteers = async () => {
  const res = await apiRequest('/volunteers', { method: 'GET' })
  return toData(res)
}

export const createVolunteer = async (data) => {
  const res = await apiRequest('/volunteers', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return toData(res)
}

export const assignTaskToVolunteer = async (vid, tid) => {
  const res = await apiRequest(`/volunteers/${vid}/assign-task`, {
    method: 'PATCH',
    body: JSON.stringify({ taskId: tid }),
  })
  return toData(res)
}

export const dev1Service = { getTasks, createTask, updateTask, deleteTask, getVolunteers, createVolunteer, assignTaskToVolunteer }