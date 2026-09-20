import { apiRequest } from './api.js';

const toData = (payload) => payload?.data ?? payload ?? [];

export const getAnnouncements = async (clubId) => {
  if (!clubId) return [];
  const res = await apiRequest(`/announcements?clubId=${clubId}`, { method: 'GET' });
  return toData(res);
};

export const createAnnouncement = async (data) => {
  const res = await apiRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toData(res);
};

export const updateAnnouncement = async (id, data) => {
  const res = await apiRequest(`/announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return toData(res);
};

export const deleteAnnouncement = async (id) => {
  const res = await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
  return toData(res);
};

export const announcementService = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
