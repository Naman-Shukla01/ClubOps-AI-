import { api } from './api'

export const createActionFromMeeting = (data) => api.post('/actions/from-meeting', data)
export const updateTaskStatus = (id, status) => api.patch(`/actions/${id}/status`, { status })
export const getTaskStats = () => api.get('/analytics/task-stats')
export const getRiskSummary = () => api.get('/analytics/risk-summary')

export const dev3Service = { createActionFromMeeting, updateTaskStatus, getTaskStats, getRiskSummary }