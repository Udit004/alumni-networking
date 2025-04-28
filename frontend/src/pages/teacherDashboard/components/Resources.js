import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

const Resources = ({ materials: initialMaterials, handleDeleteMaterial, loading: initialLoading, isDarkMode }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(initialLoading);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'notes',
    courseId: '',
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();
  // Define API_URL array for fallback
  const baseUrls = [
    process.env.REACT_APP_API_URL || 'http://localhost:5000',
    'http://localhost:5000',
    'http://localhost:5001'
  ];

  // Use both props and state for materials
  useEffect(() => {
    if (initialMaterials && initialMaterials.length > 0) {
      setMaterials(initialMaterials);
    } else {
      // If no materials provided in props, fetch them
      fetchMaterials();
    }
  }, [initialMaterials]);

  // Function to fetch materials directly
  const fetchMaterials = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      console.log("Fetching materials directly from API");

      let token = null;
      try {
        token = await currentUser.getIdToken();
        console.log("Got auth token, making request with authorization header");
      } catch (tokenError) {
        console.error("Error getting auth token for materials fetch:", tokenError);
      }

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Try each base URL until one works
      let success = false;
      let responseData = null;
      let lastError = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to fetch materials from ${baseUrl}...`);

          const response = await fetch(`${baseUrl}/api/materials`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch materials: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log(`Materials fetched from ${baseUrl}:`, data);

          if (data.success) {
            responseData = data;
            success = true;
            break; // Exit the loop if successful
          }
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
          lastError = err;
        }
      }

      if (success && responseData?.success) {
        setMaterials(responseData.materials || []);
      } else {
        console.error("Failed to fetch materials from any endpoint:", lastError);
        setErrorMessage("Failed to load materials. Please check if the backend is running on port 5000.");
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      setErrorMessage("Failed to load materials: " + error.message);
      // Set empty materials array to avoid showing loading spinner indefinitely
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher's courses for the dropdown
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!currentUser) return;

      try {
        console.log("Fetching courses for teacher:", currentUser.uid);
        setErrorMessage('');

        let token = null;
        try {
          token = await currentUser.getIdToken();
        } catch (tokenError) {
          console.error("Error getting auth token:", tokenError);
        }

        // Try each base URL until one works
        let success = false;
        let responseData = null;
        let lastError = null;

        for (const baseUrl of baseUrls) {
          try {
            console.log(`Trying to fetch courses from ${baseUrl}...`);

            const response = await fetch(`${baseUrl}/api/courses/teacher/${currentUser.uid}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              timeout: 5000
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Courses response from ${baseUrl}:`, data);

            if (data.success) {
              responseData = data;
              success = true;
              break; // Exit the loop if successful
            }
          } catch (err) {
            console.log(`Failed to connect to ${baseUrl}:`, err.message);
            lastError = err;
          }
        }

        if (success && responseData?.success) {
          setCourses(responseData.courses || []);
          // Set default courseId if courses exist
          if (responseData.courses && responseData.courses.length > 0) {
            setNewMaterial(prev => ({ ...prev, courseId: responseData.courses[0]._id }));
          }
        } else {
          console.error("Failed to fetch courses from any endpoint:", lastError);
          setErrorMessage("Failed to load courses. Please check if the backend is running on port 5000.");
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setErrorMessage("Error loading courses: " + error.message);
      }
    };

    fetchTeacherCourses();
  }, [currentUser, baseUrls]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
    // Clear any error messages when user starts typing
    setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name, file.type, file.size);
      setNewMaterial(prev => ({
        ...prev,
        file: file
      }));
      // Clear any error messages when user selects a file
      setErrorMessage('');
    }
  };

  // Custom implementation of handleDeleteMaterial if not provided by props
  const handleMaterialDelete = async (materialId) => {
    if (typeof handleDeleteMaterial === 'function') {
      // Use provided delete handler from props
      handleDeleteMaterial(materialId);
      return;
    }

    // Custom implementation
    if (!currentUser) {
      setErrorMessage("You must be logged in to delete materials");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      console.log(`Deleting material with ID ${materialId}`);

      let token = null;
      try {
        token = await currentUser.getIdToken(true);
      } catch (tokenError) {
        console.error("Error getting token for delete operation:", tokenError);
        throw new Error("Authentication error: " + tokenError.message);
      }

      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Try each base URL until one works
      let success = false;
      let responseData = null;
      let lastError = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to delete material on ${baseUrl}...`);

          const response = await fetch(`${baseUrl}/api/materials/${materialId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server error (${response.status}): ${errorData.message || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log(`Delete response from ${baseUrl}:`, data);

          if (data.success) {
            responseData = data;
            success = true;
            break; // Exit the loop if successful
          }
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
          lastError = err;
        }
      }

      if (success) {
        // Remove material from state
        setMaterials(prevMaterials => prevMaterials.filter(m => m.id !== materialId));
        setSuccessMessage("Resource deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(lastError?.message || "Failed to delete material from any endpoint");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      setErrorMessage(error.message || "An error occurred while deleting the material");
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();

    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!newMaterial.title || !newMaterial.courseId) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if the user is authenticated
      if (!currentUser) {
        throw new Error('You must be logged in to add materials');
      }

      // Prepare form data for multipart file upload
      const formData = new FormData();
      formData.append('courseId', newMaterial.courseId);
      formData.append('title', newMaterial.title);
      formData.append('description', newMaterial.description || '');
      formData.append('type', newMaterial.type || 'notes');

      // Add file if selected
      if (newMaterial.file) {
        formData.append('file', newMaterial.file);
        console.log("Adding file to form data:", newMaterial.file.name);
      }

      // Debug the contents of the FormData
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'file' ? pair[1].name : pair[1]));
      }

      // Get a fresh token
      let token = null;
      try {
        token = await currentUser.getIdToken(true); // Force refresh token
        console.log("Got fresh auth token for upload");
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        throw new Error('Authentication error: ' + tokenError.message);
      }

      if (!token) {
        throw new Error('Failed to get authentication token');
      }

      // Try uploading to each API URL until one works
      let success = false;
      let responseData = null;
      let lastError = null;

      for (const baseUrl of baseUrls) {
        try {
          console.log(`Trying to upload material to ${baseUrl}...`);

          const response = await fetch(`${baseUrl}/api/materials`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Note: Do NOT set Content-Type for FormData uploads - browser sets it automatically with boundary
            },
            body: formData,
            timeout: 10000  // Longer timeout for file uploads
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server error (${response.status}): ${errorData.message || 'Unknown error'}`);
          }

          const data = await response.json();
          console.log(`Upload response from ${baseUrl}:`, data);

          if (data.success) {
            responseData = data;
            success = true;
            break; // Exit the loop if successful
          }
        } catch (err) {
          console.log(`Failed to connect to ${baseUrl}:`, err.message);
          lastError = err;
        }
      }

      if (success && responseData?.success) {
        setSuccessMessage('Resource added successfully!');

        // Reset form
        setNewMaterial({
          title: '',
          description: '',
          type: 'notes',
          courseId: courses.length > 0 ? courses[0]._id : '',
          file: null
        });

        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        // Add the new material to state immediately
        if (responseData.material) {
          setMaterials(prevMaterials => [...prevMaterials, responseData.material]);
        }

        // Close modal after a short delay
        setTimeout(() => {
          setShowAddModal(false);
          // Refresh materials instead of reloading page
          fetchMaterials();
        }, 1500);
      } else {
        throw new Error(lastError?.message || 'Failed to add material to any endpoint');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      setErrorMessage(error.message || 'An error occurred while adding the material.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for material types
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
      case 'assignment': return 'green';
      case 'template': return 'purple';
      case 'quiz': return 'red';
      case 'lab': return 'yellow';
      case 'guide': return 'indigo';
      default: return 'gray';
    }
  };

  return (
    <div className="resources-section">
      {/* Success message outside modal */}
      {!showAddModal && successMessage && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error message outside modal */}
      {!showAddModal && errorMessage && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-0">Teaching Resources</h2>
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors w-full md:w-auto"
            onClick={() => {
              setShowAddModal(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            Add Resource
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : materials && materials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {materials.map((material) => (
              <div key={material.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-3 sm:mb-0 sm:mr-3 mx-auto sm:mx-0`} style={{ backgroundColor: material.color ? `var(--color-${material.color}-100)` : 'var(--color-gray-100)', color: material.color ? `var(--color-${material.color}-600)` : 'var(--color-gray-600)' }}>
                    {material.icon || '📄'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-center sm:text-left">{material.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center sm:text-left">{material.courseTitle || material.course}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>

                    {/* Show file details if available */}
                    {material.fileUrl && (
                      <div className="mb-3 text-sm">
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
                <div className="mt-3 flex justify-end">
                  <button
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    onClick={() => handleMaterialDelete(material.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No teaching resources yet. Add your first resource!</p>
          </div>
        )}
      </div>

      {/* Add Material Modal - Make responsive */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
               style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Add Teaching Resource</h2>

            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddMaterial}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Course</label>
                <select
                  name="courseId"
                  value={newMaterial.courseId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Resource Type</label>
                <select
                  name="type"
                  value={newMaterial.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="notes">Notes</option>
                  <option value="assignment">Assignment</option>
                  <option value="template">Template</option>
                  <option value="quiz">Quiz</option>
                  <option value="lab">Lab Exercise</option>
                  <option value="guide">Study Guide</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newMaterial.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={newMaterial.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Upload File (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supported files: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG, MP4, MP3
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    'Add Resource'
                  )}
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