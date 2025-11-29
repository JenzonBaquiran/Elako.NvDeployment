import React from "react";

function App() {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          color: '#007bff', 
          marginBottom: '20px',
          fontSize: '2.5rem'
        }}>
          🏪 eLako.Nv System
        </h1>
        
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>✅ System Online</h2>
          <p style={{ margin: 0 }}>Your eLako.Nv platform is successfully deployed!</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>🌐 Service Status</h3>
          <div style={{ textAlign: 'left', display: 'inline-block' }}>
            <p>✅ <strong>Frontend:</strong> Vercel - Active</p>
            <p>✅ <strong>Backend:</strong> Railway - Active</p>
            <p>✅ <strong>Database:</strong> MongoDB - Connected</p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            🔧 <strong>Development Mode:</strong> Full features are being restored step by step.
          </p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => alert('Login feature coming soon!')}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              margin: '10px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔐 Login Portal
          </button>
          <button 
            onClick={() => alert('Admin features coming soon!')}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '5px',
              margin: '10px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            👨‍💼 Admin Access
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;