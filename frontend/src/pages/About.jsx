// About.jsx
import { useNavigate } from "react-router-dom";

import React from "react";
import "./About.css";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";

const About = () => {
  const navigate = useNavigate();
  return (
    <Container className="about-page">
      {/* Header Section */}
      <motion.div 
        className="about-header text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
      >
        <h1>WELCOME To Our <strong>Alumni Networking</strong></h1>
        <p>Your gateway to a connected future.</p>
      </motion.div>
        {/* src="https://th.bing.com/th/id/OIP.U726JNAAYHYuDwDUEtPahAHaFt?rs=1&pid=ImgDetMain" */}

      {/* Mission Section */}
      <div className=" image flex flex-col md:flex-row items-center md:items-start">
        <img src="https://th.bing.com/th/id/OIP.U726JNAAYHYuDwDUEtPahAHaFt?rs=1&pid=ImgDetMain" className="w-full max-w-md object-contain" alt="Alumni" />
        <div className="ml-4">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p>We aim to build a strong and engaged alumni network...</p>
        </div>
      </div>
 <br />
      {/* Features Section */}
      <Row className="about-features text-center">
        <Col md={4}>
          <Card className="feature-card">
            <Card.Body>
              <h3>Networking</h3>
              <p>Connect with alumni and expand opportunities.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="feature-card">
            <Card.Body>
              <h3>Mentorship</h3>
              <p>Find mentors and guidance for career growth.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="feature-card">
            <Card.Body>
              <h3>Events</h3>
              <p>Participate in exclusive alumni meetups and events.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
<br />
      {/* Testimonials Section */}
      <Row className="about-testimonials">
        <Col>
          <h2 className="text-center">What Our Alumni Say</h2>
          <p className="text-center">Real stories from our successful alumni.</p>
        </Col>
      </Row>
<br />
      {/* Contact Section */}
      <Row className="about-contact text-center">
        <Col>
          <h2>Get in Touch</h2>
          <p>Contact us for more information about our network.</p>
          <button onClick= {() => navigate("/contact")}className="btn btn-primary">Contact Us</button>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
