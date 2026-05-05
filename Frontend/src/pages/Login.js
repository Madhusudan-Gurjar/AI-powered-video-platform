import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

const roles = [
  { key: "Student", icon: "🎓" },
  { key: "Teacher", icon: "🖥️" },
  { key: "Admin",   icon: "⭐" },
];

const Login = () => {
  const [activeTab, setActiveTab] = useState("signin"); // "signin" | "signup"
  const [selectedRole, setSelectedRole] = useState("Student");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (activeTab === "signin") {
        await login(email, password);
      } else {
        await register(name, email, password, selectedRole);
      }
      navigate(selectedRole === "Admin" ? "/admin" : "/user");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="vl-login-page">
      <div className="vl-login-card">

        {/* ── Logo ── */}
        <div className="vl-login-logo">
          <span className="vl-login-logo-icon">▶</span>
          <div>
            <p className="vl-login-logo-name">VidLearn</p>
            <p className="vl-login-logo-sub">MULTILINGUAL PLATFORM</p>
          </div>
        </div>

        {/* ── AssemblyAI badge ── */}
        <div className="vl-powered-badge">
          <span className="vl-powered-dot" />
          Powered by AssemblyAI
        </div>

        {/* ── Heading ── */}
        <h1 className="vl-login-heading">Welcome back</h1>
        <p className="vl-login-sub">Sign in to continue learning</p>

        {/* ── Sign in / Sign up tabs ── */}
        <div className="vl-auth-tabs">
          <button
            className={`vl-auth-tab ${activeTab === "signin" ? "active" : ""}`}
            onClick={() => setActiveTab("signin")}
          >
            Sign in
          </button>
          <button
            className={`vl-auth-tab ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign up
          </button>
        </div>

        {/* ── Role selector ── */}
        <div className="vl-role-grid">
          {roles.map(({ key, icon }) => (
            <button
              key={key}
              className={`vl-role-card ${selectedRole === key ? "selected" : ""}`}
              onClick={() => setSelectedRole(key)}
              type="button"
            >
              <span className="vl-role-icon">{icon}</span>
              <span className="vl-role-label">{key}</span>
            </button>
          ))}
        </div>

        {/* ── Error message ── */}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="vl-login-form">
          {activeTab === "signup" && (
            <>
              <label className="vl-field-label">Full name</label>
              <input
                className="vl-field"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          <label className="vl-field-label">Email address</label>
          <input
            className="vl-field"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="vl-field-label">Password</label>
          <input
            className="vl-field"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="vl-submit-btn" type="submit" disabled={loading}>
            {loading ? "Processing..." : activeTab === "signin" ? `Sign in as ${selectedRole}` : `Create ${selectedRole} account`}
          </button>
        </form>

        {activeTab === "signin" ? (
          <p className="vl-login-footer">
            No account?{" "}
            <button className="vl-link-btn" onClick={() => setActiveTab("signup")}>
              Create one
            </button>
          </p>
        ) : (
          <p className="vl-login-footer">
            Already have an account?{" "}
            <button className="vl-link-btn" onClick={() => setActiveTab("signin")}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
