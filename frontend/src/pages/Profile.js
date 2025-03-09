import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    college: "",
    role: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          name: userData.name,
          college: userData.college,
        });
        setEditing(false);
        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg p-4 rounded-lg">
            <Card.Body>
              <div className="text-center">
                <h2 className="mb-3">Profile</h2>
              </div>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email (cannot be changed)</Form.Label>
                  <Form.Control type="email" value={userData.email} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>College</Form.Label>
                  <Form.Control
                    type="text"
                    name="college"
                    value={userData.college}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control type="text" value={userData.role} disabled />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  {editing ? (
                    <Button variant="success" onClick={handleSave}>
                      Save Changes
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
