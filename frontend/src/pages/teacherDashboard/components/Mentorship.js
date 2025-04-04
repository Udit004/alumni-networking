import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mentorship = ({ isDarkMode, API_URL, user, role }) => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/mentorships/user/${user?.uid}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentorships');
      }

      const data = await response.json();
      
      // Sort mentorships by date
      const sortedMentorships = data.mentorships?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
      setMentorships(sortedMentorships);
      
    } catch (err) {
      setError('Failed to load mentorships. Please try again.');
      console.error('Error fetching mentorships:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter mentorships based on search and filter
  const filteredMentorships = mentorships.filter((mentorship) => {
    // Search filter
    const matchesSearch = mentorship.title.toLowerCase().includes(search.toLowerCase()) || 
                         mentorship.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (filter !== 'all') {
      matchesStatus = mentorship.status === filter;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mentorship-section space-y-6">
      {/* Main Mentorships List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Mentorship Programs</h2>
          
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/mentorship')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Find Programs</span> <span>🔍</span>
            </button>
            
            <button 
              onClick={() => navigate('/create-mentorship')}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Create Program</span> <span>➕</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search mentorship programs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'active' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-2 rounded-lg ${
                filter === 'completed' 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading mentorship programs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        ) : filteredMentorships.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No mentorship programs found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {search || filter !== 'all' ? "Try adjusting your search criteria" : "You haven't created any mentorship programs yet"}
            </p>
            <button 
              onClick={() => navigate('/create-mentorship')}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Create Your First Program
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMentorships.map((mentorship) => (
              <div 
                key={mentorship._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{mentorship.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{mentorship.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    mentorship.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                  }`}>
                    {mentorship.status === 'active' ? 'Active' : 'Completed'}
                  </span>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{mentorship.description}</p>
                </div>
                
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{mentorship.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time Commitment</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{mentorship.commitment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mentees</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{mentorship.mentees}/{mentorship.maxMentees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(mentorship.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  <button 
                    onClick={() => navigate(`/mentorship/${mentorship._id}`)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => navigate(`/mentorship/${mentorship._id}/applications`)}
                    className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
                  >
                    Manage Mentees
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship; 