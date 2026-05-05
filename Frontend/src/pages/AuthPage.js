import { useState } from "react";
import "../styles/Auth.css";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("Student");

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

            {/* <div className="badge">● Powered by AssemblyAI</div> */}

            <h2>{isSignup ? "Create account" : "Welcome back"}</h2>
            <p className="subtitle">
              {isSignup
                ? "Join and start learning"
                : "Sign in to continue learning"}
            </p>

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
            {!isSignup ? (
              <div className="form">
                <input placeholder="Email address" />
                <input type="password" placeholder="Password" />

                <button className="main-btn">
                  Sign in as {role}
                </button>
              </div>
            ) : (
              <div className="form">
                {/* <input placeholder="Username" /> */}
                <input placeholder="Full Name" />
                <input placeholder="Email address" />
                <input type="password" placeholder="Password" />
                <input type="password" placeholder="Confirm Password" />

                <button className="main-btn">
                  Sign up as {role}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};

export default AuthPage;