import { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    alert("Password reset link sent to: " + email);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 w-25">
        <h2 className="text-center">Forgot Password</h2>
        <form onSubmit={handleReset}>
          <div className="mb-3">
            <input type="email" className="form-control" placeholder="Enter your email" required onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-warning w-100">Reset Password</button>
          <div className="text-center mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
