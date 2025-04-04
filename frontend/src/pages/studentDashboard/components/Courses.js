import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const Courses = ({ currentUser, isDarkMode }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  
  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const coursesRef = collection(db, 'enrollments');
        const q = query(
          coursesRef,
          where('studentId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const enrollmentsList = [];
        
        querySnapshot.forEach((doc) => {
          enrollmentsList.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        // Fetch course details for each enrollment
        const coursePromises = enrollmentsList.map(async (enrollment) => {
          const courseRef = collection(db, 'courses');
          const courseQuery = query(
            courseRef,
            where('courseId', '==', enrollment.courseId)
          );
          
          const courseSnapshot = await getDocs(courseQuery);
          if (!courseSnapshot.empty) {
            const courseData = courseSnapshot.docs[0].data();
            return {
              ...courseData,
              id: courseSnapshot.docs[0].id,
              enrollmentId: enrollment.id,
              enrollmentDate: enrollment.enrollmentDate,
              progress: enrollment.progress || 0,
              grade: enrollment.grade,
              status: enrollment.status || 'active',
            };
          }
          return null;
        });
        
        const coursesList = (await Promise.all(coursePromises)).filter(Boolean);
        setCourses(coursesList);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [currentUser]);
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'current') {
      return matchesSearch && course.status === 'active';
    } else if (activeTab === 'completed') {
      return matchesSearch && course.status === 'completed';
    } else if (activeTab === 'upcoming') {
      return matchesSearch && course.status === 'upcoming';
    }
    
    return matchesSearch;
  });
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const getCourseStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Current';
      case 'completed':
        return 'Completed';
      case 'upcoming':
        return 'Upcoming';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="courses-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Courses</h2>
        
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'current' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('current')}
              >
                Current
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'completed' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'upcoming' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
            </div>
          </div>
        </div>
        
        {/* Courses List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? "No courses match your search" 
                : activeTab === 'all' 
                  ? "You are not enrolled in any courses yet" 
                  : `You don't have any ${activeTab} courses`
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-32 bg-blue-500 flex items-center justify-center"
                    style={{ 
                      backgroundImage: course.imageUrl ? `url(${course.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!course.imageUrl && (
                      <span className="text-white text-xl font-bold">
                        {course.courseCode || course.title?.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(course.status)}`}>
                        {getCourseStatusText(course.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {course.courseCode} • {course.instructor}
                    </p>
                    
                    {course.status === 'active' && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex justify-between">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {course.status === 'completed' && course.grade && (
                      <div className="mt-3 flex items-center">
                        <span className="text-gray-600 dark:text-gray-300 text-sm mr-2">Final Grade:</span>
                        <span className="font-bold text-gray-800 dark:text-white">{course.grade}</span>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <button
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        {course.status === 'active' ? 'Go to Course' : 
                         course.status === 'completed' ? 'View Details' :
                         'View Syllabus'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses; 