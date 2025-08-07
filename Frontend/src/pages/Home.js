// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Home.css";
// import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa";

// const Home = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="home-container">
//       <div className="overlay"></div>
//       <div className="home-content">
//         <h1 className="animated-title">Welcome to Video Platform</h1>
//         <p className="animated-subtitle">Learn and Teach with Ease</p>
//         <div className="login-options">
//           <div className="login-card" onClick={() => navigate("/signup?role=user")}> 
//             <FaUserGraduate className="login-icon" />
//             <h3>User Signup</h3>
//           </div>
//           <div className="login-card" onClick={() => navigate("/signup?role=admin")}> 
//             <FaChalkboardTeacher className="login-icon" />
//             <h3>Admin Signup</h3>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { FaUserGraduate, FaChalkboardTeacher, FaSignInAlt } from "react-icons/fa";
import { GiBookshelf, GiPencil } from "react-icons/gi";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="overlay"></div>
      <div className="home-content" >
        <h1 className="animated-title">Welcome to Video Platform</h1>
        <p className="animated-subtitle">Learn and Teach with Ease</p>
        <div className="animation-icons">
          <GiBookshelf className="floating-icon book-icon" />
          <GiPencil className="floating-icon pencil-icon" />
        </div>
        <div className="login-options">
          <div className="login-card" onClick={() => navigate("/signup?role=user")}> 
            <FaUserGraduate className="login-icon" />
            <h3>Student Signup</h3>
          </div>
          <div className="login-card" onClick={() => navigate("/signup?role=admin")}> 
            <FaChalkboardTeacher className="login-icon" />
            <h3>Teacher Signup</h3>
          </div>
          <div className="login-card" onClick={() => navigate("/login?role=user")}> 
            <FaSignInAlt className="login-icon" />
            <h3>User Login</h3>
          </div>
          <div className="login-card" onClick={() => navigate("/login?role=admin")}> 
            <FaSignInAlt className="login-icon" />
            <h3>Admin Login</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


