import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

const tabList = ["Dashboard", "Clubs", "Events", "Tasks", "Announcements", "Volunteers", "Documents & Risks", "Meetings"];

export default function Sidebar({ user, activeTab, setActiveTab, onLogout, setUser }) {
  const [expanded, setExpanded] = useState(true);
  const [clubsOpen, setClubsOpen] = useState(true);
  const navigate = useNavigate();

  const defaultClubsList = [
    { id: 1, name: 'Tech Innovators Club', icon: '💻' },
    { id: 2, name: 'Cultural Vibes', icon: '🎭' },
    { id: 3, name: 'Sports Arena', icon: '⚽' },
    { id: 4, name: 'Debate Council', icon: '🎤' },
    { id: 5, name: 'Social Impact', icon: '🌍' },
  ];

  const userJoinedIds = new Set((user?.joinedClubs || []).map((c) => String(c.id)));
  if (user?.activeClubId) userJoinedIds.add(String(user.activeClubId));

  const clubsToShow = user?.joinedClubs?.length > 0
    ? user.joinedClubs
    : defaultClubsList;

  const handleSelectClub = (club) => {
    const cu = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const currentJoined = cu.joinedClubs || [];
    const updatedJoined = [...currentJoined.filter(c => String(c.id) !== String(club.id)), { id: club.id, name: club.name, icon: club.icon || '🏛️' }];
    cu.joinedClubs = updatedJoined;
    cu.activeClubId = club.id;
    cu.activeClubName = club.name;
    cu.activeClubIcon = club.icon || '🏛️';
    localStorage.setItem("currentUser", JSON.stringify(cu));
    if (setUser) setUser(cu);
    setActiveTab("Dashboard");
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <aside className={`flex flex-col border-r transition-all ${expanded ? "w-60" : "w-16"}`} style={{ background: "#0f0f13", borderColor: "#1e1e24" }}>
      <div className="p-4 flex items-center gap-3">
        <img src={logo} alt="ClubOps" className="w-12 h-12 rounded-lg object-contain" />
        {expanded && <span className="font-bold text-white">ClubOps</span>}
      </div>

      <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto">
        {tabList.map((tab) => {
          const isClubsTab = tab === "Clubs";
          return (
            <div key={tab} className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab(tab);
                  if (isClubsTab) setClubsOpen(!clubsOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                  }`}
                style={activeTab === tab ? { background: "rgba(79,70,229,0.15)" } : {}}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span>{getIcon(tab)}</span>
                  {expanded && <span className="truncate">{tab}</span>}
                </div>
                {isClubsTab && expanded && (
                  <span className="text-xs text-gray-500">{clubsOpen ? "▾" : "▸"}</span>
                )}
              </button>

              {isClubsTab && expanded && clubsOpen && (
                <div className="pl-6 space-y-1 my-1 border-l border-white/10 ml-4">
                  {clubsToShow.map((club) => {
                    const isActive = String(user?.activeClubId) === String(club.id);
                    const isJoined = userJoinedIds.has(String(club.id));
                    return (
                      <button
                        key={club.id}
                        onClick={() => handleSelectClub(club)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${isActive
                          ? "text-indigo-400 font-semibold bg-indigo-500/15 border border-indigo-500/30"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                          }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{club.icon || "🏛️"}</span>
                          <span className="truncate">{club.name}</span>
                        </div>
                        {isActive ? (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded shrink-0">Active</span>
                        ) : isJoined ? (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded shrink-0">Joined</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-2 border-t" style={{ borderColor: "#1e1e24" }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white text-sm"
        >
          <span>{expanded ? "←" : "→"}</span>
          {expanded && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 text-sm mt-1"
        >
          <span>🚪</span>
          {expanded && <span>Logout</span>}
        </button>
        {expanded && user && (
          <div className="px-3 py-2 mt-2">
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-gray-500 text-xs">{user.role === "club-head" ? "Club Head" : "Volunteer"}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function getIcon(tab) {
  const icons = {
    "Dashboard": "📊",
    "Documents & Risks": "📄",
    "Tasks": "✅",
    "Volunteers": "👥",
    "Clubs": "🏛️",
    "Meetings": "🗣️",
    "Events": "📅",
    "Announcements": "📢",
  };
  return icons[tab] || "•";
}
