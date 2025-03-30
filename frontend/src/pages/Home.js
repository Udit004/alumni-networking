import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Home.css"; // Importing the updated CSS

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    AOS.init({ duration: 1000 });
    
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Monitor for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
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
      <section className="features-section bg-gray-50 dark:bg-gray-900">
        <h2 data-aos="fade-up" className="text-gray-900 dark:text-white text-3xl font-bold mb-6">Why Join Our Alumni Network?</h2>
        <div className="features-container">
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-right">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">🔍 Find Alumni</h4>
            <p className="text-gray-700 dark:text-white">Reconnect with old friends and make new professional connections.</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-up">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">💼 Job Board</h4>
            <p className="text-gray-700 dark:text-white">Discover job opportunities shared by alumni and recruiters.</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-left">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">📅 Alumni Events</h4>
            <p className="text-gray-700 dark:text-white">Stay updated on reunions, networking events, and mentorship programs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
