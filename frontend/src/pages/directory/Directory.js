import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AlumniDirectory from './alumniDirectory/AlumniDirectory';
import TeacherDirectory from './teacherDirectory/TeacherDirectory';
import StudentDirectory from './studentDirectory/StudentDirectory';
import './Directory.css';

const Directory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // Set active tab based on current route
    if (location.pathname.includes('teacher')) return 'teacher';
    if (location.pathname.includes('student')) return 'student';
    return 'alumni'; // Default to alumni
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'alumni') {
      navigate('/directory/alumni');
    } else if (tab === 'teacher') {
      navigate('/directory/teacher');
    } else if (tab === 'student') {
      navigate('/directory/student');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Directory</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Connect with alumni, teachers, and students from our community
          </p>
        </header>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => handleTabClick('alumni')}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === 'alumni'
                    ? 'text-primary dark:text-primary-light border-b-2 border-primary dark:border-primary-light'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Alumni
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => handleTabClick('teacher')}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === 'teacher'
                    ? 'text-secondary dark:text-secondary-light border-b-2 border-secondary dark:border-secondary-light'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Teachers
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => handleTabClick('student')}
                className={`inline-block py-4 px-4 text-sm font-medium ${
                  activeTab === 'student'
                    ? 'text-tertiary dark:text-tertiary-light border-b-2 border-tertiary dark:border-tertiary-light'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Students
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === 'alumni' && <AlumniDirectory />}
          {activeTab === 'teacher' && <TeacherDirectory />}
          {activeTab === 'student' && <StudentDirectory />}
        </div>
      </div>
    </div>
  );
};

export default Directory; 