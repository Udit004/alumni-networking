import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="page-container">
      <div className={`side-navbar ${isNavExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="nav-header">
          <h3 className={`nav-title ${!isNavExpanded ? 'hidden' : ''}`}>Teacher Dashboard</h3>
          <button 
            className="toggle-nav-btn"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            {isNavExpanded ? '◀' : '▶'}
          </button>
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <span className="nav-icon">📊</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "profile" ? "active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            <span className="nav-icon">👤</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>Profile</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "events" ? "active" : ""}`}
            onClick={() => setActiveSection("events")}
          >
            <span className="nav-icon">📅</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>My Events</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "courses" ? "active" : ""}`}
            onClick={() => setActiveSection("courses")}
          >
            <span className="nav-icon">📚</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>My Courses</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "students" ? "active" : ""}`}
            onClick={() => setActiveSection("students")}
          >
            <span className="nav-icon">👥</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>Students</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "analytics" ? "active" : ""}`}
            onClick={() => setActiveSection("analytics")}
          >
            <span className="nav-icon">📈</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>Analytics</span>
          </button>
          <button 
            className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
            onClick={() => setActiveSection("settings")}
          >
            <span className="nav-icon">⚙️</span>
            <span className={`nav-text ${!isNavExpanded ? 'hidden' : ''}`}>Settings</span>
          </button>
        </nav>
      </div>

      <div className="main-content">
        {activeSection === "overview" && (
          <div className="dashboard-section">
            <h2>Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Students</h3>
                <p>150</p>
              </div>
              <div className="stat-card">
                <h3>Active Courses</h3>
                <p>5</p>
              </div>
              <div className="stat-card">
                <h3>Upcoming Events</h3>
                <p>3</p>
              </div>
              <div className="stat-card">
                <h3>Attendance Rate</h3>
                <p>85%</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "profile" && (
          <div className="dashboard-section">
            <h2>Profile</h2>
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <img src="path_to_photo" alt="Profile" className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title">Name</h5>
                    <p className="card-text">Department</p>
                    <a href="linkedin_profile_link" className="btn btn-primary">
                      LinkedIn Profile
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Department</h5>
                    <p className="card-text">Computer Science</p>
                    <h5 className="card-title">Courses Teaching</h5>
                    <p className="card-text">Data Structures, Algorithms</p>
                    <h5 className="card-title">Expertise</h5>
                    <p className="card-text">Machine Learning, AI</p>
                    <h5 className="card-title">Research Areas</h5>
                    <p className="card-text">Deep Learning, Computer Vision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "events" && (
          <div className="dashboard-section">
            <h2>My Events</h2>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Create New Event</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Event Title</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Create Event
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeSection === "courses" && (
          <div className="dashboard-section">
            <h2>My Courses</h2>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Your Courses</h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Data Structures</h5>
                        <p className="card-text">CS101</p>
                        <button className="btn btn-primary">Manage</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Algorithms</h5>
                        <p className="card-text">CS102</p>
                        <button className="btn btn-primary">Manage</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "students" && (
          <div className="dashboard-section">
            <h2>Students</h2>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enrolled Students</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>John Doe</td>
                        <td>john@example.com</td>
                        <td>Computer Science</td>
                        <td>
                          <button className="btn btn-sm btn-primary">View</button>
                          <button className="btn btn-sm btn-danger">Remove</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "analytics" && (
          <div className="dashboard-section">
            <h2>Analytics</h2>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Total Students</h5>
                    <h2 className="card-text">150</h2>
                    <p className="text-success">↑ 10% from last month</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Active Events</h5>
                    <h2 className="card-text">5</h2>
                    <p className="text-success">↑ 2 new this month</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Mentorship Rate</h5>
                    <h2 className="card-text">85%</h2>
                    <p className="text-success">↑ 5% from last month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "settings" && (
          <div className="dashboard-section">
            <h2>Settings</h2>
            {/* Settings content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard; 