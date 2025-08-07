

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Auth.css";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";
import { GiBookshelf, GiPencil } from "react-icons/gi";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "user";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup Data:", formData);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="signup-container">
      <div className="overlay"></div>

      {/* Floating Animation Icons */}
      {/* <div className="animation-icons">
        <GiBookshelf className="floating-icon book-icon" />
        <GiPencil className="floating-icon pencil-icon" />
      </div> */}

      <div className="signup-card">
        <h2 className="signup-title">
          {role === "admin" ? <FaChalkboardTeacher /> : <FaUserGraduate />}{" "}
          {role === "admin" ? "Admin Signup" : "User Signup"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate(`/login?role=${role}`)}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
