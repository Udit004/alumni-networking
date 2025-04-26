import axios from 'axios';
import API_URLS, { DEFAULT_TIMEOUT } from '../config/apiConfig';

/**
 * Get all courses created by a teacher
 * @param {string} token - Firebase auth token
 * @returns {Promise<Array>} - List of courses
 */
export const getTeacherCourses = async (token) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/teacher`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }
};

/**
 * Get students enrolled in a specific course
 * @param {string} token - Firebase auth token
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - List of students
 */
export const getCourseStudents = async (token, courseId) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/${courseId}/students`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching students for course ${courseId}:`, error);
    return [];
  }
};

/**
 * Get all students enrolled in any of the teacher's courses
 * @param {string} token - Firebase auth token
 * @returns {Promise<Array>} - List of students with course info
 */
export const getAllCourseStudents = async (token) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/students`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching all course students:', error);
    return [];
  }
};

/**
 * Get course applications for a specific course
 * @param {string} token - Firebase auth token
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - List of applications
 */
export const getCourseApplications = async (token, courseId) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/applications/${courseId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching applications for course ${courseId}:`, error);
    return [];
  }
};

/**
 * Get all course applications for a teacher
 * @param {string} token - Firebase auth token
 * @returns {Promise<Array>} - List of applications
 */
export const getAllCourseApplications = async (token) => {
  try {
    const response = await axios.get(
      `${API_URLS.courses}/applications`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching all course applications:', error);
    return [];
  }
};

/**
 * Update course application status
 * @param {string} token - Firebase auth token
 * @param {string} applicationId - Application ID
 * @param {string} status - New status (approved/rejected)
 * @returns {Promise<Object>} - Updated application
 */
export const updateCourseApplicationStatus = async (token, applicationId, status) => {
  try {
    const response = await axios.put(
      `${API_URLS.courses}/applications/${applicationId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: DEFAULT_TIMEOUT
      }
    );
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating application ${applicationId} status:`, error);
    return null;
  }
};
