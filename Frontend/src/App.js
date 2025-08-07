// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import AdminDashboard from "./pages/AdminDashboard";
// import UserDashboard from "./pages/UserDashboard";
// import ForgotPassword from "./pages/ForgotPassword";
// import MyUploads from "./pages/MyUploads";

// import "bootstrap/dist/css/bootstrap.min.css";
// import "./styles/App.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

// function App() {
//   return (
//     <Router>
//       <div className="app-container">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/admin" element={<AdminDashboard />} />
//           <Route path="/user" element={<UserDashboard />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/admin/my-uploads" element={<MyUploads />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

// changes madhu

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import MyUploads from "./pages/MyUploads";

//  NEW IMPORT for video detail page
import VideoDetails from "./pages/VideoDetails";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/my-uploads" element={<MyUploads />} />

          {/*  NEW ROUTE added for video detail view */}
          <Route path="/videos/:id" element={<VideoDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
