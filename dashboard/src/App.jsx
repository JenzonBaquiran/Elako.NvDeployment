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
import MsmeManageProduct from "./pages/MsmeManageProduct";
import MsmeDashboard from "./pages/MsmeDashboard";
import MsmeMessage from "./pages/MsmeMessage";
import MsmeAnalytics from "./pages/MsmeAnalytics";
import MsmeProfile from "./pages/MsmeProfile";
import AdminOverview from "./pages/AdminOverview";
import AdminMsmeOversight from "./pages/AdminMsmeOversight";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";



function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-user-management" element={<AdminUserManagement />} />
          <Route path="/msme-sidebar" element={<MsmeSidebar />} />
          <Route path="/customer-sidebar" element={<CustomerSidebar />} />
          <Route path="/msme-manage-product" element={<MsmeManageProduct />} />
          <Route path="/msme-dashboard" element={<MsmeDashboard />} />
          <Route path="/msme-messages" element={<MsmeMessage />} />
          <Route path="/msme-analytics" element={<MsmeAnalytics />} />
          <Route path="/msme-profile" element={<MsmeProfile />} />
          <Route path="/admin-overview" element={<AdminOverview />} />
          <Route path="/admin-msme-oversight" element={<AdminMsmeOversight />} />
          <Route path="/admin-analytics" element={<AdminAnalytics />} />
          <Route path="/admin-settings" element={<AdminSettings />} />

        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );    
}
export default App;