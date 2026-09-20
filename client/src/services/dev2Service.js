import { apiRequest } from './api.js'

const toData = (payload) => payload?.data ?? payload ?? []

export const getEvents = async (clubId) => {
  const url = clubId && clubId !== '1' ? `/events?clubId=${clubId}` : '/events'
  const res = await apiRequest(url, { method: 'GET' })
  return toData(res)
}

export const getMeetings = async () => {
  const res = await apiRequest('/meetings', { method: 'GET' })
  return toData(res)
}

export const createMeeting = async (data) => {
  const res = await apiRequest('/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return toData(res)
}

export const createEvent = async (data) => {
  const res = await apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return toData(res)
}

export const updateEvent = async (id, data) => {
  const res = await apiRequest(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return toData(res)
}

export const deleteEvent = async (id) => {
  const res = await apiRequest(`/events/${id}`, { method: 'DELETE' })
  return toData(res)
}

export const getDocuments = async () => {
  const res = await apiRequest('/documents', { method: 'GET' })
  return toData(res)
}

export const uploadDocument = async (formData) => {
  const res = await apiRequest('/documents', {
    method: 'POST',
    body: formData,
  })
  return toData(res)
}

export const getRisks = async () => {
  const res = await apiRequest('/risks', { method: 'GET' })
  return toData(res)
}

export const parseTranscript = async (data) => {
  const res = await apiRequest('/meetings/process', {
    method: 'POST',
    body: JSON.stringify({
      meetingId: data?.meetingId,
      text: data?.text ?? data?.transcript ?? '',
    }),
  })
  return res
}

export const analyzeRisks = async (data) => {
  const res = await apiRequest('/ai/risk-scan', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export const generateAnnouncement = async (data) => {
  const res = await apiRequest('/ai/announcement', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res
}

export const postAiChat = async (prompt, eventId, clubId) => {
  const res = await apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, eventId, clubId }),
  })
  return res
}

export const searchAi = async (query, eventId) => {
  const url = eventId
    ? `/ai/search?q=${encodeURIComponent(query)}&eventId=${eventId}`
    : `/ai/search?q=${encodeURIComponent(query)}`
  return apiRequest(url, { method: 'GET' })
}

export const dev2Service = { getEvents, getMeetings, createMeeting, createEvent, updateEvent, deleteEvent, getDocuments, uploadDocument, getRisks, parseTranscript, analyzeRisks, generateAnnouncement, postAiChat, searchAi }