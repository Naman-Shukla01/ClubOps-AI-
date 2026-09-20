import { apiRequest } from './api.js';

const toData = (payload) => payload?.data ?? payload ?? [];

export const getClubs = async () => {
  const res = await apiRequest('/clubs', { method: 'GET' });
  return toData(res);
};

export const joinClub = async (clubId) => {
  const res = await apiRequest(`/clubs/${clubId}/join`, { method: 'POST' });
  return toData(res);
};

export const leaveClub = async (clubId) => {
  const res = await apiRequest(`/clubs/${clubId}/leave`, { method: 'POST' });
  return toData(res);
};

export const createClub = async (data) => {
  const res = await apiRequest('/clubs', { method: 'POST', body: JSON.stringify(data) });
  return toData(res);
};

export const updateClub = async (clubId, data) => {
  const res = await apiRequest(`/clubs/${clubId}`, { method: 'PATCH', body: JSON.stringify(data) });
  return toData(res);
};

export const getClubMembers = async (clubId) => {
  const res = await apiRequest(`/clubs/${clubId}/members`, { method: 'GET' });
  return toData(res);
};

export const getClubEvents = async (clubId) => {
  const res = await apiRequest(`/clubs/${clubId}/events`, { method: 'GET' });
  return toData(res);
};

export const getClub = async (clubId) => {
  const res = await apiRequest(`/clubs/${clubId}`, { method: 'GET' });
  return toData(res);
};

export const createClubEvent = async (clubId, eventData) => {
  const res = await apiRequest(`/clubs/${clubId}/events`, { method: 'POST', body: JSON.stringify(eventData) });
  return toData(res);
};

export const clubService = { getClubs, joinClub, leaveClub, createClub, updateClub, getClubMembers, getClubEvents, getClub, createClubEvent };
