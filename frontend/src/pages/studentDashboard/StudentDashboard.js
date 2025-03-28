import React, { useState } from "react";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import EnrolledEvents from "./EnrolledEvents";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'events', label: 'Enrolled Events', icon: '📅' },
    { id: 'courses', label: 'Course Materials', icon: '📚' },
    { id: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { id: 'jobs', label: 'Jobs & Internships', icon: '💼' },
    { id: 'forum', label: 'Forums', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  return (
    <div className="page-container">
      <div className={`side-navbar ${isNavExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="nav-header">
          <h3 className={`nav-title ${!isNavExpanded ? 'hidden' : ''}`}>Student Dashboard</h3>
          <button
            className="toggle-nav-btn"
            onClick={() => setIsNavExpanded(!isNavExpanded)}
          >
            {isNavExpanded ? '◀' : '▶'}
          </button>
        </div>
        <div className="nav-menu">
          {menuItems.map((item) => (
          <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleSectionClick(item.id)}
          >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
          </button>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h1>{menuItems.find(item => item.id === activeSection)?.label}</h1>
          <div className="header-actions">
            <button className="notification-btn">
              <span className="nav-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {activeSection === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Enrolled Events</h3>
                  <div className="stat-value">5</div>
                  <div className="stat-label">Active Events</div>
                </div>
                <div className="stat-card">
                  <h3>Course Progress</h3>
                  <div className="stat-value">75%</div>
                  <div className="stat-label">Completion Rate</div>
                </div>
                <div className="stat-card">
                  <h3>Mentorship</h3>
                  <div className="stat-value">2</div>
                  <div className="stat-label">Active Sessions</div>
                </div>
                <div className="stat-card">
                  <h3>Forum Activity</h3>
                  <div className="stat-value">12</div>
                  <div className="stat-label">Recent Posts</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">📅</span>
                    <div className="activity-details">
                      <p>Enrolled in "Career Development Workshop"</p>
                      <small>2 hours ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">📚</span>
                    <div className="activity-details">
                      <p>Completed Module 3 in "Web Development"</p>
                      <small>Yesterday</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">💬</span>
                    <div className="activity-details">
                      <p>Posted in "Technology Trends" forum</p>
                      <small>2 days ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="profile-section">
              <div className="profile-header">
                <div className="profile-avatar">
                  <img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Profile" />
                </div>
                <div className="profile-info">
                  <h2>{user?.displayName || 'Student Name'}</h2>
                  <p>Computer Science Department</p>
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-value">3rd</span>
                      <span className="stat-label">Year</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">8.5</span>
                      <span className="stat-label">CGPA</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">15</span>
                      <span className="stat-label">Connections</span>
                    </div>
                  </div>
                </div>
                <button className="edit-profile-btn">Edit Profile</button>
              </div>

              <div className="profile-details">
                <div className="detail-card">
                  <h3>Academic Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Roll Number:</span>
                    <span className="detail-value">CS2021045</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Batch:</span>
                    <span className="detail-value">2021-2025</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">Computer Science</span>
                  </div>
                </div>

                <div className="detail-card">
                  <h3>Skills & Interests</h3>
                  <div className="tags">
                    <span className="tag">JavaScript</span>
                    <span className="tag">React</span>
                    <span className="tag">Node.js</span>
                    <span className="tag">Python</span>
                    <span className="tag">Machine Learning</span>
                  </div>
                </div>

                <div className="detail-card">
                  <h3>Contact Information</h3>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">+91 98765 43210</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">LinkedIn:</span>
                    <a href="#" className="detail-value">View Profile</a>
                </div>
              </div>
            </div>
          </div>
        )}

          {activeSection === 'events' && <EnrolledEvents />}

          {activeSection === 'courses' && (
            <div className="courses-section">
              <div className="section-header">
                <h2>Course Materials</h2>
                <div className="search-box">
                  <input type="text" placeholder="Search courses..." />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              <div className="courses-grid">
                <div className="course-card">
                  <div className="course-header">
                    <h3>Web Development</h3>
                    <span className="progress-badge">75% Complete</span>
                  </div>
                  <p>Learn modern web development with React and Node.js</p>
                  <div className="course-progress">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                  <button className="continue-btn">Continue Learning</button>
                </div>

                <div className="course-card">
                  <div className="course-header">
                    <h3>Data Structures</h3>
                    <span className="progress-badge">40% Complete</span>
                  </div>
                  <p>Master fundamental data structures and algorithms</p>
                  <div className="course-progress">
                    <div className="progress-bar" style={{ width: '40%' }}></div>
                  </div>
                  <button className="continue-btn">Continue Learning</button>
                </div>
              </div>
          </div>
        )}

          {activeSection === 'mentorship' && (
            <div className="mentorship-section">
              <div className="section-header">
                <h2>Mentorship Programs</h2>
                <button className="primary-btn">Find a Mentor</button>
              </div>

              <div className="mentors-grid">
                <div className="mentor-card">
                  <img src="https://via.placeholder.com/100" alt="Mentor" className="mentor-avatar" />
                  <div className="mentor-info">
                    <h3>John Doe</h3>
                    <p>Senior Software Engineer at Google</p>
                    <div className="mentor-tags">
                      <span className="tag">Web Development</span>
                      <span className="tag">Career Guidance</span>
                    </div>
                  </div>
                  <button className="schedule-btn">Schedule Session</button>
                </div>

                <div className="mentor-card">
                  <img src="https://via.placeholder.com/100" alt="Mentor" className="mentor-avatar" />
                  <div className="mentor-info">
                    <h3>Jane Smith</h3>
                    <p>Product Manager at Microsoft</p>
                    <div className="mentor-tags">
                      <span className="tag">Product Management</span>
                      <span className="tag">Leadership</span>
                    </div>
                  </div>
                  <button className="schedule-btn">Schedule Session</button>
                </div>
              </div>
          </div>
        )}

          {activeSection === 'jobs' && (
            <div className="jobs-section">
              <div className="section-header">
                <h2>Jobs & Internships</h2>
                <div className="filter-actions">
                  <select className="filter-select">
                    <option>All Types</option>
                    <option>Full-time</option>
                    <option>Internship</option>
                  </select>
                  <button className="primary-btn">Track Applications</button>
                </div>
              </div>

              <div className="jobs-list">
                <div className="job-card">
                  <div className="job-header">
                    <h3>Software Engineer Intern</h3>
                    <span className="company-name">Google</span>
                  </div>
                  <p className="job-description">
                    Join our team for a summer internship program working on cutting-edge technologies.
                  </p>
                  <div className="job-details">
                    <span>📍 Bangalore</span>
                    <span>💰 Paid Internship</span>
                    <span>⏰ 3 Months</span>
                  </div>
                  <button className="apply-btn">Apply Now</button>
                </div>

                <div className="job-card">
                  <div className="job-header">
                    <h3>Frontend Developer</h3>
                    <span className="company-name">Microsoft</span>
                  </div>
                  <p className="job-description">
                    Looking for a passionate frontend developer to join our growing team.
                  </p>
                  <div className="job-details">
                    <span>📍 Hyderabad</span>
                    <span>💰 Full-time</span>
                    <span>⏰ Immediate Joining</span>
                  </div>
                  <button className="apply-btn">Apply Now</button>
                </div>
              </div>
          </div>
        )}

          {activeSection === 'forum' && (
            <div className="forum-section">
              <div className="section-header">
                <h2>Discussion Forums</h2>
                <button className="primary-btn">Create New Topic</button>
              </div>

              <div className="forum-categories">
                <div className="category-card active">
                  <h3>Technical Discussions</h3>
                  <span className="post-count">24 posts</span>
                </div>
                <div className="category-card">
                  <h3>Career Advice</h3>
                  <span className="post-count">15 posts</span>
                </div>
                <div className="category-card">
                  <h3>Campus Life</h3>
                  <span className="post-count">32 posts</span>
                </div>
              </div>

              <div className="forum-posts">
                <div className="post-card">
                  <div className="post-header">
                    <img src="https://via.placeholder.com/40" alt="User" className="user-avatar" />
                    <div className="post-info">
                      <h4>Tips for Technical Interviews</h4>
                      <span className="post-meta">Posted by John • 2 hours ago</span>
                    </div>
                  </div>
                  <p className="post-preview">Sharing my experience and tips for technical interviews...</p>
                  <div className="post-stats">
                    <span>👍 15 likes</span>
                    <span>💬 8 comments</span>
                  </div>
                </div>
              </div>
          </div>
        )}

          {activeSection === 'settings' && (
            <div className="settings-section">
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Account Settings</h3>
                  <div className="settings-list">
                    <div className="settings-item">
                      <span>Email Notifications</span>
                      <label className="switch">
                        <input type="checkbox" checked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-item">
                      <span>Profile Visibility</span>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Privacy Settings</h3>
                  <div className="settings-list">
                    <div className="settings-item">
                      <span>Show Email</span>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-item">
                      <span>Show Phone</span>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
