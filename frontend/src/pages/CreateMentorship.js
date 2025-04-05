import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CreateMentorship.css';

const CreateMentorship = () => {
  const { currentUser, userData, role } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career Development',
    skills: '',
    expectations: '',
    commitment: '2-3 hours per week',
    duration: '3 months',
    maxMentees: 5,
    prerequisites: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
      setError('');
      
      // Check specifically for the expectations field
      if (!formData.expectations || formData.expectations.trim() === '') {
        setError('Expectations field is required and cannot be empty');
        setLoading(false);
        return;
      }
      
      // Validate form
      if (!formData.title || !formData.description || !formData.category || !formData.skills) {
        throw new Error('Please fill all required fields');
      }
      
      // Create the request payload
      const mentorshipPayload = {
        ...formData,
        mentorId: currentUser.uid,
        expectations: formData.expectations.trim(), // Ensure expectations is properly formatted
        mentorName: userData?.name || 'Anonymous',
        mentorRole: role,
        mentorPhotoURL: userData?.photoURL || '',
        mentees: 0,
        status: 'active'
      };
      
      // Log the exact payload being sent
      console.log('Submitting mentorship data:', mentorshipPayload);
      
      const response = await fetch(`${API_URL}/api/mentorships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(mentorshipPayload)
      });
      
      // Log the raw response
      console.log('Response status:', response.status);
      
      // If response is not ok, try to get detailed error message
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Failed to create mentorship program');
        } catch (parseError) {
          // If parsing fails, use the raw text
          throw new Error(`Server error: ${errorText || response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Career Development',
        skills: '',
        expectations: '',
        commitment: '2-3 hours per week',
        duration: '3 months',
        maxMentees: 5,
        prerequisites: ''
      });
      
      // Redirect after success
      setTimeout(() => {
        if (role === 'alumni') {
          navigate('/alumni-dashboard/mentorship');
        } else if (role === 'teacher') {
          navigate('/teacher-dashboard/mentorship');
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      console.error('Error creating mentorship:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-mentorship-page">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create Mentorship Program</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Share your knowledge and experience with students through mentorship
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <p>Mentorship program created successfully! Redirecting to dashboard...</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Career Guidance for Software Engineers"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Career Development">Career Development</option>
                  <option value="Technical Skills">Technical Skills</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Academic">Academic</option>
                  <option value="Personal Growth">Personal Growth</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills to be Learned <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. Resume Building, Interview Prep, Career Planning"
                />
              </div>
              
              <div>
                <label htmlFor="commitment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Commitment <span className="text-red-500">*</span>
                </label>
                <select
                  id="commitment"
                  name="commitment"
                  value={formData.commitment}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="1 hour per week">1 hour per week</option>
                  <option value="2-3 hours per week">2-3 hours per week</option>
                  <option value="4-5 hours per week">4-5 hours per week</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maxMentees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Number of Mentees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="maxMentees"
                  name="maxMentees"
                  value={formData.maxMentees}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what mentees will learn, your approach to mentoring, and expected outcomes..."
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="expectations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expectations and Goals <span className="text-red-500">*</span>
              </label>
              <textarea
                id="expectations"
                name="expectations"
                value={formData.expectations}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="What are your expectations from mentees? What goals will you help them achieve?"
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prerequisites
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Any prerequisites or requirements for mentees (optional)"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/mentorship')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Create Program'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMentorship; 