import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";

const tabList = [
  "Dashboard",
  "Clubs",
  "Events",
  "Tasks",
  "Announcements",
  "Volunteers",
  "Documents & Risks",
  "Meetings",
];

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  setUser,
}) {

  const [expanded, setExpanded] = useState(true);
  const [clubsOpen, setClubsOpen] = useState(true);

  const navigate = useNavigate();

  // -----------------------------------------
  // Default clubs
  // -----------------------------------------
  const defaultClubsList = [
    {
      id: 1,
      name: "Tech Innovators Club",
      icon: "💻",
    },
    {
      id: 2,
      name: "Cultural Vibes",
      icon: "🎭",
    },
    {
      id: 3,
      name: "Sports Arena",
      icon: "⚽",
    },
    {
      id: 4,
      name: "Debate Council",
      icon: "🎤",
    },
    {
      id: 5,
      name: "Social Impact",
      icon: "🌍",
    },
  ];

  // -----------------------------------------
  // Joined clubs
  // -----------------------------------------
  const userJoinedIds = new Set(
    (user?.joinedClubs || []).map(
      (club) => String(club.id)
    )
  );

  if (user?.activeClubId) {
    userJoinedIds.add(
      String(user.activeClubId)
    );
  }

  const clubsToShow =
    user?.joinedClubs?.length > 0
      ? user.joinedClubs
      : defaultClubsList;

  // -----------------------------------------
  // Select club
  // -----------------------------------------
  const handleSelectClub = (club) => {

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "{}"
    );

    const currentJoined =
      currentUser.joinedClubs || [];

    const updatedJoined = [
      ...currentJoined.filter(
        (existingClub) =>
          String(existingClub.id) !==
          String(club.id)
      ),
      {
        id: club.id,
        name: club.name,
        icon: club.icon || "🏛️",
      },
    ];

    currentUser.joinedClubs =
      updatedJoined;

    currentUser.activeClubId =
      club.id;

    currentUser.activeClubName =
      club.name;

    currentUser.activeClubIcon =
      club.icon || "🏛️";

    // Save current user
    localStorage.setItem(
      "currentUser",
      JSON.stringify(currentUser)
    );

    // Update React state
    if (setUser) {
      setUser(currentUser);
    }

    // Return to dashboard after club selection
    setActiveTab("Dashboard");
  };

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = () => {

    onLogout();

    navigate("/");
  };

  return (
    <aside
      className={`flex flex-col border-r transition-all ${expanded
        ? "w-60"
        : "w-16"
        }`}
      style={{
        background: "#0f0f13",
        borderColor: "#1e1e24",
      }}
    >

      {/* Logo */}
      <div className="p-4 flex items-center gap-3">

        <img
          src={logo}
          alt="ClubOps"
          className="w-12 h-12 rounded-lg object-contain"
        />

        {expanded && (
          <span className="font-bold text-white">
            ClubOps
          </span>
        )}

      </div>
<<<<<<< HEAD
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {tabs.filter((tab) => !tab.roles || tab.roles.includes(user.role)).map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              activeTab === tab.id ? 'bg-accent/10 text-accent' : 'text-muted hover:text-fg hover:bg-card'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
=======

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto">

        {tabList.map((tab) => {

          const isClubsTab =
            tab === "Clubs";

          return (
            <div
              key={tab}
              className="space-y-1"
            >

              {/* Main tab */}
              <button
                onClick={() => {

                  setActiveTab(tab);

                  if (isClubsTab) {
                    setClubsOpen(
                      !clubsOpen
                    );
                  }

                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${activeTab === tab
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                  }`}
                style={
                  activeTab === tab
                    ? {
                      background:
                        "rgba(79,70,229,0.15)",
                    }
                    : {}
                }
              >

                <div className="flex items-center gap-3 min-w-0">

                  <span>
                    {getIcon(tab)}
                  </span>

                  {expanded && (
                    <span className="truncate">
                      {tab}
                    </span>
                  )}

                </div>

                {isClubsTab &&
                  expanded && (
                    <span className="text-xs text-gray-500">
                      {clubsOpen
                        ? "▾"
                        : "▸"}
                    </span>
                  )}

              </button>

              {/* Clubs submenu */}
              {isClubsTab &&
                expanded &&
                clubsOpen && (

                  <div className="pl-6 space-y-1 my-1 border-l border-white/10 ml-4">

                    {clubsToShow.map(
                      (club) => {

                        const isActive =
                          String(
                            user?.activeClubId
                          ) ===
                          String(club.id);

                        const isJoined =
                          userJoinedIds.has(
                            String(club.id)
                          );

                        return (

                          <button
                            key={club.id}
                            onClick={() =>
                              handleSelectClub(
                                club
                              )
                            }
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition ${isActive
                              ? "text-indigo-400 font-semibold bg-indigo-500/15 border border-indigo-500/30"
                              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                              }`}
                          >

                            <div className="flex items-center gap-2 truncate">

                              <span>
                                {club.icon ||
                                  "🏛️"}
                              </span>

                              <span className="truncate">
                                {club.name}
                              </span>

                            </div>

                            {isActive ? (

                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded shrink-0">
                                Active
                              </span>

                            ) : isJoined ? (

                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded shrink-0">
                                Joined
                              </span>

                            ) : null}

                          </button>

                        );
                      }
                    )}

                  </div>

                )}

            </div>
          );
        })}

>>>>>>> dee661aee8efa31dbcab097b1cd8eb12a2cd9c42
      </nav>

      {/* Bottom section */}
      <div
        className="p-2 border-t"
        style={{
          borderColor: "#1e1e24",
        }}
      >

        {/* Collapse */}
        <button
          onClick={() =>
            setExpanded(!expanded)
          }
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white text-sm"
        >

          <span>
            {expanded ? "←" : "→"}
          </span>

          {expanded && (
            <span>
              Collapse
            </span>
          )}

        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 text-sm mt-1"
        >

          <span>🚪</span>

          {expanded && (
            <span>
              Logout
            </span>
          )}

        </button>

        {/* User */}
        {expanded && user && (

          <div className="px-3 py-2 mt-2">

            <p className="text-white text-sm font-medium">
              {user.name}
            </p>

            <p className="text-gray-500 text-xs">
              {user.role === "club-head"
                ? "Club Head"
                : "Volunteer"}
            </p>

          </div>

        )}

      </div>

    </aside>
  );
}

// -----------------------------------------
// Navigation icons
// -----------------------------------------
function getIcon(tab) {

  const icons = {

    Dashboard: "📊",

    "Documents & Risks": "📄",

    Tasks: "✅",

    Volunteers: "👥",

    Clubs: "🏛️",

    Meetings: "🗣️",

    Events: "📅",

    Announcements: "📢",

  };

  return icons[tab] || "•";
}