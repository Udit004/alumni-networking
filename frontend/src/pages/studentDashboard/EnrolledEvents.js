import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import "bootstrap/dist/css/bootstrap.min.css";

const EnrolledEvents = () => {
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEnrolledEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/enrolled/${currentUser.uid}`);
        setEnrolledEvents(response.data);
      } catch (err) {
        setError('Failed to fetch enrolled events');
        console.error('Error fetching enrolled events:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchEnrolledEvents();
    }
  }, [currentUser]);

  if (loading) return <div className="text-center">Loading enrolled events...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <h3 className="mb-4">My Enrolled Events</h3>
      <div className="row">
        {enrolledEvents.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              You haven't enrolled in any events yet.
            </div>
          </div>
        ) : (
          enrolledEvents.map((event) => (
            <div key={event._id} className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{event.title}</h5>
                  <p className="card-text">{event.description}</p>
                  <div className="event-details">
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {event.time}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                  </div>
                  <div className="mt-3">
                    <span className="badge bg-primary">Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EnrolledEvents;
