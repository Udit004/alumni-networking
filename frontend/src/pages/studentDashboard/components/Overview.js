import React from 'react';
import ActivityList from '../../../components/ActivityList';

const Overview = ({ connections = [], courseCount = 0, isDarkMode, navigate, jobApplicationsCount = 0, mentorshipsCount = 0, upcomingEventsCount = 0 }) => {
  // Filter connections by role
  const alumniConnections = connections?.filter(conn => conn.role === "alumni") || [];
  const teacherConnections = connections?.filter(conn => conn.role === "teacher") || [];
  const studentConnections = connections?.filter(conn => conn.role === "student") || [];

  // Debug logs for all counters
  console.log('Overview - Job Applications Count:', jobApplicationsCount);
  console.log('Overview - Mentorship Applications Count:', mentorshipsCount);
  console.log('Overview - Course Count:', courseCount);
  console.log('Overview - Upcoming Events Count:', upcomingEventsCount);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Enrolled Events Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300 text-xl mr-4">📅</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Upcoming Events</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{upcomingEventsCount}</p>
            </div>
          </div>
        </div>

        {/* Connections Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-500 dark:text-indigo-300 text-xl mr-4">🔗</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Connections</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{connections?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Mentorship Courses Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300 text-xl mr-4">🎓</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Mentorships Applied</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{mentorshipsCount}</p>
            </div>
          </div>
        </div>

        {/* Jobs Applied Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300 text-xl mr-4">💼</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Jobs Applied</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{jobApplicationsCount}</p>
            </div>
          </div>
        </div>

        {/* Courses Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all hover:shadow-lg"
             style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300 text-xl mr-4">📚</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Courses</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{courseCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Users Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">My Network</h2>
          <button
            onClick={() => navigate('/directory')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>Find Connections</span> 🔍
          </button>
        </div>

        {connections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with anyone yet.</p>
            <button
              onClick={() => navigate('/directory')}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Browse Directory
            </button>
          </div>
        ) : (
          <div>
            {/* Alumni Connections */}
            {alumniConnections.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Alumni Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {alumniConnections.slice(0, 3).map((alumni) => (
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
                            {alumni.jobTitle} {alumni.company && `at ${alumni.company}`}
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
                  {alumniConnections.length > 3 && (
                    <div
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => navigate('/network')}
                    >
                      <span className="text-blue-500 dark:text-blue-300 font-medium">
                        +{alumniConnections.length - 3} more alumni
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Teacher Connections */}
            {teacherConnections.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Teacher Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {teacherConnections.slice(0, 3).map((teacher) => (
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
                            {teacher.department} {teacher.institution && `at ${teacher.institution}`}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.isArray(teacher.skills) && teacher.skills.slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(teacher.skills) && teacher.skills.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                                +{teacher.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {teacherConnections.length > 3 && (
                    <div
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => navigate('/network')}
                    >
                      <span className="text-purple-500 dark:text-purple-300 font-medium">
                        +{teacherConnections.length - 3} more teachers
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student Connections */}
            {studentConnections.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Student Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studentConnections.slice(0, 3).map((student) => (
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
                  {studentConnections.length > 3 && (
                    <div
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => navigate('/network')}
                    >
                      <span className="text-green-500 dark:text-green-300 font-medium">
                        +{studentConnections.length - 3} more students
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activities</h2>

        {/* Use the ActivityList component */}
        <ActivityList
          limit={5}
          showMarkAllRead={true}
          showEmpty={true}
          emptyMessage="No recent activities yet. Start exploring courses, jobs, and events!"
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default Overview;