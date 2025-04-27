import React, { useState, useEffect } from 'react';

const TestConnection = () => {
    const [status, setStatus] = useState('Loading...');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    
    const testEndpoint = async () => {
        try {
            setStatus('Testing connection...');
            const response = await fetch('/api/test-cors');
            const data = await response.json();
            setResponse(data);
            setStatus('Success!');
        } catch (err) {
            console.error('Connection error:', err);
            setError(err.toString());
            setStatus('Failed!');
        }
    };
    
    useEffect(() => {
        testEndpoint();
    }, []);
    
    return (
        <div style={{ 
            maxWidth: '600px', 
            margin: '100px auto', 
            padding: '20px', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Backend Connection Test</h1>
            
            <div style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                marginBottom: '20px'
            }}>
                <h2 style={{ 
                    margin: '0 0 15px 0',
                    color: status === 'Success!' ? 'green' : 
                           status === 'Failed!' ? 'red' : 'blue'
                }}>
                    Status: {status}
                </h2>
                
                {error && (
                    <div style={{ 
                        color: 'red', 
                        padding: '10px', 
                        border: '1px solid red',
                        borderRadius: '4px',
                        backgroundColor: '#ffeeee',
                        marginBottom: '15px'
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {response && (
                    <div>
                        <h3>Response from server:</h3>
                        <pre style={{ 
                            backgroundColor: '#f0f0f0', 
                            padding: '10px', 
                            borderRadius: '4px',
                            overflowX: 'auto'
                        }}>
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            
            <button 
                onClick={testEndpoint}
                style={{
                    padding: '10px 15px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'block',
                    margin: '0 auto'
                }}
            >
                Test Connection Again
            </button>
        </div>
    );
};

export default TestConnection; 