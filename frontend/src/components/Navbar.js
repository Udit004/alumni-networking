import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getConnectionRequests } from "../services/connectionService";
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [pendingRequests, setPendingRequests] = useState(0);
  const { currentUser, role, userData, logout } = useAuth();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Initialize dark mode state based on class or system preference
  useEffect(() => {
    // Check if dark mode is already enabled
    const darkModeEnabled = document.documentElement.classList.contains('dark');
    setIsDarkMode(darkModeEnabled);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'disabled');
    }
  };

  // Get user's name from Firestore data
  const getUserDisplayName = () => {
    if (userData?.name) {
      return userData.name;
    }
    return 'User';
  };

  // Fetch pending connection requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (currentUser) {
        try {
          const requests = await getConnectionRequests(currentUser.uid);
          setPendingRequests(requests.incoming.length);
        } catch (error) {
          console.error('Error fetching pending requests:', error);
        }
      }
    };

    fetchPendingRequests();
    // Set up an interval to check for new requests every minute
    const interval = setInterval(fetchPendingRequests, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close mobile menu and dropdown after navigating
  const handleNavClick = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center no-underline">
              <img
                src="/assets/alumniLogo.png"
                alt="Logo"
                className="h-10 w-10 md:h-12 md:w-12 mr-2 md:mr-3"
              />
              <span className="text-xl md:text-2xl font-bold text-primary dark:text-white">
                <span className="hidden sm:inline">ALUMNI NETWORKING</span>
                <span className="sm:hidden">ALUMNI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "text-primary dark:text-primary nav-link active"
                  : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive
                  ? "text-primary dark:text-primary nav-link active"
                  : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
              }
            >
              Events
            </NavLink>
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                isActive
                  ? "text-primary dark:text-primary nav-link active"
                  : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
              }
            >
              Jobs
            </NavLink>
            <NavLink
              to="/mentorship"
              className={({ isActive }) =>
                isActive
                  ? "text-primary dark:text-primary nav-link active"
                  : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
              }
            >
              Mentorship
            </NavLink>
            <NavLink
              to="/directory"
              className={({ isActive }) =>
                isActive
                  ? "text-primary dark:text-primary nav-link active"
                  : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
              }
            >
              Directory
            </NavLink>

            {/* Dashboard link outside of dropdown menu for logged-in users */}
            {currentUser && role && (
              <NavLink
                to={`/${role.toLowerCase()}-dashboard`}
                className={({ isActive }) =>
                  isActive
                    ? "text-primary dark:text-primary nav-link active"
                    : "text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline nav-link"
                }
              >
                Dashboard
                {pendingRequests > 0 && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {pendingRequests}
                  </span>
                )}
              </NavLink>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Menu - Desktop */}
            {currentUser ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary focus:outline-none no-underline min-w-[150px] justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  aria-expanded={isDropdownOpen}
                  aria-label="User menu"
                >
                  <span className="mr-2 truncate">{getUserDisplayName()}</span>
                  <svg
                    className={`h-5 w-5 transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                      onClick={handleNavClick}
                    >
                      Profile
                    </Link>
                    {role === 'student' && (
                      <Link
                        to="/student-chat"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                        onClick={handleNavClick}
                      >
                        Chat with Teachers
                      </Link>
                    )}
                    {role === 'teacher' && (
                      <Link
                        to="/teacher-chat"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                        onClick={handleNavClick}
                      >
                        Chat with Students
                      </Link>
                    )}
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                      onClick={handleNavClick}
                    >
                      About
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                      onClick={handleNavClick}
                    >
                      Contact Us
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md no-underline"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Main menu"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isOpen ? 'block' : 'hidden'
        } md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm`}
        onClick={() => setIsOpen(false)}
      >
        <div
          ref={mobileMenuRef}
          className={`fixed inset-y-0 right-0 max-w-[300px] w-full bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Menu</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="py-4 px-5">
            {currentUser && (
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center text-white text-xl mr-3">
                    {getUserDisplayName().charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getUserDisplayName()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary no-underline"
                  onClick={handleNavClick}
                >
                  View Profile
                </Link>
              </div>
            )}

            <nav className="space-y-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Home
              </NavLink>
              <NavLink
                to="/events"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Events
              </NavLink>
              <NavLink
                to="/jobs"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Jobs
              </NavLink>
              <NavLink
                to="/mentorship"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Mentorship
              </NavLink>
              <NavLink
                to="/directory"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Directory
              </NavLink>

              {/* Dashboard link in mobile menu for logged-in users */}
              {currentUser && role && (
                <NavLink
                  to={`/${role.toLowerCase()}-dashboard`}
                  className={({ isActive }) =>
                    isActive
                      ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                      : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                  }
                  onClick={handleNavClick}
                >
                  Dashboard
                  {pendingRequests > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {pendingRequests}
                    </span>
                  )}
                </NavLink>
              )}

              {/* Chat links in mobile menu */}
              {role === 'student' && (
                <NavLink
                  to="/student-chat"
                  className={({ isActive }) =>
                    isActive
                      ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                      : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                  }
                  onClick={handleNavClick}
                >
                  Chat with Teachers
                </NavLink>
              )}
              {role === 'teacher' && (
                <NavLink
                  to="/teacher-chat"
                  className={({ isActive }) =>
                    isActive
                      ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                      : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                  }
                  onClick={handleNavClick}
                >
                  Chat with Students
                </NavLink>
              )}

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                About
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  isActive
                    ? "block py-3 px-4 rounded-md text-primary dark:text-primary bg-blue-50 dark:bg-blue-900/20 no-underline"
                    : "block py-3 px-4 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 no-underline"
                }
                onClick={handleNavClick}
              >
                Contact Us
              </NavLink>
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left py-3 px-4 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </span>
                </button>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 rounded-md text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 no-underline"
                    onClick={handleNavClick}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full py-3 px-4 rounded-md text-center bg-primary hover:bg-primary-dark text-white no-underline"
                    onClick={handleNavClick}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;