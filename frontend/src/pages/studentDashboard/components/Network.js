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

const Network = ({ currentUser, isDarkMode }) => {
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
      
      // Fetch recommendations
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
          // Calculate relevance score based on various factors
          let relevanceScore = 0;
          
          // Same program
          if (user.program === userData.program) {
            relevanceScore += 5;
          }
          
          // Same batch
          if (user.batch === userData.batch) {
            relevanceScore += 3;
          }
          
          // Shared skills
          const userSkills = Array.isArray(user.skills) ? user.skills : [];
          const currentUserSkills = Array.isArray(userData.skills) ? userData.skills : [];
          const sharedSkills = userSkills.filter(skill => 
            currentUserSkills.includes(skill)
          ).length;
          
          relevanceScore += sharedSkills * 2;
          
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
      setLoading(true);
      const result = await sendConnectionRequest(authUser.uid, userId);
      if (result.success) {
        await fetchNetworkData(); // Refresh data
      } else {
        setError(result.message || 'Failed to send connection request');
      }
    } catch (err) {
      console.error('Error sending connection request:', err);
      setError('Failed to send connection request');
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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  const getRandomColor = (id) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    
    // Use the id to deterministically pick a color
    const index = id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length || 0;
    return colors[index];
  };

  const renderPersonCard = (person) => {
    const isPendingIncoming = pendingRequests.incoming.some(req => req.sender.id === person.id);
    const isPendingOutgoing = pendingRequests.outgoing.some(req => req.recipient.id === person.id);
    const isConnected = connections.some(conn => conn.id === person.id);
    
    // Convert skills to array if it exists, otherwise use empty array
    const skills = Array.isArray(person.skills) ? person.skills : 
                  (typeof person.skills === 'string' ? person.skills.split(',').map(s => s.trim()) : []);
    
    return (
      <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <img
            src={person.photoURL || '/default-avatar.png'}
            alt={person.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {person.name || person.displayName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {person.role} • {person.program || 'No program specified'}
            </p>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {isPendingIncoming && (
              <>
                <button
                  onClick={() => handleAccept(pendingRequests.incoming.find(req => req.sender.id === person.id).id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(pendingRequests.incoming.find(req => req.sender.id === person.id).id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Decline
                </button>
              </>
            )}
            {isPendingOutgoing && (
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Request Pending
              </span>
            )}
            {!isPendingIncoming && !isPendingOutgoing && !isConnected && (
              <button
                onClick={() => handleConnect(person.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Connect
              </button>
            )}
            {isConnected && (
              <span className="px-4 py-2 text-sm text-green-600 dark:text-green-400">
                Connected
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Network</h1>
            <p className="text-gray-600 dark:text-gray-400">Connect with alumni, students, and teachers</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('connections')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              My Connections ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Recommended ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              } relative`}
            >
              Pending Requests
              {pendingRequests.incoming.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {pendingRequests.incoming.length}
                </span>
              )}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Connection Lists */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'connections' && (
                connections.length > 0 ? (
                  connections.filter(person => 
                    person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    person.role?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(renderPersonCard)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">👥</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with anyone yet.</p>
                    <button 
                      onClick={() => setActiveTab('recommendations')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Find People to Connect With
                    </button>
                  </div>
                )
              )}

              {activeTab === 'recommendations' && (
                recommendations.length > 0 ? (
                  recommendations.filter(person =>
                    person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    person.role?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(renderPersonCard)
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-400 text-5xl mb-4">🔍</div>
                    <p className="text-gray-600 dark:text-gray-400">No recommendations available at the moment.</p>
                  </div>
                )
              )}

              {activeTab === 'pending' && (
                <>
                  {/* Incoming Requests */}
                  {pendingRequests.incoming.length > 0 && (
                    <div className="col-span-full mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Incoming Requests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingRequests.incoming.filter(request =>
                          request.sender.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.sender.role?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(request => renderPersonCard({ ...request.sender, isPendingIncoming: true, requestId: request.id }))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing Requests */}
                  {pendingRequests.outgoing.length > 0 && (
                    <div className="col-span-full">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Outgoing Requests</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingRequests.outgoing.filter(request =>
                          request.recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.recipient.role?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(request => renderPersonCard({ ...request.recipient, isPendingOutgoing: true }))}
                      </div>
                    </div>
                  )}

                  {/* No Pending Requests */}
                  {pendingRequests.incoming.length === 0 && pendingRequests.outgoing.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">✓</div>
                      <p className="text-gray-600 dark:text-gray-400">You don't have any pending connection requests.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;