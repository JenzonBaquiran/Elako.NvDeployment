import React, { useState, useEffect } from 'react';

const AuthDebugger = () => {
  const [userState, setUserState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Check both authentication formats
      let userData = localStorage.getItem('customerUser');
      let source = 'customerUser';
      
      if (!userData) {
        userData = localStorage.getItem('user');
        source = 'user';
      }
      
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserState({ ...parsed, _source: source });
        setError(null);
      } else {
        setUserState(null);
        setError('No user data in localStorage (checked both "user" and "customerUser")');
      }
    } catch (err) {
      setError('Error parsing user data: ' + err.message);
      setUserState(null);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('customerUser');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('msmeUser');
    checkAuth();
  };

  const testStoreNavigation = (storeId) => {
    window.location.href = `/customer-message/${storeId}`;
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      background: 'white',
      border: '2px solid #333',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 10000,
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '400px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔧 Auth Debugger</div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>User Status:</strong> {userState ? '✅ Logged In' : '❌ Not Logged In'}
      </div>

      {userState && (
        <div style={{ marginBottom: '10px' }}>
          <div><strong>ID:</strong> {userState._id || userState.id}</div>
          <div><strong>Type:</strong> {userState.userType || 'customer'}</div>
          <div><strong>Name:</strong> {userState.firstname} {userState.lastname}</div>
          <div><strong>Source:</strong> {userState._source}</div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <button onClick={checkAuth} style={{ marginRight: '5px' }}>Refresh</button>
        <button onClick={clearAuth} style={{ marginRight: '5px' }}>Clear Auth</button>
      </div>

      <div>
        <strong>Test Store Navigation:</strong>
        <div style={{ marginTop: '5px' }}>
          <input 
            type="text" 
            placeholder="Enter Store ID" 
            id="testStoreId"
            style={{ width: '200px', padding: '2px' }}
          />
          <button 
            onClick={() => {
              const storeId = document.getElementById('testStoreId').value;
              if (storeId) testStoreNavigation(storeId);
            }}
            style={{ marginLeft: '5px' }}
          >
            Test Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;