import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import Mentorship from './pages/Mentorship';
import CreateEvent from './pages/CreateEvent';
import About from './pages/About';
import Contact from './pages/Contact';
import StudentDashboard from './pages/studentDashboard/StudentDashboard';
import TeacherDashboard from './pages/teacherDashboard/TeacherDashboard';
import AlumniDashboard from './pages/alumniDashboard/AlumniDashboard';
import Directory from './pages/directory/Directory';
import AlumniProfile from './pages/directory/alumniDirectory/AlumniProfile';
import TeacherProfile from './pages/directory/teacherDirectory/TeacherProfile';
import StudentProfile from './pages/directory/studentDirectory/StudentProfile';
import PrivateRoute from './components/PrivateRoute';
import CreateJob from './pages/CreateJob';
import CreateMentorship from './pages/CreateMentorship';
import './App.css';

function App() {
  // Check for user's dark mode preference
  useEffect(() => {
    // Check localStorage first
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedDarkMode === 'enabled') {
      document.documentElement.classList.add('dark');
    } else if (savedDarkMode === 'disabled') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved preference, check system preference
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/events" element={<Events />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/directory/alumni" element={<Directory />} />
              <Route path="/directory/teacher" element={<Directory />} />
              <Route path="/directory/student" element={<Directory />} />
              <Route path="/alumni-directory" element={<Directory />} />
              <Route path="/alumni-profile/:id" element={<AlumniProfile />} />
              <Route path="/directory/alumni/:id" element={<AlumniProfile />} />
              <Route path="/directory/teacher/:id" element={<TeacherProfile />} />
              <Route path="/directory/student/:id" element={<StudentProfile />} />
              <Route
                path="/create-event"
                element={
                  <PrivateRoute>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-event/:eventId"
                element={
                  <PrivateRoute>
                    <CreateEvent isEditing={true} />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student-dashboard"
                element={
                  <PrivateRoute>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/teacher-dashboard"
                element={
                  <PrivateRoute>
                    <TeacherDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/alumni-dashboard"
                element={
                  <PrivateRoute>
                    <AlumniDashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/create-job" element={
                <PrivateRoute allowedRoles={['alumni']}>
                  <CreateJob />
                </PrivateRoute>
              } />
              <Route path="/create-mentorship" element={
                <PrivateRoute allowedRoles={['alumni', 'teacher']}>
                  <CreateMentorship />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
