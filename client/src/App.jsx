import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Clear saved session on fresh launch so the first page is always Login
    localStorage.removeItem("currentUser");
    setUser(null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setActiveTab("Dashboard");
  };

  const renderView = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardView user={user} setActiveTab={setActiveTab} />;
      case "Clubs": return <ClubsView user={user} setUser={setUser} setActiveTab={setActiveTab} />;
      case "Events": return <EventsView user={user} setUser={setUser} />;
      case "Tasks": return <TasksView user={user} setUser={setUser} />;
      case "Announcements": return <AnnouncementsView user={user} setUser={setUser} />;
      case "Volunteers": return <VolunteersView user={user} />;
      case "Documents & Risks": return <DocumentsAndRisksView />;
      case "Meetings": return <MeetingsView />;
      default: return <DashboardView user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Registration onRegister={(u) => { setUser(u); localStorage.setItem("currentUser", JSON.stringify(u)); }} />} />
        <Route path="/login" element={<Login onLogin={(u) => { setUser(u); localStorage.setItem("currentUser", JSON.stringify(u)); }} />} />
        <Route
          path="*"
          element={
            !user ? (
              <Login onLogin={(u) => { setUser(u); localStorage.setItem("currentUser", JSON.stringify(u)); }} />
            ) : (
              <div className="flex h-screen" style={{ background: "#0a0a0f" }}>
                <Sidebar user={user} setUser={setUser} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header user={user} setUser={setUser} onProfileClick={() => setProfileOpen(true)} />
                  <main className="flex-1 overflow-auto p-6" style={{ color: "#e5e5e5" }}>
                    {renderView()}
                  </main>
                </div>
                {profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} />}
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}
