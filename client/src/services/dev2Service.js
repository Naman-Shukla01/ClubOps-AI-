import { apiRequest } from './api.js'

const toData = (payload) => payload?.data ?? payload ?? []

export const getEvents = async () => {
  const res = await apiRequest('/events', { method: 'GET' })
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

export const getDocuments = async () => {
  const res = await apiRequest('/documents', { method: 'GET' })
  return toData(res)
}

export const uploadDocument = async (data) => {
  const res = await apiRequest('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
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

export const dev2Service = { getEvents, getMeetings, createMeeting, createEvent, getDocuments, uploadDocument, getRisks, parseTranscript, analyzeRisks, generateAnnouncement }