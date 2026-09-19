import { api, apiRequest } from './api.js'

/**
 * Developer 3: Conversational Actions & Dashboard Analytics Service
 */

/**
 * Send natural language command to conversational action executor
 * @param {string} prompt - The natural language command (e.g. "Assign Sarah to stage setup")
 * @param {object} [context={}] - Optional context ({ eventId, userId })
 * @returns {Promise<object>} { success, reply, action, affectedRecord }
 */
export async function sendChatMessage(prompt, context = {}) {
  return apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      eventId: context.eventId,
      userId: context.userId,
    }),
  })
}

/**
 * Fetch Event Health and Aggregated Analytics
 * @param {string} [eventId] - Optional event ID filter
 * @returns {Promise<object>} Health metrics, risk radar, completion %, volunteer workloads
 */
export async function getHealthAnalytics(eventId = null) {
  const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''
  return apiRequest(`/analytics/health${query}`, {
    method: 'GET',
  })
}

/**
 * Execute direct action command
 */
export async function executeAction(command, context = {}) {
  return apiRequest('/actions/chat', {
    method: 'POST',
    body: JSON.stringify({
      prompt: command,
      ...context,
    }),
  })
}

export const createActionFromMeeting = (data) => api.post('/actions/from-meeting', data)
export const updateTaskStatus = (id, status) => api.patch(`/actions/${id}/status`, { status })
export const getTaskStats = () => api.get('/analytics/task-stats')
export const getRiskSummary = () => api.get('/analytics/risk-summary')

export const dev3Service = {
  sendChatMessage,
  getHealthAnalytics,
  executeAction,
  createActionFromMeeting,
  updateTaskStatus,
  getTaskStats,
  getRiskSummary,
}

export default dev3Service
