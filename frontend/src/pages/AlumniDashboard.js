import React from "react";
import { useState, useEffect, useRef } from "react";
import { Navbar, Nav, Button, Container, Row, Col, Card } from "react-bootstrap";
import { FaBars, FaTimes, FaUser, FaHandshake, FaBriefcase, FaCalendarAlt } from "react-icons/fa";
import { RiUserSettingsLine, RiDashboardLine } from "react-icons/ri";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Dashboard.css";

const AlumniDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && 
          isOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <Navbar expand="lg" className="custom-navbar">
        <Button 
          variant="link" 
          className="menu-btn" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FaTimes className="menu-icon" />
          ) : (
            <FaBars className="menu-icon" />
          )}
        </Button>
        <Navbar.Brand className="mx-auto brand">
          <RiDashboardLine className="brand-icon" /> Alumni Dashboard
        </Navbar.Brand>
        <div className="user-info">PRIYA KUMARI</div>
      </Navbar>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`sidebar ${isOpen ? "open" : ""}`}
      >
        <Nav className="flex-column p-3">
          <Nav.Link href="#profile">
            <RiUserSettingsLine className="nav-icon" /> Profile
          </Nav.Link>
          <Nav.Link href="#connections">
            <FaUser className="nav-icon" /> Connections
          </Nav.Link>
          <Nav.Link href="#mentorship">
            <FaHandshake className="nav-icon" /> Mentorship
          </Nav.Link>
          <Nav.Link href="#job-opportunities">
            <FaBriefcase className="nav-icon" /> Jobs
          </Nav.Link>
          <Nav.Link href="#events">
            <FaCalendarAlt className="nav-icon" /> Events
          </Nav.Link>
        </Nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" />}

      {/* Dashboard Content */}
      <Container className="dashboard-content mt-4">
        <Row xs={1} md={2} lg={2} className="g-4">
          <Col>
            <Card className="h-100 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className="card-icon-container">
                  <RiUserSettingsLine className="card-icon text-primary" />
                </div>
                <Card.Title>My Profile</Card.Title>
                <Card.Text>
                  Update your details and stay connected with peers.
                </Card.Text>
                <Button variant="primary" className="mt-auto rounded-pill">
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className="card-icon-container">
                  <FaHandshake className="card-icon text-success" />
                </div>
                <Card.Title>Mentorship Requests</Card.Title>
                <Card.Text>
                  Help students by mentoring and sharing your experiences.
                </Card.Text>
                <Button variant="success" className="mt-auto rounded-pill">
                  View Requests
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className="card-icon-container">
                  <FaBriefcase className="card-icon text-info" />
                </div>
                <Card.Title>Job Opportunities</Card.Title>
                <Card.Text>
                  Post or find jobs and internships for students.
                </Card.Text>
                <Button variant="info" className="mt-auto rounded-pill">
                  Explore Jobs
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className="card-icon-container">
                  <FaCalendarAlt className="card-icon text-warning" />
                </div>
                <Card.Title>Alumni Events</Card.Title>
                <Card.Text>
                  Stay updated on alumni gatherings and networking events.
                </Card.Text>
                <Button variant="warning" className="mt-auto rounded-pill">
                  View Events
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AlumniDashboard;