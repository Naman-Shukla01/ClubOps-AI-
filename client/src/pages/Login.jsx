import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }
    try {
      let loggedUser = null;

      // Check registered users in all_users
      const allUsers = JSON.parse(localStorage.getItem("all_users") || "[]");
      const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.password && found.password !== password) {
          setError("Incorrect password.");
          return;
        }
        loggedUser = found;
      } else {
        // Fallback for demo login
        loggedUser = {
          name: email.split('@')[0] || "User",
          email,
          role: "club-head",
          activeClubId: "1",
          activeClubName: "Tech Innovators Club",
          activeClubIcon: "💻",
          joinedClubs: [
            { id: "1", name: "Tech Innovators Club", icon: "💻" },
            { id: "2", name: "Cultural Vibes", icon: "🎭" }
          ]
        };
      }

      localStorage.setItem("currentUser", JSON.stringify(loggedUser));
      if (onLogin) onLogin(loggedUser);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: "#141417" }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "#fff" }}>Welcome Back</h2>
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full px-4 py-3 rounded-lg text-white" style={{ background: "#1e1e24", border: "1px solid #2a2a32" }} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full py-3 rounded-lg font-bold text-white" style={{ background: "#4f46e5" }}>Login</button>
        </form>
        <p className="text-center mt-4 text-sm" style={{ color: "#888" }}>Don't have an account? <Link to="/register" className="text-indigo-400 font-semibold cursor-pointer">Register</Link></p>
      </div>
    </div>
  );
}
