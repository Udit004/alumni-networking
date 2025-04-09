import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Mentorship = ({ isDarkMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mentorships, setMentorships] = useState([]);
  const [enrolledMentorships, setEnrolledMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/mentorships`);
      const userMentorshipsResponse = await axios.get(`${API_URL}/api/mentorships/user/${currentUser.uid}`);
      
      setMentorships(response.data);
      setEnrolledMentorships(userMentorshipsResponse.data.enrolledMentorships || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching mentorships:', err);
      setError('Failed to load mentorships. Please try again.');
      setLoading(false);
    }
  };

  const handleApplyMentorship = (mentorshipId) => {
    if (!currentUser) {
      alert('Please login to apply for mentorship');
      return;
    }
    navigate(`/mentorship/${mentorshipId}/apply`);
  };

  const isEnrolled = (mentorshipId) => {
    return enrolledMentorships.some(m => m.mentorshipId === mentorshipId);
  };

  const filteredMentorships = mentorships.filter(mentorship => {
    const matchesSearch = mentorship.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          mentorship.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'enrolled' && isEnrolled(mentorship._id)) return matchesSearch;
    if (filter === 'available' && !isEnrolled(mentorship._id)) return matchesSearch;
    
    return false;
  });

  return (
    <div className="mentorship-section">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Find a Mentor</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for mentorships..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Mentorships</option>
              <option value="enrolled">Enrolled</option>
              <option value="available">Available</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : filteredMentorships.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600 dark:text-gray-400">No mentorships found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredMentorships.map(mentorship => (
              <div key={mentorship._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{mentorship.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Category: {mentorship.category} • Duration: {mentorship.duration}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mentorship.skills && mentorship.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {mentorship.status === 'active' ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{mentorship.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Commitment: {mentorship.commitment} • Mentees: {mentorship.mentees?.length || 0}/{mentorship.maxMentees}
                    </p>
                  </div>
                  <div>
                    {isEnrolled(mentorship._id) ? (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-lg inline-block">Enrolled</span>
                    ) : mentorship.status === 'active' && mentorship.mentees?.length < mentorship.maxMentees ? (
                      <button 
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        onClick={() => handleApplyMentorship(mentorship._id)}
                      >
                        Apply
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-500 text-white rounded-lg inline-block">Full</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* My Mentorships Section */}
      {enrolledMentorships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Mentorships</h2>
          
          <div className="space-y-6">
            {enrolledMentorships.map(enrollment => {
              const mentorship = mentorships.find(m => m._id === enrollment.mentorshipId);
              if (!mentorship) return null;
              
              return (
                <div key={mentorship._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{mentorship.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">Mentor: {mentorship.mentorName || 'Unknown'}</p>
                    </div>
                    <div>
                      <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                        Contact Mentor
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Session</h4>
                      <p className="text-gray-900 dark:text-white">Thursday, 3:00 PM</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Remaining</h4>
                      <p className="text-gray-900 dark:text-white">4 weeks</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship; 