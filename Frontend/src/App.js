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
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import MyUploads from "./pages/MyUploads";
import VideoDetails from "./pages/VideoDetails";
import { AuthProvider } from "./context/AuthContext";

// NEW IMPORT for Sarthi Chatbot
import GitaBot from "./pages/GitaBot";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          {/* <Route path="/" element={<Signup />} /> */}
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/signup" element={<Signup />} /> */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/my-uploads" element={<MyUploads />} />

          {/*  NEW ROUTE added for video detail view */}
          <Route path="/videos/:id" element={<VideoDetails />} />
          
          {/* Sarthi Chatbot Route */}
          <Route path="/geeta-bot" element={<GitaBot />} />
        </Routes>
      </div>
    </Router>
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

function AppShell() {
  const location = useLocation();
  const fullBleedPage =
    location.pathname === "/saarthi-ai" ||
    location.pathname === "/geeta-bot" ||
    location.pathname.startsWith("/videos/");

  return (
    <div className={`app-container ${fullBleedPage ? "app-container--full" : ""}`}>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/my-uploads" element={<MyUploads />} />

        {/*  NEW ROUTE added for video detail view */}
        <Route path="/videos/:id" element={<VideoDetails />} />

        {/* Saarthi AI / chatbot routes */}
        <Route path="/saarthi-ai" element={<GitaBot />} />
        <Route path="/geeta-bot" element={<GitaBot />} />
      </Routes>
    </div>
  );
}

export default App;
