import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Registration({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("club-head");
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      let registeredUser = null;
      let token = null;

      const res = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
      });
      
      if (res?.token) {
        token = res.token;
        localStorage.setItem("accessToken", res.token);
      }
      
      registeredUser = res?.user || {};

      let activeClub = null;
      if (token && (role === "club-head" || clubName.trim())) {
        try {
          const clubRes = await apiRequest("/clubs", {
            method: "POST",
            body: JSON.stringify({
              name: clubName.trim() || `${name.trim()}'s Club`,
              icon: "🏛️",
              description: `Official club space for ${clubName.trim() || name.trim()}`,
            }),
          });
          const createdClub = clubRes?.data || clubRes;
          if (createdClub?.id || createdClub?._id) {
            activeClub = {
              id: createdClub.id || createdClub._id,
              name: createdClub.name,
              icon: createdClub.icon || "🏛️",
            };
          }
        } catch (clubErr) {
          console.warn("Could not create initial club record:", clubErr.message);
        }
      }

      const newUser = {
        ...registeredUser,
        id: registeredUser.id || String(Date.now()),
        name: name.trim(),
        email: email.trim(),
        role,
        activeClubId: activeClub ? activeClub.id : null,
        activeClubName: activeClub ? activeClub.name : null,
        activeClubIcon: activeClub ? activeClub.icon : null,
        joinedClubs: activeClub ? [activeClub] : [],
      };

      localStorage.setItem("currentUser", JSON.stringify(newUser));
      if (onRegister) onRegister(newUser);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: "#141417" }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#fff" }}>Create Your Account</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Password (min 8 characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <div>
            <label className="text-sm mb-2 block" style={{ color: "#aaa" }}>I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setRole("club-head")} className={`py-3 rounded-lg font-medium border transition ${role === "club-head" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>Club Head</button>
              <button type="button" onClick={() => setRole("volunteer")} className={`py-3 rounded-lg font-medium border transition ${role === "volunteer" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>Volunteer</button>
            </div>
          </div>
          {role === "club-head" && (
            <input className="w-full px-4 py-3 rounded-lg text-white outline-none focus:border-indigo-500" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Your Club Name (optional)" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          )}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-bold text-white transition hover:bg-indigo-600 disabled:opacity-50" style={{ background: "#4f46e5" }}>{loading ? "Registering..." : "Register"}</button>
        </form>
        <p className="text-center mt-4 text-sm" style={{ color: "#888" }}>Already have an account? <Link to="/login" className="text-indigo-400 font-semibold">Login</Link></p>
      </div>
    </div>
  );
}
