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
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );    
}
export default App;