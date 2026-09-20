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
      try {
        const res = await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }),
        });
        if (res?.token && res?.user) {
          localStorage.setItem("accessToken", res.token);
          registeredUser = res.user;
        }
      } catch (backendErr) {
        console.warn("Backend register error, using client fallback:", backendErr.message);
      }

      const activeClub = {
        id: "1",
        name: clubName.trim() || "Tech Innovators Club",
        icon: "💻",
      };

      const newUser = {
        ...(registeredUser || {}),
        id: registeredUser?.id || String(Date.now()),
        name: name.trim(),
        email: email.trim(),
        role,
        activeClubId: activeClub.id,
        activeClubName: activeClub.name,
        activeClubIcon: activeClub.icon,
        joinedClubs: [activeClub],
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
