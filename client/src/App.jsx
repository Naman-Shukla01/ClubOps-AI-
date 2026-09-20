import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Registration from "./pages/Registration";

import Sidebar from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import ProfileModal from "./components/layout/ProfileModal";

import { DashboardView } from "./views/DashboardView";
import { DocumentsAndRisksView } from "./views/DocumentsAndRisksView";
import { TasksView } from "./views/TasksView";
import { VolunteersView } from "./views/VolunteersView";
import { MeetingsView } from "./views/MeetingsView";
import { EventsView } from "./views/EventsView";
import { AnnouncementsView } from "./views/AnnouncementsView";
import { ClubsView } from "./views/ClubsView";
import { clubService } from "./services/clubService";

export default function App() {

  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState(
    "Dashboard"
  );

  const [profileOpen, setProfileOpen] = useState(false);

  // -----------------------------------------
  // Load current user
  // -----------------------------------------
  useEffect(() => {

    const storedUser =
      localStorage.getItem("currentUser");

    if (storedUser) {

      try {

        const parsedUser =
          JSON.parse(storedUser);

        setUser(parsedUser);

      } catch (error) {

        console.error(
          "Invalid currentUser:",
          error
        );

        localStorage.removeItem(
          "currentUser"
        );

        setUser(null);
      }
    }

    const handleAuthRequired = () => {
      setUser(null);
    };
    window.addEventListener('clubops:auth-required', handleAuthRequired);

    return () => {
      window.removeEventListener('clubops:auth-required', handleAuthRequired);
    };
  }, []);

  // Sync real backend club membership into user state
  useEffect(() => {
    if (!user?.id || !localStorage.getItem("accessToken")) return;
    let mounted = true;

    clubService.getClubs().then((res) => {
      if (!mounted) return;
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      const memberClubsList = list
        .filter((c) => c.isMember || (Array.isArray(c.memberIds) && c.memberIds.map(String).includes(String(user.id))))
        .map((c) => ({ id: c.id, name: c.name, icon: c.icon || "🏛️" }));

      setUser((prev) => {
        if (!prev) return prev;
        if (memberClubsList.length === 0) {
          const updated = { ...prev, joinedClubs: [], activeClubId: null, activeClubName: "", activeClubIcon: "" };
          localStorage.setItem("currentUser", JSON.stringify(updated));
          return updated;
        }
          const activeClubId = prev.activeClubId && memberClubsList.some((mc) => String(mc.id) === String(prev.activeClubId))
            ? prev.activeClubId
            : memberClubsList[0].id;
          const activeObj = memberClubsList.find((mc) => String(mc.id) === String(activeClubId)) || memberClubsList[0];
          const updated = {
            ...prev,
            joinedClubs: memberClubsList,
            activeClubId: activeObj.id,
            activeClubName: activeObj.name,
            activeClubIcon: activeObj.icon,
          };
          localStorage.setItem("currentUser", JSON.stringify(updated));
          return updated;
      });
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");

    setUser(null);

    setActiveTab(
      "Dashboard"
    );
  };

  // -----------------------------------------
  // Render active page
  // -----------------------------------------
  const renderView = () => {

    switch (activeTab) {

      case "Dashboard":
        return (
          <DashboardView
            user={user}
            setActiveTab={setActiveTab}
          />
        );

      case "Clubs":
        return (
          <ClubsView
            user={user}
            setUser={setUser}
            setActiveTab={setActiveTab}
          />
        );

      case "Events":
        return (
          <EventsView
            user={user}
            setUser={setUser}
          />
        );

      case "Tasks":
        return (
          <TasksView
            user={user}
            setUser={setUser}
          />
        );

      case "Announcements":
        return (
          <AnnouncementsView
            user={user}
            setUser={setUser}
          />
        );

      case "Volunteers":
        return (
          <VolunteersView
            user={user}
          />
        );

      case "Documents & Risks":
        return (
          <DocumentsAndRisksView />
        );

      case "Meetings":
        return (
          <MeetingsView user={user} />
        );

      default:
        return (
          <DashboardView
            user={user}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-close mobile drawer on tab select
  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <Router>

      <Routes>

        {/* Registration */}
        <Route
          path="/register"
          element={
            <Registration
              onRegister={(newUser) => {

                setUser(newUser);

                localStorage.setItem(
                  "currentUser",
                  JSON.stringify(newUser)
                );

              }}
            />
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={(loggedUser) => {

                setUser(loggedUser);

                localStorage.setItem(
                  "currentUser",
                  JSON.stringify(loggedUser)
                );

              }}
            />
          }
        />

        {/* Main application */}
        <Route
          path="*"
          element={

            !user ? (

              <Login
                onLogin={(loggedUser) => {

                  setUser(loggedUser);

                  localStorage.setItem(
                    "currentUser",
                    JSON.stringify(loggedUser)
                  );

                }}
              />

            ) : (

              <div
                className="flex h-screen min-w-0 relative overflow-hidden"
                style={{
                  background: "#0a0a0f",
                }}
              >

                {/* Sidebar Mobile Overlay Backdrop */}
                {mobileSidebarOpen && (
                  <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                )}

                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                  <Sidebar
                    user={user}
                    setUser={setUser}
                    activeTab={activeTab}
                    setActiveTab={handleSelectTab}
                    onLogout={handleLogout}
                  />
                </div>

                {/* Main area */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden w-full">

                  {/* Header */}
                  <Header
                    user={user}
                    setUser={setUser}
                    onProfileClick={() =>
                      setProfileOpen(true)
                    }
                    onToggleSidebar={() =>
                      setMobileSidebarOpen(!mobileSidebarOpen)
                    }
                  />

                  {/* Content */}
                  <main
                    className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6"
                    style={{
                      color: "#e5e5e5",
                    }}
                  >
                    {renderView()}
                  </main>

                </div>

                {/* Profile */}
                {profileOpen && (
                  <ProfileModal
                    user={user}
                    onClose={() =>
                      setProfileOpen(false)
                    }
                  />
                )}

              </div>
            )
          }
        />

      </Routes>

    </Router>
  );
}
