import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const TestChat = () => {
  const { currentUser } = useAuth();
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [senderRole, setSenderRole] = useState('student');
  const [receiverRole, setReceiverRole] = useState('teacher');
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSenderId(currentUser.uid);
    }
    fetchAllMessages();
  }, [currentUser]);

  const fetchAllMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/test-messages/all-messages`);
      if (response.data.success) {
        setAllMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(`${apiBaseUrl}/test-messages/create-test-message`, {
        senderId,
        receiverId,
        senderRole,
        receiverRole,
        content
      });

      setResult(response.data);
      fetchAllMessages();
    } catch (error) {
      console.error('Error sending test message:', error);
      setResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`${apiBaseUrl}/test-messages/clear-all-messages`);
      setResult(response.data);
      fetchAllMessages();
    } catch (error) {
      console.error('Error clearing messages:', error);
      setResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Chat Testing Tool</h1>
      <p>Use this tool to test the chat functionality and verify that messages are being saved correctly.</p>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2>Send Test Message</h2>
        <form onSubmit={handleSendTestMessage}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Sender ID:</label>
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Receiver ID:</label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Sender Role:</label>
            <select
              value={senderRole}
              onChange={(e) => setSenderRole(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Receiver Role:</label>
            <select
              value={receiverRole}
              onChange={(e) => setReceiverRole(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Message Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '8px', minHeight: '100px' }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Test Message'}
          </button>
          <button
            type="button"
            onClick={handleClearMessages}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Clear All Messages'}
          </button>
        </form>
      </div>

      {result && (
        <div
          style={{
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid',
            borderColor: result.success ? '#4CAF50' : '#f44336',
            borderRadius: '5px',
            backgroundColor: result.success ? '#e8f5e9' : '#ffebee'
          }}
        >
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>All Messages ({allMessages.length})</h2>
        {loading ? (
          <p>Loading messages...</p>
        ) : allMessages.length === 0 ? (
          <p>No messages found in the database.</p>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
            {allMessages.map((message) => (
              <div
                key={message._id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: message.read ? '#fff' : '#f0f8ff'
                }}
              >
                <div style={{ marginBottom: '5px' }}>
                  <strong>From:</strong> {message.senderId} ({message.senderRole}) <strong>To:</strong> {message.receiverId} ({message.receiverRole})
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Time:</strong> {new Date(message.createdAt).toLocaleString()}
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <strong>Read:</strong> {message.read ? 'Yes' : 'No'}
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestChat;
