import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("Student");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ SINGLE HANDLER (same as working login page)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isSignup) {
        // LOGIN
        const res = await login(email, password);
        const user = res.user;

        navigate(user.role === "Admin" ? "/admin" : "/user");

      } else {
        // SIGNUP
        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        const res = await register(name, email, password, role);
        const user = res.user;

        navigate(user.role === "Admin" ? "/admin" : "/user");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className={`auth-wrapper ${isSignup ? "active" : ""}`}>

          {/* LEFT PANEL */}
          <div className="left-panel">
            <h1>{isSignup ? "Welcome Back!" : "Hello, Friend!"}</h1>
            <p>
              {isSignup
                ? "Already have an account? Sign in here"
                : "New here? Create your account"}
            </p>

            <button
              className="ghost-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">
            <div className="form-container">

              {/* Logo */}
              <div className="logo">
                <div className="logo-icon">▶</div>
                <div>
                  <h3>AI Powered</h3>
                  <p>MULTILINGUAL PLATFORM</p>
                </div>
              </div>

              <h2>{isSignup ? "Create account" : "Welcome back"}</h2>

              {/* Toggle */}
              <div className="toggle">
                <button
                  className={!isSignup ? "active" : ""}
                  onClick={() => setIsSignup(false)}
                >
                  Sign in
                </button>
                <button
                  className={isSignup ? "active" : ""}
                  onClick={() => setIsSignup(true)}
                >
                  Sign up
                </button>
              </div>

              {/* Roles */}
              <div className="roles">
                {["Student", "Teacher"].map((r) => (
                  <div
                    key={r}
                    className={`role ${role === r ? "active" : ""}`}
                    onClick={() => setRole(r)}
                  >
                    {r === "Student" && "🎓"}
                    {r === "Teacher" && "🖥️"}
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="form">

                {isSignup && (
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                )}

                <input
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {isSignup && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                )}

                <button className="main-btn" type="submit" disabled={loading}>
                  {loading
                    ? "Processing..."
                    : isSignup
                    ? `Sign up as ${role}`
                    : `Sign in as ${role}`}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
