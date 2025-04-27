import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const Resources = ({ materials, handleDeleteMaterial, loading, isDarkMode }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'notes',
    courseId: '',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch teacher's courses for the dropdown
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!currentUser) return;
      
      try {
        console.log("Fetching courses for teacher:", currentUser.uid);
        
        // First try with token
        try {
          const token = await currentUser.getIdToken();
          console.log("Got auth token, making request with authorization header");
          
          const response = await fetch(`${API_URL}/api/courses/teacher/${currentUser.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          console.log("Courses response:", data);
          
          if (data.success) {
            setCourses(data.courses || []);
            // Set default courseId if courses exist
            if (data.courses && data.courses.length > 0) {
              setNewMaterial(prev => ({ ...prev, courseId: data.courses[0]._id }));
            }
            return; // Exit if successful
          }
        } catch (tokenError) {
          console.error("Error with token auth, trying without token:", tokenError);
        }
        
        // Fallback without token (for development/testing)
        const fallbackResponse = await fetch(`${API_URL}/api/courses/teacher/${currentUser.uid}`);
        const fallbackData = await fallbackResponse.json();
        console.log("Fallback courses response:", fallbackData);
        
        if (fallbackData.success) {
          setCourses(fallbackData.courses || []);
          // Set default courseId if courses exist
          if (fallbackData.courses && fallbackData.courses.length > 0) {
            setNewMaterial(prev => ({ ...prev, courseId: fallbackData.courses[0]._id }));
          }
        } else {
          console.error("Failed to fetch courses:", fallbackData.message);
          setErrorMessage("Failed to load courses. Please try again.");
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setErrorMessage("Error loading courses. Please check your connection and try again.");
      }
    };
    
    fetchTeacherCourses();
  }, [currentUser, API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMaterial(prev => ({ 
        ...prev, 
        file: file
      }));
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'notes': return '📝';
      case 'assignment': return '📋';
      case 'template': return '🎯';
      case 'quiz': return '✍️';
      case 'lab': return '🔬';
      case 'guide': return '📖';
      default: return '📄';
    }
  };

  const getColorForType = (type) => {
    switch(type) {
      case 'notes': return 'blue';
      case 'assignment': return 'purple';
      case 'template': return 'yellow';
      case 'quiz': return 'red';
      case 'lab': return 'indigo';
      case 'guide': return 'teal';
      default: return 'gray';
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newMaterial.title || !newMaterial.courseId) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Prepare form data for multipart file upload
      const formData = new FormData();
      formData.append('courseId', newMaterial.courseId);
      formData.append('title', newMaterial.title);
      formData.append('description', newMaterial.description || '');
      formData.append('type', newMaterial.type || 'notes');
      
      // Add file if selected
      if (newMaterial.file) {
        formData.append('file', newMaterial.file);
      }
      
      let token = null;
      try {
        token = await currentUser.getIdToken();
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
      }
      
      // Determine API URL (with or without firebaseUID for development fallback)
      const apiUrl = token 
        ? `${API_URL}/api/materials` 
        : `${API_URL}/api/materials?firebaseUID=${currentUser.uid}&role=teacher`;
      
      console.log("Uploading material to:", apiUrl);
      
      // Add the material via API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData
      });
      
      const data = await response.json();
      console.log("Upload response:", data);
      
      if (data.success) {
        // Close modal and refresh materials
        setShowAddModal(false);
        
        // Reset form
        setNewMaterial({
          title: '',
          description: '',
          type: 'notes',
          courseId: courses.length > 0 ? courses[0]._id : '',
          file: null
        });
        
        // Call parent component to refresh materials list
        window.location.reload();
      } else {
        setErrorMessage(data.message || 'Failed to add material');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      setErrorMessage('An error occurred while adding the material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="resources-section">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Teaching Resources</h2>
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add Resource
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : materials && materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3`} style={{ backgroundColor: material.color ? `var(--color-${material.color}-100)` : 'var(--color-gray-100)', color: material.color ? `var(--color-${material.color}-600)` : 'var(--color-gray-600)' }}>
                    {material.icon || '📄'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">{material.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{material.courseTitle || material.course}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>
                    
                    {/* Show file details if available */}
                    {material.fileUrl && (
                      <div className="mb-3 text-sm">
                        <a 
                          href={material.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          {material.fileName || 'Download file'}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  <button 
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${material.title}"?`)) {
                        handleDeleteMaterial(material.id);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Resources</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You don't have any teaching resources yet. Add your first resource to share with your students.
            </p>
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Resource
            </button>
          </div>
        )}
      </div>

      {/* Resource Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Resource Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-500 dark:text-blue-300 text-2xl mr-3">
              📝
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Lecture Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'notes').length : 0} Items
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-500 dark:text-purple-300 text-2xl mr-3">
              📋
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Assignments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'assignment').length : 0} Items
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-500 dark:text-yellow-300 text-2xl mr-3">
              🎯
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Templates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'template').length : 0} Items
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-800 text-red-500 dark:text-red-300 text-2xl mr-3">
              ✍️
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Quizzes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'quiz').length : 0} Items
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-500 dark:text-indigo-300 text-2xl mr-3">
              🔬
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Lab Materials</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'lab').length : 0} Items
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-800 text-teal-500 dark:text-teal-300 text-2xl mr-3">
              📖
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Study Guides</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {materials ? materials.filter(m => m.type === 'guide').length : 0} Items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
               style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Resource</h3>
            
            <form onSubmit={handleAddMaterial} encType="multipart/form-data">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newMaterial.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newMaterial.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={newMaterial.courseId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Material Type
                </label>
                <select
                  name="type"
                  value={newMaterial.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="notes">Lecture Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="template">Template</option>
                  <option value="quiz">Quiz</option>
                  <option value="lab">Lab Material</option>
                  <option value="guide">Study Guide</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Upload PDF, DOCX, or other relevant files.
                </p>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mr-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources; 