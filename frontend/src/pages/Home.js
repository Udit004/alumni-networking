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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-circle bg-blue-500/10 dark:bg-blue-500/5 w-64 h-64 rounded-full absolute -top-20 -left-20 animate-float-slow"></div>
        <div className="floating-circle bg-purple-500/10 dark:bg-purple-500/5 w-96 h-96 rounded-full absolute top-1/4 -right-48 animate-float-medium"></div>
        <div className="floating-circle bg-indigo-500/10 dark:bg-indigo-500/5 w-80 h-80 rounded-full absolute bottom-1/4 -left-40 animate-float-fast"></div>
        <div className="floating-circle bg-pink-500/10 dark:bg-pink-500/5 w-72 h-72 rounded-full absolute -bottom-20 right-20 animate-float-slow"></div>
      </div>

      {/* 🌟 Hero Section */}
      <div className="hero-section text-center relative z-10 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 py-20 px-4 rounded-b-3xl shadow-lg">
        <h1 
          data-aos="fade-up" 
          className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300"
        >
          Welcome to Alumni Networking
        </h1>
        <p 
          className="hero-subtitle text-xl md:text-2xl mt-6 text-gray-700 dark:text-gray-300" 
          data-aos="fade-up" 
          data-aos-delay="100"
        >
          Connecting Students, Alumni, and Teachers for a better future.
        </p>
        <p 
          data-aos="fade-up" 
          data-aos-delay="200" 
          className="mt-4 text-lg italic text-gray-600 dark:text-gray-400"
        >
          Stay Connected, Stay Inspired
        </p>
        <h2 
          className="mt-8 text-2xl md:text-3xl font-semibold text-indigo-700 dark:text-indigo-400"
          data-aos="fade-up" 
          data-aos-delay="300"
        >
          Join Our Alumni Network!
        </h2>
      </div>

      {/* 🚀 Role Selection */}
      <section className="join-option py-12 px-4 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 relative z-10">
        <Link 
          to="/signup?role=student" 
          className="join-btn student bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-800 text-white font-medium py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          👨‍🎓 Student
        </Link>
        <Link 
          to="/signup?role=alumni" 
          className="join-btn alumni bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-800 text-white font-medium py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          🎓 Alumni
        </Link>
        <Link 
          to="/signup?role=teacher" 
          className="join-btn teacher bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 text-white font-medium py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-subtle"
          data-aos="zoom-in"
          data-aos-delay="300"
        >
          👩‍🏫 Teacher
        </Link>
      </section>

      {/* 📌 Features Section */}
      <section className="features-section relative z-10 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 py-16 px-4 rounded-t-3xl mt-8 shadow-inner">
        <h2 
          data-aos="fade-up" 
          className="text-center text-gray-900 dark:text-white text-3xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
        >
          Why Join Our Alumni Network?
        </h2>
        <div className="features-container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className="feature-card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-900/30 hover:transform hover:scale-105" 
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-2xl animate-bounce-slow">
              🔍
            </div>
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold mb-3">Find Alumni</h4>
            <p className="text-gray-700 dark:text-gray-300">Reconnect with old friends and make new professional connections.</p>
          </div>
          
          <div 
            className="feature-card bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 dark:border-purple-900/30 hover:transform hover:scale-105" 
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-2xl animate-bounce-slow animation-delay-300">
              💼
            </div>
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold mb-3">Job Board</h4>
            <p className="text-gray-700 dark:text-gray-300">Discover job opportunities shared by alumni and recruiters.</p>
          </div>
          
          <div 
            className="feature-card bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100 dark:border-indigo-900/30 hover:transform hover:scale-105" 
            data-aos="fade-left"
            data-aos-delay="300"
          >
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-2xl animate-bounce-slow animation-delay-600">
              📅
            </div>
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold mb-3">Alumni Events</h4>
            <p className="text-gray-700 dark:text-gray-300">Stay updated on reunions, networking events, and mentorship programs.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;