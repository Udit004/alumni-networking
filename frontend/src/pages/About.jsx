// About.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./About.css";

const About = () => {
  const navigate = useNavigate();
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
    //This will observe the class attribute of the documentElement (html tag)
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <div className="about-hero-section text-center">
        <h1 data-aos="fade-up">WELCOME To Our Alumni Networking</h1>
        <p className="hero-subtitle" data-aos="fade-up">
          Your gateway to a connected future.
        </p>
      </div>

      {/* Mission Section */}
      <section className="mission-section bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0" data-aos="fade-right">
              <img 
                src="/assets/alumni.jpeg"
                alt="Alumni" 
                className="rounded-lg shadow-xl mx-auto max-w-md w-full"
              />
            </div>
            <div className="md:w-1/2 md:pl-12" data-aos="fade-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-700 dark:text-white text-lg mb-6">
                We aim to build a strong and engaged alumni network. Our platform connects students, teachers, and alumni, 
                fostering mentorship, career opportunities, and lifelong connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section bg-gray-50 dark:bg-gray-900">
        <h2 data-aos="fade-up" className="text-gray-900 dark:text-white text-3xl font-bold mb-6">What We Offer</h2>
        <div className="features-container">
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-right">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">Networking</h4>
            <p className="text-gray-700 dark:text-white">Connect with alumni and expand your professional opportunities.</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-up">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">Mentorship</h4>
            <p className="text-gray-700 dark:text-white">Find mentors and guidance for career growth and development.</p>
          </div>
          <div className="feature-card" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }} data-aos="fade-left">
            <h4 className="text-gray-900 dark:text-white text-xl font-semibold">Events</h4>
            <p className="text-gray-700 dark:text-white">Participate in exclusive alumni meetups, webinars, and networking events.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-16 bg-white" style={{ backgroundColor: isDarkMode ? '#111827' : 'white' }}>
        <div className="container mx-auto px-4">
          <h2 data-aos="fade-up" className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">What Our Alumni Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="testimonial-card" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }} data-aos="fade-up" data-aos-delay="100">
              <p className="text-gray-700 dark:text-white mb-4">"The alumni network helped me land my dream job through connections I made at networking events."</p>
              <div className="flex items-center">
                <div className="ml-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold">John Smith</h4>
                  <p className="text-gray-600 dark:text-gray-200">Class of 2018</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }} data-aos="fade-up" data-aos-delay="200">
              <p className="text-gray-700 dark:text-white mb-4">"The mentorship program was invaluable for my career development and professional growth."</p>
              <div className="flex items-center">
                <div className="ml-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-600 dark:text-gray-200">Class of 2019</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }} data-aos="fade-up" data-aos-delay="300">
              <p className="text-gray-700 dark:text-white mb-4">"Being part of this alumni network has opened doors I never knew existed. Highly recommend!"</p>
              <div className="flex items-center">
                <div className="ml-4">
                  <h4 className="text-gray-900 dark:text-white font-semibold">Michael Brown</h4>
                  <p className="text-gray-600 dark:text-gray-200">Class of 2020</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section py-16 bg-gray-50 dark:bg-gray-900 text-center">
        <div className="container mx-auto px-4">
          <h2 data-aos="fade-up" className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get in Touch</h2>
          <p data-aos="fade-up" className="text-gray-700 dark:text-white mb-8 max-w-2xl mx-auto">
            Contact us for more information about our network and how to get involved.
          </p>
          <button 
            onClick={() => navigate("/contact")} 
            className="btn btn-primary py-3 px-8 text-lg"
            data-aos="fade-up"
          >
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
