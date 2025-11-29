import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import NotificationProvider from "./components/NotificationProvider";

// Only import components we know exist and work
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import TermsPage from "./pages/TermsPage";
import ProductDetails from "./pages/ProductDetails";
import CustomerStoreView from "./pages/CustomerStoreView";
import CustomerHotPicks from "./pages/CustomerHotPicks";
import CustomerTopStores from "./pages/CustomerTopStores";

// Simple fallback component for testing
const SimplePageTest = ({ title, message }) => (
  <div style={{ 
    padding: '40px', 
    textAlign: 'center', 
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    background: '#f8f9fa'
  }}>
    <h1 style={{ color: '#007bff', marginBottom: '20px' }}>{title}</h1>
    <p style={{ fontSize: '18px', marginBottom: '30px' }}>{message}</p>
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'inline-block'
    }}>
      <p><strong>Navigation:</strong></p>
      <a href="/" style={{ margin: '10px', padding: '10px 20px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Home</a>
      <a href="/login" style={{ margin: '10px', padding: '10px 20px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Login</a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/store/:id" element={<CustomerStoreView />} />
          <Route path="/hot-picks" element={<CustomerHotPicks />} />
          <Route path="/top-stores" element={<CustomerTopStores />} />
          
          {/* Test Routes for pages being developed */}
          <Route 
            path="/admin-overview" 
            element={<SimplePageTest title="Admin Dashboard" message="Admin features are being restored..." />} 
          />
          <Route 
            path="/admin-user-management" 
            element={<SimplePageTest title="User Management" message="User management features coming soon..." />} 
          />
          <Route 
            path="/msme-dashboard" 
            element={<SimplePageTest title="MSME Dashboard" message="MSME features are being restored..." />} 
          />
          <Route 
            path="/customer-store-view" 
            element={<SimplePageTest title="Store View" message="Customer features coming soon..." />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <SimplePageTest 
                title="Page Not Found" 
                message="The page you're looking for doesn't exist yet or is being restored." 
              />
            } 
          />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;