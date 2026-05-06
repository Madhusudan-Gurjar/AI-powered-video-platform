import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import "../styles/Auth.css";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, loading } = useContext(AuthContext);

  const [isSignup, setIsSignup] = useState(location.pathname === "/signup");
  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = isSignup
        ? await handleRegister()
        : await login(email, password);

      const userRole = res.user?.role;
      navigate(userRole === "Teacher" ? "/admin" : "/user");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    return register(name, email, password, role);
  };

  const switchAuthMode = () => {
    setIsSignup((currentMode) => !currentMode);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
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
            type="button"
            className="ghost-btn"
            onClick={switchAuthMode}
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
                <p>MULTILINGUAL VIDEO PLATFORM</p>
              </div>
            </div>

            {/* <div className="badge">● Powered by AssemblyAI</div> */}

            <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
            <p className="subtitle">
              {isSignup
                ? "Join and start learning"
                : "Sign in to continue learning"}
            </p>

            {isSignup && (
              <>
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
              </>
            )}

            <form className="form" onSubmit={handleSubmit}>
              {isSignup && (
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {isSignup && (
                <div className="password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              <button className="main-btn" type="submit" disabled={loading}>
                {loading ? "Processing..." : isSignup ? `Sign up as ${role}` : "Sign in"}
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
