// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "../styles/Auth.css";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (email === "admin@example.com") {
//       navigate("/admin");
//     } else {
//       navigate("/user");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h2>Login</h2>
//         <form onSubmit={handleLogin}>
//           <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
//           <br>
//           </br>
//           <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
//           <br>
//           </br>
//           <button className="btn btn-primary">Login</button>
//           <div className="auth-links">
//             <Link to="/signup">Create an account</Link>
//             <Link to="/forgot-password">Forgot Password?</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@example.com") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card glass-effect">
        <h2>Welcome Back 👋</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary">Login</button>
          <div className="auth-links">
            <Link to="/signup">Create an account</Link>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

