import React from "react";
import { Link } from "react-router-dom";
import './Home.css';
import { useEffect } from "react";  // ✅ Import useEffect
import AOS from "aos";
import "aos/dist/aos.css";


const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });  // ✅ Place useEffect inside the function
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <div className="hero-section text-center p-8">
        <h1 data-aos="fade-up">Welcome to Alumni Networking</h1>
        <p className="mt-2 text-lg text-gray-600">
          Connecting Students, Alumni, and Teachers for a better future.
        </p>
        <p data-aos="fade-up">Stay Connected, Stay Inspired</p>
        <br />
        <h2>Join Our Alumni Network!</h2>
        
      </div>

      <section className="join-option container my-5">
        {/* Role Selection */}
        <div className="flex space-x-6 mt-6">
          <Link to="/signup?role=student" className="p-4 bg-blue-500 rounded-lg shadow-lg hover:bg-blue-700 transition">
            👨‍🎓 Student
          </Link>
          <Link to="/signup?role=alumni" className="p-4 bg-green-500 rounded-lg shadow-lg hover:bg-green-700 transition">
            🎓 Alumni
          </Link>
          <Link to="/signup?role=teacher" className="p-4 bg-purple-500 rounded-lg shadow-lg hover:bg-purple-700 transition">
            👩‍🏫 Teacher
          </Link>
        </div>
      </section>
      

      {/* Features Section */}
      <section className="features-section container my-5">
        <h2 data-aos="fade-up">Why Join Our Alumni Network?</h2>
        <div className="row">
          <div className="col-md-4">
            <h4>🔍 Find Alumni</h4>
            <p>Reconnect with old friends and make new professional connections.</p>
          </div>
          <div className="col-md-4">
            <h4>💼 Job Board</h4>
            <p>Discover job opportunities shared by alumni and recruiters.</p>
          </div>
          <div className="col-md-4">
            <h4>📅 Alumni Events</h4>
            <p>Stay updated on reunions, networking events, and mentorship programs.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-white text-center p-3">
        <p>&copy; 2025 Alumni Network. All Rights Reserved.</p>
      </footer>

    </div>
  );
};

export default Home;
