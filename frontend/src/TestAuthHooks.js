import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const TestAuthHooks = () => {
  const [count, setCount] = useState(0);
  const { currentUser, login, logout, error } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginStatus('Logging in...');
    try {
      const result = await login(email, password);
      if (result.success) {
        setLoginStatus('Login successful!');
        setEmail('');
        setPassword('');
      } else {
        setLoginStatus(`Login failed: ${result.error}`);
      }
    } catch (error) {
      setLoginStatus(`Login error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    setLoginStatus('Logging out...');
    try {
      const result = await logout();
      if (result.success) {
        setLoginStatus('Logged out successfully!');
      } else {
        setLoginStatus(`Logout failed: ${result.error}`);
      }
    } catch (error) {
      setLoginStatus(`Logout error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Testing React Hooks with Context</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Counter: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
        <button 
          onClick={toggleTheme}
          style={{
            padding: '10px 20px',
            backgroundColor: isDarkMode ? 'yellow' : 'purple',
            color: isDarkMode ? 'black' : 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Toggle Theme
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Authentication</h2>
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '10px'
          }}>
            <p>Auth Error: {error}</p>
          </div>
        )}
        
        {currentUser ? (
          <div>
            <p>Logged in as: {currentUser.email}</p>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ maxWidth: '300px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
                required
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
        )}
        
        {loginStatus && (
          <div style={{ 
            marginTop: '10px',
            padding: '10px',
            backgroundColor: loginStatus.includes('successful') ? '#e8f5e9' : '#fff8e1',
            color: loginStatus.includes('successful') ? '#2e7d32' : '#f57f17',
            borderRadius: '5px'
          }}>
            {loginStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuthHooks; 