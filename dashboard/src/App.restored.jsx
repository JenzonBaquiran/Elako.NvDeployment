import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminUserManagement from "./pages/AdminUserManagement";
import MsmeSidebar from "./pages/MsmeSidebar";
import CustomerSidebar from "./pages/CustomerSidebar";
import NotificationProvider from "./components/NotificationProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import MsmeManageProduct from "./pages/MsmeManageProduct";
import MsmeDashboard from "./pages/MsmeDashboard";
import MsmeMessage from "./pages/MsmeMessage";
import MsmeAnalytics from "./pages/MsmeAnalytics";
import MsmeProfile from "./pages/MsmeProfile";
import MsmeReviews from "./pages/MsmeReviews";
import AdminOverview from "./pages/AdminOverview";
import AdminMsmeOversight from "./pages/AdminMsmeOversight";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import BlogManagement from "./pages/admin/BlogManagement";
import MsmeCustomizeDashboard from "./pages/MsmeCustomizeDashboard";
import CustomerViewStore from "./pages/CustomerViewStore";
import CustomerStoreView from "./pages/CustomerStoreView";
import CustomerFavorites from "./pages/CustomerFavorites";
import CustomerReviews from "./pages/CustomerReviews";
import CustomerMessage from "./pages/CustomerMessage";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerNotifications from "./pages/CustomerNotifications";
import CustomerHotPicks from "./pages/CustomerHotPicks";
import CustomerTopStores from "./pages/CustomerTopStores";
import ProductDetails from "./pages/ProductDetails";
import ForgotPassword from "./pages/ForgotPassword";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminMsmeReport from "./pages/AdminMsmeReport";
import TermsPage from "./pages/TermsPage";

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
            
            {/* Admin Protected Routes */}
            <Route 
              path="/admin-user-management" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-overview" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-msme-oversight" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMsmeOversight />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-analytics" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-settings" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-audit-logs" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-msme-report" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMsmeReport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/blog-management" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BlogManagement />
                </ProtectedRoute>
              } 
            />

            {/* MSME Protected Routes */}
            <Route 
              path="/msme-sidebar" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeSidebar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-dashboard" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-manage-product" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeManageProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-message" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeMessage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-analytics" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-profile" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-reviews" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeReviews />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-customize-dashboard" 
              element={
                <ProtectedRoute allowedRoles={["msme"]}>
                  <MsmeCustomizeDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Customer Protected Routes */}
            <Route 
              path="/customer-sidebar" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerSidebar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-view-store/:storeId" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerViewStore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-store-view" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerStoreView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-favorites" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerFavorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-reviews" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerReviews />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-message" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerMessage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-profile" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-notifications" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerNotifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-hot-picks" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerHotPicks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-top-stores" 
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <CustomerTopStores />
                </ProtectedRoute>
              } 
            />

            {/* Shared Routes */}
            <Route 
              path="/product/:productId" 
              element={
                <ProtectedRoute allowedRoles={["customer", "msme", "admin"]}>
                  <ProductDetails />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;