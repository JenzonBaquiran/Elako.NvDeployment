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
import DataTest from "./pages/DataTest";

// Admin Components
import AdminOverview from "./pages/AdminOverview";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminMsmeOversight from "./pages/AdminMsmeOversight";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminMsmeReport from "./pages/AdminMsmeReport";
import BlogManagement from "./pages/admin/BlogManagement";

// Customer Components
import CustomerFavorites from "./pages/CustomerFavorites";
import CustomerMessage from "./pages/CustomerMessage";
import CustomerNotifications from "./pages/CustomerNotifications";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerReviews from "./pages/CustomerReviews";
import CustomerViewStore from "./pages/CustomerViewStore";

// MSME Components
import MsmeDashboard from "./pages/MsmeDashboard";
import MsmeManageProduct from "./pages/MsmeManageProduct";
import MsmeAnalytics from "./pages/MsmeAnalytics";
import MsmeProfile from "./pages/MsmeProfile";
import MsmeReviews from "./pages/MsmeReviews";
import MsmeMessage from "./pages/MsmeMessage";
import MsmeCustomizeDashboard from "./pages/MsmeCustomizeDashboard";

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
      <a href="/" style={{ margin: '5px', padding: '8px 16px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>Home</a>
      <a href="/login" style={{ margin: '5px', padding: '8px 16px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>Login</a>
      <a href="/signup" style={{ margin: '5px', padding: '8px 16px', background: '#dc3545', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>Signup</a>
      <a href="/terms" style={{ margin: '5px', padding: '8px 16px', background: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>Terms</a>
      <a href="/data-test" style={{ margin: '5px', padding: '8px 16px', background: '#17a2b8', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px' }}>📊 Data</a>
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
          
          {/* Debug/Test Routes */}
          <Route 
            path="/test" 
            element={
              <SimplePageTest 
                title="🔧 Routing Test" 
                message="If you can see this page, routing is working correctly! All routes have been fixed."
              />
            } 
          />
          <Route path="/data-test" element={<DataTest />} />
          
          {/* Admin Routes */}
          <Route path="/admin-overview" element={<AdminOverview />} />
          <Route path="/admin-user-management" element={<AdminUserManagement />} />
          <Route path="/admin-analytics" element={<AdminAnalytics />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
          <Route path="/admin-msme-oversight" element={<AdminMsmeOversight />} />
          <Route path="/admin-audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin-msme-report" element={<AdminMsmeReport />} />
          <Route path="/admin-blog-management" element={<BlogManagement />} />
          
          {/* Customer Routes */}
          <Route path="/customer-favorites" element={<CustomerFavorites />} />
          <Route path="/customer-messages" element={<CustomerMessage />} />
          <Route path="/customer-notifications" element={<CustomerNotifications />} />
          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/customer-reviews" element={<CustomerReviews />} />
          <Route path="/customer-view-store/:id" element={<CustomerViewStore />} />
          <Route path="/customer/stores" element={<CustomerViewStore />} />
          <Route path="/customer/store/:id" element={<CustomerStoreView />} />
          <Route path="/customer/hot-picks" element={<CustomerHotPicks />} />
          <Route path="/customer/top-stores" element={<CustomerTopStores />} />
          <Route path="/customer-message" element={<CustomerMessage />} />
          <Route path="/customer-message/:storeId" element={<CustomerMessage />} />
          
          {/* MSME Routes */}
          <Route path="/msme-dashboard" element={<MsmeDashboard />} />
          <Route path="/msme-products" element={<MsmeManageProduct />} />
          <Route path="/msme-analytics" element={<MsmeAnalytics />} />
          <Route path="/msme-profile" element={<MsmeProfile />} />
          <Route path="/msme-reviews" element={<MsmeReviews />} />
          <Route path="/msme-messages" element={<MsmeMessage />} />
          <Route path="/msme-customize" element={<MsmeCustomizeDashboard />} />
          <Route path="/msme-manage-product" element={<MsmeManageProduct />} />
          <Route path="/msme-customize-dashboard" element={<MsmeCustomizeDashboard />} />
          <Route path="/msme/customer/:customerId" element={<SimplePageTest title="Customer Profile" message="Customer profile view for MSME users" />} />
          
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