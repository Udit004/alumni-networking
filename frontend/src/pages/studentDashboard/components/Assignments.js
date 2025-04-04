import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const Assignments = ({ currentUser, isDarkMode }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        // First get all the courses the student is enrolled in
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(
          enrollmentsRef,
          where('studentId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const courseIds = [];
        
        enrollmentsSnapshot.forEach((doc) => {
          const enrollment = doc.data();
          if (enrollment.courseId) {
            courseIds.push(enrollment.courseId);
          }
        });
        
        if (courseIds.length === 0) {
          setAssignments([]);
          setLoading(false);
          return;
        }
        
        // Then fetch all assignments for these courses
        const assignmentsRef = collection(db, 'assignments');
        const assignmentsQuery = query(
          assignmentsRef,
          where('courseId', 'in', courseIds),
          orderBy('dueDate', 'asc')
        );
        
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const assignmentsList = [];
        
        // Get submission status for each assignment
        const submissionsPromises = [];
        
        assignmentsSnapshot.forEach((doc) => {
          const assignment = {
            id: doc.id,
            ...doc.data(),
            status: 'not_submitted' // Default status
          };
          
          // Get submission for this assignment
          const submissionPromise = (async () => {
            const submissionsRef = collection(db, 'submissions');
            const submissionQuery = query(
              submissionsRef,
              where('assignmentId', '==', doc.id),
              where('studentId', '==', currentUser.uid)
            );
            
            const submissionSnapshot = await getDocs(submissionQuery);
            
            if (!submissionSnapshot.empty) {
              const submission = submissionSnapshot.docs[0].data();
              assignment.submission = {
                id: submissionSnapshot.docs[0].id,
                ...submission
              };
              
              if (submission.submitted) {
                assignment.status = submission.graded ? 'graded' : 'submitted';
                assignment.grade = submission.grade;
                assignment.feedback = submission.feedback;
              }
            }
            
            assignmentsList.push(assignment);
          })();
          
          submissionsPromises.push(submissionPromise);
        });
        
        await Promise.all(submissionsPromises);
        
        // Sort assignments by due date and status
        assignmentsList.sort((a, b) => {
          const aDate = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
          const bDate = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
          
          // First sort by status (not submitted, then submitted, then graded)
          if (a.status !== b.status) {
            if (a.status === 'not_submitted') return -1;
            if (b.status === 'not_submitted') return 1;
            if (a.status === 'submitted') return -1;
            if (b.status === 'submitted') return 1;
          }
          
          // Then sort by due date
          return aDate - bDate;
        });
        
        setAssignments(assignmentsList);
        setError(null);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [currentUser]);
  
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadge = (assignment) => {
    const dueDate = assignment.dueDate?.toDate ? assignment.dueDate.toDate() : new Date(assignment.dueDate);
    const now = new Date();
    
    if (assignment.status === 'graded') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
          Graded
        </span>
      );
    } else if (assignment.status === 'submitted') {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
          Submitted
        </span>
      );
    } else if (dueDate < now) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs">
          Overdue
        </span>
      );
    } else {
      // Calculate days remaining
      const daysRemaining = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 2) {
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
            Due Soon
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-xs">
            Pending
          </span>
        );
      }
    }
  };
  
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') {
      return matchesSearch;
    } else if (statusFilter === 'pending') {
      return matchesSearch && assignment.status === 'not_submitted';
    } else if (statusFilter === 'submitted') {
      return matchesSearch && assignment.status === 'submitted';
    } else if (statusFilter === 'graded') {
      return matchesSearch && assignment.status === 'graded';
    }
    
    return matchesSearch;
  });

  return (
    <div className="assignments-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Assignments</h2>
        
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search assignments..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'pending' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'submitted' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setStatusFilter('submitted')}
              >
                Submitted
              </button>
              <button 
                className={`px-4 py-2 rounded-lg ${
                  statusFilter === 'graded' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => setStatusFilter('graded')}
              >
                Graded
              </button>
            </div>
          </div>
        </div>
        
        {/* Assignments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              {error}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? "No assignments match your search" 
                : statusFilter !== 'all' 
                  ? `You don't have any ${statusFilter} assignments` 
                  : "You don't have any assignments"
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAssignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                        {getStatusBadge(assignment)}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {assignment.courseName || 'Course'} • {assignment.courseCode || 'Code'}
                      </p>
                      
                      {assignment.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      
                      <div className="mt-2 flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Due: </span>
                          <span className="text-gray-800 dark:text-white">{formatDate(assignment.dueDate)}</span>
                        </div>
                        
                        {assignment.points && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Points: </span>
                            <span className="text-gray-800 dark:text-white">{assignment.points}</span>
                          </div>
                        )}
                        
                        {assignment.status === 'graded' && assignment.grade && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Grade: </span>
                            <span className="text-gray-800 dark:text-white font-medium">{assignment.grade}/{assignment.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          assignment.status === 'graded' || assignment.status === 'submitted'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {assignment.status === 'graded' ? 'View Feedback' : 
                         assignment.status === 'submitted' ? 'View Submission' : 
                         'Submit'}
                      </button>
                      
                      <button
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg"
                      >
                        Details
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

export default Assignments; 