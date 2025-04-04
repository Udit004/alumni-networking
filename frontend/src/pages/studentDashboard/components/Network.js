import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useAuth } from '../../../context/AuthContext';

const Network = ({ currentUser, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
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
      
      // Get current user's data
      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      const userData = userDoc.data();
      
      if (userData) {
        // Fetch connections
        const connectionIds = userData.connections || [];
        const connectionData = await Promise.all(
          connectionIds.map(async (id) => {
            const userSnap = await getDoc(doc(db, 'users', id));
            if (userSnap.exists()) {
              return { id: userSnap.id, ...userSnap.data(), isConnected: true };
            }
            return null;
          })
        );
        setConnections(connectionData.filter(Boolean));
        
        // Fetch pending requests
        const pendingIds = userData.pendingRequests || [];
        const pendingData = await Promise.all(
          pendingIds.map(async (id) => {
            const userSnap = await getDoc(doc(db, 'users', id));
            if (userSnap.exists()) {
              return { id: userSnap.id, ...userSnap.data(), requestDate: new Date().toISOString() };
            }
            return null;
          })
        );
        setPendingRequests(pendingData.filter(Boolean));
        
        // Fetch recommendations - find users with similar interests or in the same program
        const recommendationsQuery = query(
          collection(db, 'users'),
          where('role', 'in', ['student', 'teacher', 'alumni'])
        );
        
        const recommendationsSnapshot = await getDocs(recommendationsQuery);
        const recommendationsData = [];
        
        recommendationsSnapshot.forEach((doc) => {
          const user = { id: doc.id, ...doc.data() };
          
          // Skip if it's the current user or already connected or pending
          if (
            doc.id !== authUser.uid && 
            !connectionIds.includes(doc.id) && 
            !pendingIds.includes(doc.id)
          ) {
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
            
            // Calculate mutual connections
            const mutualConnections = (user.connections || []).filter(id => 
              connectionIds.includes(id)
            ).length;
            
            relevanceScore += mutualConnections * 3;
            
            recommendationsData.push({
              ...user,
              mutualConnections,
              relevanceScore,
              isConnected: false
            });
          }
        });
        
        // Sort by relevance score and mutual connections
        recommendationsData.sort((a, b) => {
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          return b.mutualConnections - a.mutualConnections;
        });
        
        setRecommendations(recommendationsData.slice(0, 10)); // Limit to top 10
      }
    } catch (err) {
      console.error("Error fetching network data:", err);
      setError("Failed to load network data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      // Send connection request
      await updateDoc(doc(db, 'users', userId), {
        pendingRequests: arrayUnion(authUser.uid)
      });
      
      // Refresh data
      fetchNetworkData();
    } catch (error) {
      console.error("Error sending connection request:", error);
      setError("Failed to send connection request. Please try again.");
    }
  };

  const handleAccept = async (userId) => {
    try {
      // Add to connections for both users
      await updateDoc(doc(db, 'users', authUser.uid), {
        connections: arrayUnion(userId),
        pendingRequests: arrayRemove(userId)
      });
      
      await updateDoc(doc(db, 'users', userId), {
        connections: arrayUnion(authUser.uid)
      });
      
      // Refresh data
      fetchNetworkData();
    } catch (error) {
      console.error("Error accepting connection:", error);
      setError("Failed to accept connection. Please try again.");
    }
  };

  const handleDecline = async (userId) => {
    try {
      // Remove from pending requests
      await updateDoc(doc(db, 'users', authUser.uid), {
        pendingRequests: arrayRemove(userId)
      });
      
      // Refresh data
      fetchNetworkData();
    } catch (error) {
      console.error("Error declining connection:", error);
      setError("Failed to decline connection. Please try again.");
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
  
  const renderPersonCard = (person) => (
    <div key={person.id} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 flex items-start gap-4">
      <div className={`w-12 h-12 ${getRandomColor(person.id)} rounded-full flex items-center justify-center text-white font-medium`}>
        {person.photoURL ? 
          <img src={person.photoURL} alt={person.name} className="w-full h-full rounded-full object-cover" /> 
          : getInitials(person.name)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{person.name}</h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {person.role === 'student' && `Student, ${person.program || 'Program N/A'} (${person.batch || 'Batch N/A'})`}
          {person.role === 'alumni' && `Alumni, ${person.currentPosition || 'Position N/A'} at ${person.company || 'Company N/A'}`}
          {person.role === 'teacher' && `Faculty, ${person.designation || 'Position N/A'}, ${person.department || 'Department N/A'}`}
        </p>
        
        {activeTab === 'recommendations' && person.mutualConnections > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {person.mutualConnections} mutual connection{person.mutualConnections !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      <div>
        {activeTab === 'connections' && (
          <button 
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => window.location.href = `/messages?userId=${person.id}`}
          >
            Message
          </button>
        )}
        
        {activeTab === 'recommendations' && !person.isConnected && (
          <button 
            className="text-sm px-3 py-1 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
            onClick={() => handleConnect(person.id)}
          >
            Connect
          </button>
        )}
        
        {activeTab === 'pending' && (
          <div className="flex flex-col gap-2">
            <button 
              className="text-sm px-3 py-1 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
              onClick={() => handleAccept(person.id)}
            >
              Accept
            </button>
            <button 
              className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => handleDecline(person.id)}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  const filteredConnections = connections.filter(
    person => person.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredRecommendations = recommendations.filter(
    person => person.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredPendingRequests = pendingRequests.filter(
    person => person.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-3 text-sm px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={fetchNetworkData}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="network-container">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Network</h2>
        
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search connections..."
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'connections'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'recommendations'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommended ({recommendations.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'pending'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
        </div>
        
        {/* Connection Lists */}
        <div className="grid grid-cols-1 gap-4">
          {activeTab === 'connections' && filteredConnections.length > 0 && (
            filteredConnections.map(renderPersonCard)
          )}
          
          {activeTab === 'connections' && filteredConnections.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">👥</div>
              {searchTerm 
                ? <p className="text-gray-600 dark:text-gray-400">No connections match your search.</p>
                : (
                  <>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't connected with anyone yet.</p>
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      onClick={() => setActiveTab('recommendations')}
                    >
                      Find People to Connect With
                    </button>
                  </>
                )
              }
            </div>
          )}
          
          {activeTab === 'recommendations' && filteredRecommendations.length > 0 && (
            filteredRecommendations.map(renderPersonCard)
          )}
          
          {activeTab === 'recommendations' && filteredRecommendations.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              {searchTerm 
                ? <p className="text-gray-600 dark:text-gray-400">No recommendations match your search.</p>
                : <p className="text-gray-600 dark:text-gray-400">No recommendations available at the moment.</p>
              }
            </div>
          )}
          
          {activeTab === 'pending' && filteredPendingRequests.length > 0 && (
            filteredPendingRequests.map(renderPersonCard)
          )}
          
          {activeTab === 'pending' && filteredPendingRequests.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">✓</div>
              {searchTerm 
                ? <p className="text-gray-600 dark:text-gray-400">No pending requests match your search.</p>
                : <p className="text-gray-600 dark:text-gray-400">You don't have any pending connection requests.</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;