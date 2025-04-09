import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './JobApplication.css';

const JobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    education: '',
    experience: '',
    skills: '',
    coverletter: '',
    resumeLink: '',
    additionalInfo: ''
  });
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/jobs/${id}`);
      setJob(response.data);
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error fetching job:', err);
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
      const response = await axios.post(`${API_URL}/api/jobs/${id}/apply`, {
        ...formData,
        userId: currentUser.uid
      });
      
      if (response.data.success) {
        alert('Application submitted successfully!');
        navigate('/jobs');
      }
    } catch (err) {
      setError('Failed to submit application');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!job) {
    return <div className="text-center p-4">Job not found</div>;
  }

  return (
    <div className="job-application">
      <h1>Apply for Job: {job.title}</h1>
      
      <div className="job-details">
        <div className="company-info">
          <h2>{job.company}</h2>
          <p className="location">{job.location}</p>
          <p className="job-type">{job.type}</p>
          {job.salary && <p className="salary">{job.salary}</p>}
        </div>
        
        <div className="job-description">
          <p>{job.description}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="application-form">
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
            />
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="form-group">
            <label>Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="form-group">
            <label>Skills</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Work Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Describe your relevant work experience"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="form-group">
          <label>Cover Letter</label>
          <textarea
            name="coverletter"
            value={formData.coverletter}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Write a brief cover letter explaining why you're a good fit for this position"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="form-group">
          <label>Resume Link</label>
          <input
            type="url"
            name="resumeLink"
            value={formData.resumeLink}
            onChange={handleChange}
            placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="form-group">
          <label>Additional Information</label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional information you'd like to share"
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplication; 