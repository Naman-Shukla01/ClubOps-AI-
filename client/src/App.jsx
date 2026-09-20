import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem("accessToken");

    setUser(null);

    setActiveTab(
      "Dashboard"
    );
  };

  // -----------------------------------------
  // Global API Auth Error Handler
  // -----------------------------------------
  useEffect(() => {
    const onAuthRequired = () => {
      handleLogout();
    };
    window.addEventListener('clubops:auth-required', onAuthRequired);
    return () => {
      window.removeEventListener('clubops:auth-required', onAuthRequired);
    };
  }, []);

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
          <DocumentsAndRisksView
            user={user}
          />
        );

      case "Meetings":
        return (
          <MeetingsView
            user={user}
          />
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

  return (
    <Router>

      <Routes>

        {/* Registration */}
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Registration
                onRegister={(newUser) => {
                  setUser(newUser);
                  localStorage.setItem(
                    "currentUser",
                    JSON.stringify(newUser)
                  );
                }}
              />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Login
                onLogin={(loggedUser) => {
                  setUser(loggedUser);
                  localStorage.setItem(
                    "currentUser",
                    JSON.stringify(loggedUser)
                  );
                }}
              />
            )
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
                className="flex h-screen"
                style={{
                  background: "#0a0a0f",
                }}
              >

                {/* Sidebar */}
                <Sidebar
                  user={user}
                  setUser={setUser}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onLogout={handleLogout}
                />

                {/* Main area */}
                <div className="flex-1 flex flex-col overflow-hidden">

                  {/* Header */}
                  <Header
                    user={user}
                    setUser={setUser}
                    onProfileClick={() =>
                      setProfileOpen(true)
                    }
                  />

                  {/* Content */}
                  <main
                    className="flex-1 overflow-auto p-6"
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