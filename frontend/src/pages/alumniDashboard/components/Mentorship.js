import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Mentorship = ({ isDarkMode, API_URL, user, role }) => {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // Mentorship form state
  const [showMentorshipForm, setShowMentorshipForm] = useState(false);
  const [editingMentorship, setEditingMentorship] = useState(null);
  const [mentorshipFormData, setMentorshipFormData] = useState({
    title: '',
    category: 'Career Development',
    description: '',
    expectations: '',
    duration: '3 months',
    commitment: '2 hours/week',
    skills: '',
    prerequisites: '',
    maxMentees: '1'
  });
  
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
      
      // Use the actual API data
      console.log('Mentorships received from API:', {
        mentorships: data.mentorships?.length || 0
      });
      
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

  const handleCreateMentorship = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const mentorshipData = {
        ...mentorshipFormData,
        mentorId: user?.uid,
        createdAt: new Date().toISOString(),
        mentees: 0,
        status: 'active'
      };
      
      const response = await fetch(`${API_URL}/api/mentorships?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(mentorshipData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create mentorship program');
      }
      
      const newMentorship = await response.json();
      
      // Add the new mentorship to the state
      setMentorships([newMentorship, ...mentorships]);
      setShowMentorshipForm(false);
      resetMentorshipForm();
      
      // Success message
      alert('Mentorship program created successfully!');
      
    } catch (err) {
      setError('Failed to create mentorship program: ' + err.message);
      console.error('Error creating mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMentorship = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const mentorshipData = {
        ...mentorshipFormData
      };
      
      const response = await fetch(`${API_URL}/api/mentorships/${editingMentorship._id}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify(mentorshipData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update mentorship program');
      }
      
      const updatedMentorship = await response.json();
      
      // Update the mentorship in the state
      const updatedMentorships = mentorships.map(mentorship => 
        mentorship._id === editingMentorship._id ? updatedMentorship : mentorship
      );
      
      setMentorships(updatedMentorships);
      setShowMentorshipForm(false);
      setEditingMentorship(null);
      resetMentorshipForm();
      
      // Success message
      alert('Mentorship program updated successfully!');
      
    } catch (err) {
      setError('Failed to update mentorship program: ' + err.message);
      console.error('Error updating mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMentorship = async (mentorshipId) => {
    try {
      setIsDeleting(true);
      setDeleteId(mentorshipId);
      setDeleteError('');
      
      const response = await fetch(`${API_URL}/api/mentorships/${mentorshipId}?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete mentorship program');
      }
      
      // Remove the deleted mentorship from the state
      setMentorships(mentorships.filter(mentorship => mentorship._id !== mentorshipId));
      
      // Success message
      alert('Mentorship program deleted successfully');

    } catch (err) {
      console.error('Error deleting mentorship:', err);
      setDeleteError(`Failed to delete mentorship: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Add function to handle completion of mentorship
  const handleMarkAsCompleted = async (mentorshipId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/mentorships/${mentorshipId}/complete?firebaseUID=${user?.uid}&role=${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to complete mentorship program');
      }
      
      const updatedMentorship = await response.json();
      
      // Update the mentorship in the state
      const updatedMentorships = mentorships.map(mentorship => 
        mentorship._id === mentorshipId ? updatedMentorship : mentorship
      );
      
      setMentorships(updatedMentorships);
      
      // Success message
      alert('Mentorship program marked as completed!');
      
    } catch (err) {
      setError('Failed to complete mentorship program: ' + err.message);
      console.error('Error completing mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  const startEditMentorship = (mentorship) => {
    setEditingMentorship(mentorship);
    setMentorshipFormData({
      title: mentorship.title,
      category: mentorship.category,
      description: mentorship.description,
      expectations: mentorship.expectations,
      duration: mentorship.duration,
      commitment: mentorship.commitment,
      skills: mentorship.skills,
      prerequisites: mentorship.prerequisites,
      maxMentees: mentorship.maxMentees.toString()
    });
    setShowMentorshipForm(true);
  };

  const resetMentorshipForm = () => {
    setMentorshipFormData({
      title: '',
      category: 'Career Development',
      description: '',
      expectations: '',
      duration: '3 months',
      commitment: '2 hours/week',
      skills: '',
      prerequisites: '',
      maxMentees: '1'
    });
  };

  const handleMentorshipFormChange = (e) => {
    const { name, value } = e.target;
    setMentorshipFormData({
      ...mentorshipFormData,
      [name]: value
    });
  };

  const cancelMentorshipForm = () => {
    setShowMentorshipForm(false);
    setEditingMentorship(null);
    resetMentorshipForm();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const filteredMentorships = mentorships.filter((mentorship) => {
    // Search filter
    const matchesSearch = mentorship.title.toLowerCase().includes(search.toLowerCase()) || 
                         mentorship.category.toLowerCase().includes(search.toLowerCase()) ||
                         mentorship.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    let matchesStatus = true;
    if (filter !== 'all') {
      matchesStatus = mentorship.status.toLowerCase() === filter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mentorship-section space-y-6">
      {/* Mentorship Form */}
      {showMentorshipForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            {editingMentorship ? 'Edit Mentorship Program' : 'Create New Mentorship Program'}
          </h2>
          
          <form onSubmit={editingMentorship ? handleUpdateMentorship : handleCreateMentorship}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program Title*
                </label>
                <input
                  type="text"
                  name="title"
                  value={mentorshipFormData.title}
                  onChange={handleMentorshipFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category*
                </label>
                <select
                  name="category"
                  value={mentorshipFormData.category}
                  onChange={handleMentorshipFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration*
                </label>
                <input
                  type="text"
                  name="duration"
                  value={mentorshipFormData.duration}
                  onChange={handleMentorshipFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g. 3 months"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Commitment*
                </label>
                <input
                  type="text"
                  name="commitment"
                  value={mentorshipFormData.commitment}
                  onChange={handleMentorshipFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g. 2 hours/week"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skills to Share*
                </label>
                <input
                  type="text"
                  name="skills"
                  value={mentorshipFormData.skills}
                  onChange={handleMentorshipFormChange}
                  required
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g. Leadership, React, Project Management"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Mentees*
                </label>
                <input
                  type="number"
                  name="maxMentees"
                  value={mentorshipFormData.maxMentees}
                  onChange={handleMentorshipFormChange}
                  required
                  min="1"
                  max="10"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Program Description*
              </label>
              <textarea
                name="description"
                value={mentorshipFormData.description}
                onChange={handleMentorshipFormChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expectations and Goals*
              </label>
              <textarea
                name="expectations"
                value={mentorshipFormData.expectations}
                onChange={handleMentorshipFormChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prerequisites
              </label>
              <textarea
                name="prerequisites"
                value={mentorshipFormData.prerequisites}
                onChange={handleMentorshipFormChange}
                rows={2}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelMentorshipForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                {editingMentorship ? 'Update Program' : 'Create Program'}
              </button>
            </div>
          </form>
        </div>
      )}

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
              <span>Find Mentors</span> <span>🔍</span>
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
        
        {deleteError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {deleteError}
          </div>
        )}

        {loading && !showMentorshipForm ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading mentorship programs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error loading mentorship programs</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : filteredMentorships.length === 0 ? (
          <div className="text-center py-10">
            {mentorships.length === 0 ? (
              <>
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">You haven't created any mentorship programs yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Share your expertise with others by creating your first mentorship program</p>
                <button 
                  onClick={() => {
                    resetMentorshipForm();
                    setShowMentorshipForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Create a Program
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No mentorship programs match your search</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMentorships.map((mentorship) => (
              <div 
                key={mentorship._id}
                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg transition-shadow"
                style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
                        🎓
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{mentorship.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{mentorship.category}</p>
                          </div>
                          
                          <div className="mt-2 sm:mt-0">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              mentorship.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                              {mentorship.status === 'active' ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{mentorship.description}</p>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">⏱️</span>
                            <span className="text-sm">{mentorship.commitment} for {mentorship.duration}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">🧠</span>
                            <span className="text-sm">{mentorship.skills}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">👥</span>
                            <span className="text-sm">{mentorship.mentees}/{mentorship.maxMentees} mentees</span>
                          </div>
                          
                          <div className="flex items-center text-gray-700 dark:text-gray-300">
                            <span className="text-sm mr-2">📅</span>
                            <span className="text-sm">Created on {formatDate(mentorship.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button 
                        onClick={() => navigate(`/mentorship/${mentorship._id}`)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => startEditMentorship(mentorship)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                      >
                        Edit Program
                      </button>
                      {mentorship.status === 'active' && (
                        <button 
                          onClick={() => handleMarkAsCompleted(mentorship._id)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                        >
                          Mark as Completed
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteMentorship(mentorship._id)}
                        disabled={isDeleting && deleteId === mentorship._id}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                      >
                        {isDeleting && deleteId === mentorship._id ? 'Deleting...' : 'Delete Program'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-1/3 flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-full"
                         style={{ backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb' }}>
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Program Stats</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Mentee Applications</p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">{mentorship.mentees}</p>
                            <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(100, (mentorship.mentees / mentorship.maxMentees) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                            {mentorship.mentees}/{mentorship.maxMentees} spots filled
                          </p>
                        </div>
                        
                        {mentorship.status === 'active' && (
                          <>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Sessions Completed</p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {Math.floor(Math.random() * 10) + 1}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                                {Math.floor(Math.random() * 20) + 5} hours
                              </p>
                            </div>
                          </>
                        )}
                        
                        {mentorship.status === 'completed' && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mentee Satisfaction</p>
                            <p className="text-lg font-semibold text-gray-800 dark:text-white">
                              {Math.floor(Math.random() * 1.5) + 3.5}/5
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-3">
                          <button 
                            onClick={() => navigate(`/mentorship/mentees/${mentorship._id}`)}
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                          >
                            Manage Mentees
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredMentorships.length > 0 && filteredMentorships.length < mentorships.length && (
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Showing {filteredMentorships.length} of {mentorships.length} mentorship programs
          </div>
        )}
      </div>
      
      {/* My Current Mentorships (as a mentee) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Mentorships (as Mentee)</h2>
          
          <button 
            onClick={() => navigate('/mentorship/find')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 mt-2 sm:mt-0"
          >
            <span>Find a Mentor</span> <span>🔍</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-shadow"
            style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-500 dark:text-purple-300 text-xl">
                JS
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Leadership Development</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">with John Smith</p>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    3 sessions completed • 2 months remaining
                  </span>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-lg transition-shadow"
            style={{ backgroundColor: isDarkMode ? '#0f172a' : 'white' }}
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 text-xl">
                AL
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Web Development Mastery</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">with Amy Lee</p>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      Completed
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    12 sessions • Completed 3 weeks ago
                  </span>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentorship; 