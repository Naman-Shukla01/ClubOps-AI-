import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Registration({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("volunteer");
  const [clubName, setClubName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !role) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      const existingClubs = JSON.parse(localStorage.getItem("created_clubs") || "[]");
      const trimmedClub = clubName.trim();
      let targetClub = null;

      if (trimmedClub) {
        const found = existingClubs.find(c => c.name.toLowerCase() === trimmedClub.toLowerCase());
        if (found) {
          targetClub = found;
        } else {
          // Auto create missing club with default details
          targetClub = {
            id: String(Date.now()),
            name: trimmedClub,
            icon: "🏛️",
            color: "#7c5cfc",
            category: "General",
            head: { name: name.trim(), email: email.trim() },
            members: 1,
            maxMembers: 50,
            events: 0,
            description: "Newly created club. Click Edit/Manage in Clubs view to update details.",
            skills: ["Leadership", "Management"],
            budget: "$0",
            riskLevel: "Low",
            location: "TBD",
            founded: new Date().getFullYear().toString()
          };
          const updatedClubs = [targetClub, ...existingClubs];
          localStorage.setItem("created_clubs", JSON.stringify(updatedClubs));
        }
      } else {
        targetClub = {
          id: "1",
          name: "Tech Innovators Club",
          icon: "💻"
        };
      }

      const initialClubObj = {
        id: targetClub.id,
        name: targetClub.name,
        icon: targetClub.icon || "🏛️"
      };

      const newUser = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        activeClubId: initialClubObj.id,
        activeClubName: initialClubObj.name,
        activeClubIcon: initialClubObj.icon,
        joinedClubs: [initialClubObj]
      };

      // Save user to local user store
      const existingUsers = JSON.parse(localStorage.getItem("all_users") || "[]");
      const updatedUsers = [...existingUsers.filter(u => u.email !== email), newUser];
      localStorage.setItem("all_users", JSON.stringify(updatedUsers));

      localStorage.setItem("currentUser", JSON.stringify(newUser));
      if (onRegister) onRegister(newUser);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: "#141417" }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#fff" }}>Create Your Account</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div>
            <label className="text-sm mb-2 block" style={{ color: "#aaa" }}>I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole("club-head")} className={`py-3 rounded-lg font-medium border transition ${role === "club-head" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>Club Head</button>
              <button type="button" onClick={() => setRole("volunteer")} className={`py-3 rounded-lg font-medium border transition ${role === "volunteer" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>Volunteer</button>
            </div>
          </div>
          {role === "club-head" && (
            <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Your Club Name (optional)" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          )}
          <button type="submit" className="w-full py-3 rounded-lg font-bold text-white" style={{ background: "#4f46e5" }}>Register</button>
        </form>
        <p className="text-center mt-4 text-sm" style={{ color: "#888" }}>Already have an account? <Link to="/login" className="text-indigo-400 font-semibold cursor-pointer">Login</Link></p>
      </div>
    </div>
  );
}
