import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";

// Simple test components for now
const TestPage = ({ title }) => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is working without authentication</p>
    <div style={{ marginTop: '20px' }}>
      <a href="/">Home</a> | <a href="/login">Login</a> | <a href="/admin">Admin</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - No Authentication Required */}
          <Route path="/" element={<TestPage title="🏠 Home Page" />} />
          <Route path="/login" element={<TestPage title="🔐 Login Page" />} />
          <Route path="/admin" element={<TestPage title="👨‍💼 Admin Dashboard" />} />
          <Route path="/msme" element={<TestPage title="🏢 MSME Dashboard" />} />
          <Route path="/customer" element={<TestPage title="👤 Customer Portal" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<TestPage title="❓ Page Not Found" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;