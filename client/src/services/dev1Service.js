import { api } from './api'

export const getTasks = () => api.get('/tasks')
export const createTask = (data) => api.post('/tasks', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.del(`/tasks/${id}`)
export const getVolunteers = () => api.get('/volunteers')
export const createVolunteer = (data) => api.post('/volunteers', data)
export const assignTaskToVolunteer = (vid, tid) => api.patch(`/volunteers/${vid}/assign-task`, { taskId: tid })

export const dev1Service = { getTasks, createTask, updateTask, deleteTask, getVolunteers, createVolunteer, assignTaskToVolunteer }