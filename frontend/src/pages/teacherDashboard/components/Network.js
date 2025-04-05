import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';
import { 
  getConnectionRequests, 
  getUserConnections, 
  sendConnectionRequest, 
  acceptConnectionRequest, 
  rejectConnectionRequest 
} from '../../../services/connectionService';

const TeacherNetwork = ({ currentUser, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser: authUser } = useAuth();
  
  useEffect(() => {
    if (authUser?.uid) {
      fetchNetworkData();
    }
  }, [authUser]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's connections
      const userConnections = await getUserConnections(authUser.uid);
      setConnections(userConnections);
      
      // Get connection requests
      const requests = await getConnectionRequests(authUser.uid);
      setPendingRequests(requests);
      
      // Fetch recommendations - teachers might be interested in connecting with other teachers
      // and students in their department
      const recommendationsQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['student', 'teacher', 'alumni'])
      );
      
      const recommendationsSnapshot = await getDocs(recommendationsQuery);
      const recommendationsData = [];
      
      const currentUserDoc = await getDoc(doc(db, 'users', authUser.uid));
      const userData = currentUserDoc.data();
      
      recommendationsSnapshot.forEach((doc) => {
        const user = { id: doc.id, ...doc.data() };
        
        // Skip if it's the current user, already connected, or has pending request
        const isCurrentUser = doc.id === authUser.uid;
        const isConnected = userConnections.some(conn => conn.id === doc.id);
        const hasPendingRequest = requests.incoming.some(req => req.sender.id === doc.id) || 
                                requests.outgoing.some(req => req.recipient.id === doc.id);
        
        if (!isCurrentUser && !isConnected && !hasPendingRequest) {
          // Calculate relevance score based on various factors relevant to teachers
          let relevanceScore = 0;
          
          // Same department
          if (user.department === userData.department) {
            relevanceScore += 5;
          }
          
          // Same institution
          if (user.institution === userData.institution) {
            relevanceScore += 3;
          }
          
          // Teachers might be interested in students in their department
          if (user.role === 'student' && user.department === userData.department) {
            relevanceScore += 4;
          }
          
          // Teachers might be interested in connecting with alumni from their department
          if (user.role === 'alumni' && user.department === userData.department) {
            relevanceScore += 4;
          }
          
          // Shared subjects/expertise
          const userExpertise = Array.isArray(user.expertise) ? user.expertise : [];
          const currentUserExpertise = Array.isArray(userData.expertise) ? userData.expertise : [];
          const sharedExpertise = userExpertise.filter(exp => 
            currentUserExpertise.includes(exp)
          ).length;
          
          relevanceScore += sharedExpertise * 2;
          
          recommendationsData.push({
            ...user,
            relevanceScore,
            photoURL: user.photoURL || '/default-avatar.png'
          });
        }
      });
      
      // Sort recommendations by relevance score
      recommendationsData.sort((a, b) => b.relevanceScore - a.relevanceScore);
      setRecommendations(recommendationsData);
      
    } catch (err) {
      console.error('Error fetching network data:', err);
      setError('Failed to load network data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      if (!authUser) {
        setError("You must be logged in to send connection requests");
        return;
      }

      setLoading(true);
      console.log(`Sending connection request from ${authUser.uid} to ${userId}`);
      
      const result = await sendConnectionRequest(authUser.uid, userId);
      
      if (result.success) {
        console.log('Connection request sent successfully:', result);
        
        // Show success message to user
        alert('Connection request sent successfully!');
        
        // Refresh network data to show updated status
        await fetchNetworkData();
      } else {
        console.error('Failed to send connection request:', result);
        setError(result.message || 'Failed to send connection request');
        alert(result.message || 'Failed to send connection request. Please try again.');
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      setError('Failed to send connection request: ' + (err.message || 'Unknown error'));
      alert('Failed to send connection request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoading(true);
      await acceptConnectionRequest(requestId);
      await fetchNetworkData(); // Refresh data
    } catch (err) {
      console.error('Error accepting connection request:', err);
      setError('Failed to accept connection request');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setLoading(true);
      await rejectConnectionRequest(requestId);
      await fetchNetworkData(); // Refresh data
    } catch (err) {
      console.error('Error declining connection request:', err);
      setError('Failed to decline connection request');
    } finally {
      setLoading(false);
    }
  };

  // Generate a unique identifier for each card based on context
  const generateUniqueId = (person, context) => {
    if (!person || !person.id) return `unknown-${Math.random()}`;
    return `${person.id}-${context}-${Math.random().toString(36).substring(7)}`;
  };

  // Render a person card for connections, recommendations, or requests
  const renderPersonCard = (person, context = 'connection', requestId = null) => {
    if (!person) return null;
    
    // Use a unique key for each card to avoid React warnings
    const cardKey = generateUniqueId(person, context);
    
    // Determine the status of this person in relation to the current user
    const isIncomingRequest = context === 'incoming';
    const isOutgoingRequest = context === 'outgoing';
    const isConnection = context === 'connection';
    
    // Format expertise/skills for display
    const expertise = Array.isArray(person.expertise) 
      ? person.expertise 
      : (Array.isArray(person.skills) 
        ? person.skills 
        : (typeof person.expertise === 'string' 
          ? person.expertise.split(',').map(e => e.trim()) 
          : []));
    
    return (
      <div key={cardKey} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {person.photoURL ? (
              <img
                src={person.photoURL}
                alt={person.name || "User"}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-offset-2 ring-blue-100 dark:ring-blue-900 flex-shrink-0"
              />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0 bg-blue-500`}>
                {(person.name?.charAt(0) || person.displayName?.charAt(0) || '?').toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {person.name || person.displayName || "Unknown User"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="capitalize">{person.role || "User"}</span>
                {person.department && ` • ${person.department}`}
                {person.institution && ` (${person.institution})`}
              </p>
              
              {expertise.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {expertise.slice(0, 3).map((skill, index) => (
                    <span
                      key={`${cardKey}-skill-${index}`}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {expertise.length > 3 && (
                    <span className="px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      +{expertise.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            {isIncomingRequest && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(requestId)}
                  className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(requestId)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Decline
                </button>
              </div>
            )}
            
            {isOutgoingRequest && (
              <span className="px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Pending
              </span>
            )}
            
            {!isIncomingRequest && !isOutgoingRequest && !isConnection && (
              <button
                onClick={() => handleConnect(person.id)}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Connect
              </button>
            )}
            
            {isConnection && (
              <span className="px-4 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Connected
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Network</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with students, alumni and fellow educators</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'connections'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Recommended ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } relative`}
            >
              Pending Requests
              {pendingRequests.incoming.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full absolute -top-1 -right-1">
                  {pendingRequests.incoming.length}
                </span>
              )}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Content based on active tab */}
          {!loading && !error && (
            <div className="space-y-6">
              {/* Connections Tab */}
              {activeTab === 'connections' && (
                <div>
                  {connections.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {connections
                        .filter(person => 
                          (person.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                        )
                        .map(person => renderPersonCard(person, 'connection'))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No connections yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">Start building your professional network by connecting with students, alumni, and other educators.</p>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                      >
                        Browse Recommendations
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div>
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {recommendations
                        .filter(person => 
                          (person.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                        )
                        .map(person => renderPersonCard(person, 'recommendation'))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-blue-50 dark:bg-blue-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No recommendations</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">We'll show you relevant connections as more users join the platform.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pending Requests Tab */}
              {activeTab === 'pending' && (
                <div className="space-y-8">
                  {/* Incoming Requests */}
                  {pendingRequests.incoming.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-1">Incoming Requests</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {pendingRequests.incoming
                          .filter(request => 
                            (request.sender.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.sender.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.sender.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                          .map(request => renderPersonCard(request.sender, 'incoming', request.id))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing Requests */}
                  {pendingRequests.outgoing.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 px-1">Outgoing Requests</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {pendingRequests.outgoing
                          .filter(request => 
                            (request.recipient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.recipient.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.recipient.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                          .map(request => renderPersonCard(request.recipient, 'outgoing', request.id))}
                      </div>
                    </div>
                  )}

                  {/* No Pending Requests */}
                  {pendingRequests.incoming.length === 0 && pendingRequests.outgoing.length === 0 && (
                    <div className="text-center py-16">
                      <div className="bg-green-50 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">You don't have any pending connection requests at the moment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNetwork;