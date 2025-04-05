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

const AlumniNetwork = ({ currentUser, isDarkMode }) => {
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
      
      // Fetch recommendations - alumni might be interested in connecting with other alumni in similar industries
      // current students from their alma mater, and professors from their field
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
          // Calculate relevance score based on various factors relevant to alumni
          let relevanceScore = 0;
          
          // Same company
          if (user.company === userData.company) {
            relevanceScore += 5;
          }
          
          // Same industry
          if (user.industry === userData.industry) {
            relevanceScore += 4;
          }
          
          // Same alma mater
          if (user.institution === userData.institution) {
            relevanceScore += 3;
          }
          
          // Alumni might be interested in connecting with current students from their program
          if (user.role === 'student' && user.program === userData.program) {
            relevanceScore += 4;
          }
          
          // Alumni might be interested in connecting with teachers from their field
          if (user.role === 'teacher' && user.department === userData.department) {
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

  // Generate a unique ID for each card to prevent duplicate key issues
  const generateCardId = (person, type) => {
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `${person.id}-${type}-${randomSuffix}`;
  };
  
  // Render person card for different contexts (connection, recommendation, request)
  const renderPersonCard = (person, cardType, requestId = null) => {
    if (!person) return null;
    
    // Create a unique key for this card instance
    const uniqueCardId = generateCardId(person, cardType);
    
    // Extract profile data
    const name = person.name || person.displayName || 'Unknown User';
    const role = person.role ? `${person.role.charAt(0).toUpperCase()}${person.role.slice(1)}` : 'User';
    const company = person.company || '';
    const position = person.position || person.jobTitle || '';
    const program = person.program || '';
    const institution = person.institution || '';
    
    // Format skills/expertise for display
    const skills = Array.isArray(person.skills) 
      ? person.skills 
      : (typeof person.skills === 'string' 
        ? person.skills.split(',').map(s => s.trim()) 
        : []);
    
    // Determine card actions based on context
    const isConnection = cardType === 'connection';
    const isIncoming = cardType === 'incoming';
    const isOutgoing = cardType === 'outgoing';
    
    return (
      <div key={uniqueCardId} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          {/* Profile image or avatar */}
          <div className="flex-shrink-0">
            {person.photoURL ? (
              <img
                src={person.photoURL}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
              />
            ) : (
              <div className={`w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold`}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {name}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {role}
              {position && ` • ${position}`}
              {company && ` at ${company}`}
            </p>
            
            {(program || institution) && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {program && `${program}`}
                {program && institution && ` - `}
                {institution && `${institution}`}
              </p>
            )}
            
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={`${uniqueCardId}-skill-${index}`}
                    className="px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                    +{skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Connection actions */}
          <div className="flex flex-col gap-2">
            {isIncoming && (
              <>
                <button
                  onClick={() => handleAccept(requestId)}
                  className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(requestId)}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Decline
                </button>
              </>
            )}
            
            {isOutgoing && (
              <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded">
                Pending
              </span>
            )}
            
            {!isIncoming && !isOutgoing && !isConnection && (
              <button
                onClick={() => handleConnect(person.id)}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Connect
              </button>
            )}
            
            {isConnection && (
              <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded">
                Connected
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
      <div className="max-w-full mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alumni Network</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with fellow alumni, current students, and faculty
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, company or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
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

          {/* Content */}
          {!loading && !error && (
            <div className="space-y-6">
              {/* Connections Tab */}
              {activeTab === 'connections' && (
                <div>
                  {connections.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {connections
                        .filter(person => 
                          (person.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                        )
                        .map(person => renderPersonCard(person, 'connection'))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">👥</div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with anyone yet.</p>
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {recommendations
                        .filter(person => 
                          (person.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (person.position?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                        )
                        .map(person => renderPersonCard(person, 'recommendation'))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">🔍</div>
                      <p className="text-gray-600 dark:text-gray-400">No recommendations available at the moment.</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Incoming Requests</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {pendingRequests.incoming
                          .filter(request => 
                            (request.sender.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.sender.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.sender.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                          .map(request => renderPersonCard(request.sender, 'incoming', request.id))}
                      </div>
                    </div>
                  )}

                  {/* Outgoing Requests */}
                  {pendingRequests.outgoing.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Outgoing Requests</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {pendingRequests.outgoing
                          .filter(request => 
                            (request.recipient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.recipient.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (request.recipient.company?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                          )
                          .map(request => renderPersonCard(request.recipient, 'outgoing', request.id))}
                      </div>
                    </div>
                  )}

                  {/* No Pending Requests */}
                  {pendingRequests.incoming.length === 0 && pendingRequests.outgoing.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">✓</div>
                      <p className="text-gray-600 dark:text-gray-400">You don't have any pending connection requests.</p>
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

export default AlumniNetwork;