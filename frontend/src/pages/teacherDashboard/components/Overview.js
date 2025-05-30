import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { API_URLS, DEFAULT_TIMEOUT } from '../../../config/apiConfig';
import { getTeacherCourses, getUserEvents } from '../../../services/firestoreFallbackService';

const Overview = ({ connections = [], studentConnections = [], alumniConnections = [], teacherConnections = [], isDarkMode, handleRequestConnection }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [coursesCount, setCoursesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API endpoints are now defined in the apiConfig.js file

  // Fetch courses count
  const fetchCoursesCount = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      let success = false;
      let responseData = null;

      try {
        console.log(`Trying to fetch courses count from ${API_URLS.courses}...`);
        const token = await currentUser.getIdToken();
        const response = await axios.get(
          `${API_URLS.courses}/teacher/${currentUser.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: DEFAULT_TIMEOUT
          }
        );

        console.log(`Response from API:`, response.data);
        responseData = response.data;
        success = true;
      } catch (err) {
        console.log(`Failed to connect to API:`, err.message);

        // Try Firestore fallback
        console.log('Using Firestore fallback for courses...');
        const courses = await getTeacherCourses(currentUser.uid);
        console.log('Courses from Firestore:', courses);
        setCoursesCount(courses.length);
        success = true;
      }

      if (!success) {
        // If both API and Firestore failed, set a default value
        console.log('Using default value for courses count');
        setCoursesCount(0);
      } else if (success && responseData?.success) {
        setCoursesCount(responseData.courses?.length || 0);
      }
    } catch (err) {
      console.error('Error fetching courses count:', err);
      // Don't show error to user, just use 0
      setCoursesCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch events count - only count events created by this user
  const fetchEventsCount = useCallback(async () => {
    if (!currentUser) return;

    // Log current user info for debugging
    console.log('Current user:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });

    try {
      setLoading(true);
      let success = false;
      let responseData = null;

      try {
        console.log(`Trying to fetch events count from ${API_URLS.events}...`);
        const token = await currentUser.getIdToken();

        // Use the same endpoint as in TeacherDashboard.js
        const response = await axios.get(
          `${API_URLS.events}/user/${currentUser.uid}?firebaseUID=${currentUser.uid}&role=teacher`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: DEFAULT_TIMEOUT
          }
        );
        console.log(`Response from API:`, response.data);
        responseData = response.data;
        success = true;
      } catch (err) {
        console.log(`Failed to connect to API:`, err.message);

        // Try Firestore fallback
        console.log('Using Firestore fallback for events...');
        const events = await getUserEvents(currentUser.uid, 'teacher');
        console.log('Events from Firestore:', events);

        // Filter events created by the current user
        const userEvents = events.filter(event => {
          return (
            // Check creator fields
            event.createdBy === currentUser.uid ||
            event.creator === currentUser.uid ||
            event.userId === currentUser.uid ||
            event.teacherId === currentUser.uid ||
            // Check by name if available
            (event.host && currentUser.displayName &&
             event.host.toLowerCase().includes(currentUser.displayName.toLowerCase()))
          );
        });

        console.log('Filtered events created by current user:', userEvents);
        setEventsCount(userEvents.length);
        success = true;
      }

      if (!success) {
        // If both API and Firestore failed, set a default value
        console.log('Using default value for events count');
        setEventsCount(0);
      } else if (success && responseData) {
        // Extract events array from the response
        if (responseData.createdEvents) {
          console.log('Using createdEvents from response, count:', responseData.createdEvents.length);
          setEventsCount(responseData.createdEvents.length);
        } else if (responseData.events) {
          console.log('Using events from response, count:', responseData.events.length);
          setEventsCount(responseData.events.length);
        } else {
          console.log('Could not extract events from response, using default value');
          setEventsCount(0);
        }
      }
    } catch (err) {
      console.error('Error fetching events count:', err);
      // Don't show error to user, just use 0
      setEventsCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Call the fetch functions when the component mounts
  useEffect(() => {
    if (currentUser) {
      fetchCoursesCount();
      fetchEventsCount();
    }
  }, [currentUser, fetchCoursesCount, fetchEventsCount]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stats cards */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">🔗</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connections</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">👥</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Students</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{studentConnections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? <span className="text-sm text-gray-500">Loading...</span> : coursesCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">📅</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Events</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {loading ? <span className="text-sm text-gray-500">Loading...</span> : eventsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connections Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Connections</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Find Connections</span> 🔍
            </button>
          </div>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with any students or alumni yet.</p>
            <button
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Browse Directory
            </button>
          </div>
        ) : (
          <div>
            {/* Student Connections */}
            {studentConnections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Student Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentConnections.map((student) => (
                    <div
                      key={student.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/directory/student/${student.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white overflow-hidden">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            student.name?.charAt(0).toUpperCase() || "S"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{student.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {student.program} {student.batch && `Batch ${student.batch}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(student.skills) && student.skills.slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(student.skills) && student.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                +{student.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alumni Connections */}
            {alumniConnections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Alumni Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alumniConnections.map((alumni) => (
                    <div
                      key={alumni.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/directory/alumni/${alumni.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
                          {alumni.photoURL ? (
                            <img src={alumni.photoURL} alt={alumni.name} className="h-full w-full object-cover" />
                          ) : (
                            alumni.name?.charAt(0).toUpperCase() || "A"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{alumni.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alumni.company && `${alumni.company}`} {alumni.jobTitle && `- ${alumni.jobTitle}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(alumni.skills) && alumni.skills.slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(alumni.skills) && alumni.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                +{alumni.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Connections */}
            {teacherConnections.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Teacher Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teacherConnections.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/directory/teacher/${teacher.id}`)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-white overflow-hidden">
                          {teacher.photoURL ? (
                            <img src={teacher.photoURL} alt={teacher.name} className="h-full w-full object-cover" />
                          ) : (
                            teacher.name?.charAt(0).toUpperCase() || "T"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{teacher.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {teacher.department && `${teacher.department}`} {teacher.institution && `- ${teacher.institution}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(teacher.expertise) && teacher.expertise.slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(teacher.expertise) && teacher.expertise.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                +{teacher.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Connections */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Suggested Connections</h2>
          <button
            onClick={() => navigate('/directory')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>View All</span> 🔍
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fetch and display suggested connections from the Network component */}
            {connections.length === 0 ? (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No suggested connections available at the moment.</p>
                <button
                  onClick={() => navigate('/directory')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Browse Directory
                </button>
              </div>
            ) : (
              // Display up to 3 connections as suggestions
              connections.filter(conn => conn && conn.id).slice(0, 3).map((connection) => {
                // Determine the connection type based on role
                const connectionType = connection.role === 'student' ? 'student' :
                                      connection.role === 'alumni' ? 'alumni' : 'teacher';

                // Set appropriate colors based on connection type
                const bgColor = connectionType === 'student' ? 'bg-green-500' :
                              connectionType === 'alumni' ? 'bg-blue-500' : 'bg-purple-500';

                const tagBgColor = connectionType === 'student' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                connectionType === 'alumni' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';

                // Get skills or expertise safely
                const skills = connection.skills || connection.expertise || [];
                const skillsArray = Array.isArray(skills) ? skills : [];

                return (
                  <div key={connection.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                      <div className={`h-20 w-20 rounded-full ${bgColor} flex items-center justify-center text-white text-2xl overflow-hidden mb-3`}>
                        {connection.photoURL ? (
                          <img src={connection.photoURL} alt={connection.name || 'User'} className="h-full w-full object-cover" />
                        ) : (
                          (connection.name?.charAt(0) || 'U').toUpperCase()
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{connection.name || 'User'}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {connectionType === 'student' ? (
                          `${connection.program || 'Student'} ${connection.batch ? `Batch ${connection.batch}` : ''}`
                        ) : connectionType === 'alumni' ? (
                          `${connection.company || 'Alumni'} ${connection.jobTitle ? `- ${connection.jobTitle}` : ''}`
                        ) : (
                          `${connection.department || 'Teacher'} ${connection.institution ? `- ${connection.institution}` : ''}`
                        )}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {skillsArray.slice(0, 2).map((skill, index) => (
                          <span
                            key={index}
                            className={`px-2 py-0.5 ${tagBgColor} rounded-full text-xs`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleRequestConnection(connection.id)}
                        className={`w-full py-1.5 ${bgColor} hover:opacity-90 text-white rounded-lg transition-colors text-sm`}
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;