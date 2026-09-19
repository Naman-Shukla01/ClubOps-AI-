import { api } from './api'

export const getDocuments = () => api.get('/documents')
export const uploadDocument = (data) => api.post('/documents', data)
export const getRisks = () => api.get('/risks')
export const createRisk = (data) => api.post('/risks', data)
export const updateRisk = (id, data) => api.put(`/risks/${id}`, data)
export const parseTranscript = (data) => api.post('/ai/parse-transcript', data)
export const analyzeRisks = (data) => api.post('/ai/analyze-risks', data)

export const dev2Service = { getDocuments, uploadDocument, getRisks, createRisk, updateRisk, parseTranscript, analyzeRisks }