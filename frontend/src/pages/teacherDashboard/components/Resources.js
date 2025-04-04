import React from 'react';

const Resources = ({ materials, handleDeleteMaterial, loading, isDarkMode }) => {
  return (
    <div className="resources-section">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6"
           style={{ backgroundColor: isDarkMode ? '#1e293b' : 'white' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Teaching Resources</h2>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-full bg-${material.color}-100 dark:bg-${material.color}-900 text-${material.color}-500 dark:text-${material.color}-300 text-xl mr-3`}>
                        {material.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{material.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{material.course}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{material.description}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 dark:text-gray-400">{material.students} Students</span>
                          <span className="text-gray-500 dark:text-gray-400">{material.lastUpdated}</span>
                        </div>
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
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
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
    </div>
  );
};

export default Resources; 