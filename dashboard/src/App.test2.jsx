import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Create a simple test component instead of importing complex ones
const TestHome = () => (
  <div style={{ padding: '20px' }}>
    <h1>🏠 Home Page</h1>
    <p>Welcome to Elako.Nv System</p>
    <a href="/login">Go to Login</a>
  </div>
);

const TestLogin = () => (
  <div style={{ padding: '20px' }}>
    <h1>🔐 Login Page</h1>
    <p>Login functionality will be restored</p>
    <a href="/">Back to Home</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Test Routes */}
        <Route path="/" element={<TestHome />} />
        <Route path="/login" element={<TestLogin />} />
        {/* Catch all route */}
        <Route path="*" element={<div style={{padding: '20px'}}><h2>Page Not Found</h2><a href="/">Go Home</a></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;