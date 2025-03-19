import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import './App.css';
import './global.css';
import Home from "./pages/Home";
import Login from "./pages/Login";  
import Signup from "./pages/Signup";  
import Navbar from "./components/Navbar"; 
import Contact from "./pages/Contact";
import StudentDashboard from "./pages/StudentDashboard";
import About from "./pages/About";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import TeacherDashboard from "./pages/TeacherDashboard";
import AlumniDashboard from "./pages/AlumniDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from"./pages/Profile";

// import { useAuth } from "./AuthContext";


function App() {
  // const { role } = useAuth();
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/create-event" element={<CreateEvent />} /> {/* ✅ New route */}
        {/* Protect Dashboard Routes */}
        <Route path="/student-dashboard" element={
          <ProtectedRoute element={<StudentDashboard />} allowedRoles={["student"]} />
        } />
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute element={<TeacherDashboard />} allowedRoles={["teacher"]} />
        } />
        <Route path="/alumni-dashboard" element={
          <ProtectedRoute element={<AlumniDashboard />} allowedRoles={["alumni"]} />
        } />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} allowedRoles={["student", "teacher", "alumni"]} />} />



        {/* Default Route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
