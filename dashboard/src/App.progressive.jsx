import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

// Fallback components for routes that might have issues
const TestComponent = ({ name }) => (
  <div style={{ padding: '20px' }}>
    <h2>{name} Page</h2>
    <p>This page is being restored...</p>
    <a href="/">Back to Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Core Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Placeholder routes for now */}
          <Route path="/admin-overview" element={<TestComponent name="Admin Overview" />} />
          <Route path="/admin-user-management" element={<TestComponent name="Admin User Management" />} />
          <Route path="/msme-dashboard" element={<TestComponent name="MSME Dashboard" />} />
          <Route path="/customer-store-view" element={<TestComponent name="Customer Store View" />} />
          
          {/* Catch all route */}
          <Route path="*" element={<div style={{padding: '20px'}}><h2>Page Not Found</h2><a href="/">Go Home</a></div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;