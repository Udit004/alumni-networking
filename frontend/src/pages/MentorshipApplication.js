import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './MentorshipApplication.css';

const MentorshipApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [mentorship, setMentorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentYear: '',
    program: '',
    skills: '',
    experience: '',
    whyInterested: '',
    additionalInfo: ''
  });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMentorshipDetails();
    
    // Pre-fill with user data if available
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [id, currentUser]);

  const fetchMentorshipDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/mentorships/${id}`);
      setMentorship(response.data);
    } catch (err) {
      setError('Failed to load mentorship details');
      console.error('Error fetching mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get the current user's token
      const token = await currentUser.getIdToken();
      
      // Basic validation
      if (!formData.name || !formData.email || !formData.phone || !formData.currentYear || 
          !formData.skills || !formData.experience || !formData.whyInterested) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Format skills as array
      const skillsArray = formData.skills.split(',').map(skill => skill.trim());
      
      // Create application data - don't include userId, it will come from auth middleware
      const applicationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        currentYear: formData.currentYear,
        program: formData.program || formData.currentYear,
        skills: skillsArray,
        experience: formData.experience,
        whyInterested: formData.whyInterested,
        additionalInfo: formData.additionalInfo || ''
      };
      
      console.log("Submitting application with data:", applicationData);
      
      // Submit application to the endpoint
      const response = await axios.post(
        `${API_URL}/api/mentorships/${id}/apply`, 
        applicationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Server response:", response.data);
      
      if (response.data.success) {
        alert('Application submitted successfully!');
        navigate('/mentorship');
      } else {
        setError(`Submission failed: ${response.data.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Failed to submit application');
      console.error('Error submitting application:', err);
      if (err.response) {
        console.error('Error status:', err.response.status);
        console.error('Error data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !mentorship) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="mentorship-application">
      <h1>Apply for Mentorship: {mentorship?.title || id}</h1>
      
      {error && <div className="error-message bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 123-456-7890"
            />
          </div>
          
          <div className="form-group">
            <label>Current Year</label>
            <input
              type="text"
              name="currentYear"
              value={formData.currentYear}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 3rd Year"
            />
          </div>
          
          <div className="form-group">
            <label>Program</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Computer Science"
            />
          </div>
          
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            rows="4"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Describe your relevant experience..."
          />
        </div>
        
        <div className="form-group">
          <label>Why are you interested in this mentorship?</label>
          <textarea
            name="whyInterested"
            value={formData.whyInterested}
            onChange={handleChange}
            required
            rows="4"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Explain why you're interested in this mentorship opportunity..."
          />
        </div>
        
        <div className="form-group">
          <label>Additional Information</label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows="4"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Any additional information you'd like to share (optional)"
          />
        </div>
        
        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/mentorship')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorshipApplication; 