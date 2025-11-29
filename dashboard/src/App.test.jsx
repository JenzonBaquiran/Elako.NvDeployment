import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🚀 Elako.Nv System</h1>
      <p>Frontend deployed successfully!</p>
      <p>Backend URL: https://elakonvdeployment-production.up.railway.app</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ padding: '10px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Go to Login
        </a>
      </div>
    </div>
  );
}

export default App;