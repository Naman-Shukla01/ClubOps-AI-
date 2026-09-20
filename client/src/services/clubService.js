import { dev1Service } from './dev1Service.js'
import { dev2Service } from './dev2Service.js'

const baseClubs = [
  { id: "1", name: "Tech Innovators Club", icon: "💻", color: "#7c5cfc", head: { name: "Arjun Mehta", email: "lead@clubops.ai" }, members: 24, maxMembers: 50, events: 5, description: "Exploring latest technologies and building innovative projects.", skills: ["Programming", "AI/ML", "Web Dev", "Cloud"] },
  { id: "2", name: "Cultural Vibes", icon: "🎭", color: "#f24e1e", head: { name: "Sarah Chen", email: "sarah@clubops.ai" }, members: 35, maxMembers: 60, events: 8, description: "Celebrating diversity through cultural events.", skills: ["Music", "Dance", "Theater", "Art"] },
  { id: "3", name: "Sports Arena", icon: "⚽", color: "#0ACF83", head: { name: "Mike Ross", email: "mike@clubops.ai" }, members: 42, maxMembers: 80, events: 12, description: "Promoting fitness and sportsmanship.", skills: ["Cricket", "Football", "Basketball"] },
];

export async function getClubs() {
  return { data: baseClubs };
}

export async function joinClub(clubId) {
  return { ok: true };
}

export async function leaveClub(clubId) {
  return { ok: true };
}

export async function createClub(data) {
  return {
    ...data,
    id: String(Date.now()),
    icon: data.icon || "⭐",
    color: "#7c5cfc",
    members: 1,
    events: 0,
    head: data.head || { name: "You", email: "you@clubops.ai" },
  };
}

export async function getClubMembers(clubId) {
  try {
    const vols = await dev1Service.getVolunteers();
    const members = Array.isArray(vols) ? vols : Array.isArray(vols?.data) ? vols.data : [];
    return { data: members };
  } catch {
    return { data: [] };
  }
}

export async function getClubEvents(clubId) {
  try {
    const events = await dev2Service.getEvents();
    const list = Array.isArray(events) ? events : Array.isArray(events?.data) ? events.data : [];
    return { data: list };
  } catch {
    return { data: [] };
  }
}

export async function getClub(clubId) {
  const club = baseClubs.find((c) => String(c.id) === String(clubId));
  if (club) return { data: club };
  const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
  return {
    data: {
      id: clubId,
      name: cu.activeClubName || "Active Club",
      icon: cu.activeClubIcon || "🏛️",
      members: 12,
      events: 3,
      description: "Active club workspace",
    },
  };
}

export async function createClubEvent(clubId, eventData) {
  try {
    const startDate = eventData.date || new Date().toISOString();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await dev2Service.createEvent({
      name: eventData.title || eventData.name,
      startDate,
      endDate,
    });
    return { data: res };
  } catch {
    return { ok: true };
  }
}

export const clubService = { getClubs, joinClub, leaveClub, createClub, getClubMembers, getClubEvents, getClub, createClubEvent };
