import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Home.css"; // Importing the updated CSS

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 🌟 Hero Section */}
      <div className="hero-section text-center">
        <h1 data-aos="fade-up">Welcome to Alumni Networking</h1>
        <p className="hero-subtitle" data-aos="fade-up">
          Connecting Students, Alumni, and Teachers for a better future.
        </p>
        <p data-aos="fade-up" className="mt-2">Stay Connected, Stay Inspired</p>
        <h2 className="mt-4">Join Our Alumni Network!</h2>
      </div>

      {/* 🚀 Role Selection */}
      <section className="join-option">
        <Link to="/signup?role=student" className="join-btn student">
          👨‍🎓 Student
        </Link>
        <Link to="/signup?role=alumni" className="join-btn alumni">
          🎓 Alumni
        </Link>
        <Link to="/signup?role=teacher" className="join-btn teacher">
          👩‍🏫 Teacher
        </Link>
      </section>

      {/* 📌 Features Section */}
      <section className="features-section">
        <h2 data-aos="fade-up">Why Join Our Alumni Network?</h2>
        <div className="features-container">
          <div className="feature-card" data-aos="fade-right">
            <h4>🔍 Find Alumni</h4>
            <p>Reconnect with old friends and make new professional connections.</p>
          </div>
          <div className="feature-card" data-aos="fade-up">
            <h4>💼 Job Board</h4>
            <p>Discover job opportunities shared by alumni and recruiters.</p>
          </div>
          <div className="feature-card" data-aos="fade-left">
            <h4>📅 Alumni Events</h4>
            <p>Stay updated on reunions, networking events, and mentorship programs.</p>
          </div>
        </div>
      </section>

      {/* 🌍 Footer */}
      <footer className="footer">
        <p>&copy; 2025 Alumni Network. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
