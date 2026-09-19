const BASE = "http://localhost:5000/api";

const mockClubsData = [
  { id: "1", name: "Tech Innovators Club", icon: "💻", color: "#7c5cfc", head: { name: "Arjun Mehta", email: "arjun@org.com" }, members: 24, maxMembers: 50, events: 5, description: "Exploring latest technologies and building innovative projects.", skills: ["Programming", "AI/ML", "Web Dev", "Cloud"] },
  { id: "2", name: "Cultural Vibes", icon: "🎭", color: "#f24e1e", head: { name: "Sarah Chen", email: "sarah@org.com" }, members: 35, maxMembers: 60, events: 8, description: "Celebrating diversity through cultural events.", skills: ["Music", "Dance", "Theater", "Art"] },
  { id: "3", name: "Sports Arena", icon: "⚽", color: "#0ACF83", head: { name: "Mike Ross", email: "mike@org.com" }, members: 42, maxMembers: 80, events: 12, description: "Promoting fitness and sportsmanship.", skills: ["Cricket", "Football", "Basketball"] },
  { id: "4", name: "Debate Council", icon: "🎤", color: "#1ABCFE", head: { name: "Kim Lee", email: "kim@org.com" }, members: 18, maxMembers: 40, events: 4, description: "Sharpening public speaking skills.", skills: ["Debate", "Speaking", "MUN"] },
  { id: "5", name: "Social Impact", icon: "🌍", color: "#fbbf24", head: { name: "Alex Kim", email: "alex@org.com" }, members: 28, maxMembers: 50, events: 6, description: "Making a difference through social causes.", skills: ["Volunteering", "Social Work"] },
];

export async function getClubs() {
  try {
    const res = await fetch(`${BASE}/clubs`);
    if (res.ok) return await res.json();
  } catch { }
  const custom = JSON.parse(localStorage.getItem("created_clubs") || "[]");
  return { data: [...custom, ...mockClubsData] };
}

export async function joinClub(clubId) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}/join`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch { }
  return { ok: true };
}

export async function leaveClub(clubId) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}/leave`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch { }
  return { ok: true };
}

export async function createClub(data) {
  try {
    const res = await fetch(`${BASE}/clubs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch { }
  return {
    ...data, id: String(Date.now()), icon: data.icon || "⭐",
    color: "#7c5cfc", members: 1, events: 0,
    head: data.head || { name: "You", email: "you@org.com" },
  };
}

export async function getClubMembers(clubId) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}/members`);
    if (res.ok) return await res.json();
  } catch { }
  return { data: [] };
}

export async function getClubEvents(clubId) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}/events`);
    if (res.ok) return await res.json();
  } catch { }
  return { data: [] };
}

export async function getClub(clubId) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}`);
    if (res.ok) return await res.json();
  } catch { }
  const custom = JSON.parse(localStorage.getItem("created_clubs") || "[]");
  const allClubs = [...custom, ...mockClubsData];
  const club = allClubs.find((c) => String(c.id) === String(clubId));
  if (club) return { data: club };
  const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
  return { data: { id: clubId, name: cu.activeClubName || "Active Club", icon: cu.activeClubIcon || "🏛️", members: cu.members || 1, events: 2, description: "Active club workspace" } };
}

export async function createClubEvent(clubId, eventData) {
  try {
    const res = await fetch(`${BASE}/clubs/${clubId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    if (res.ok) return await res.json();
  } catch { }
  return { ok: true };
}

export const clubService = { getClubs, joinClub, leaveClub, createClub, getClubMembers, getClubEvents, getClub, createClubEvent };
