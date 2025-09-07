import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "../css/AdminUserManagement.css";  

const users = [
  { 
    name: "Juan Dela Cruz",
    email: "juan@email.com",
    type: "Customer",
    status: "active",   
    joinDate: "1/15/2024",
    activity: "6/1/2024",
  },
  {
    name: "Maria Santos",
    email: "maria@email.com",
    type: "Customer",
    status: "active",
    joinDate: "2/20/2024",
    activity: "5/30/2024",
  },
  {
    name: "Maria's Bakery",
    email: "maria.bakery@email.com",
    type: "Msme",
    status: "active",
    joinDate: "1/10/2024",
    activity: "6/1/2024",
  },
  {
    name: "Pedro Garcia",
    email: "pedro@email.com",
    type: "Customer",
    status: "inactive",
    joinDate: "3/5/2024",
    activity: "4/15/2024",
  },
  {
    name: "Island Crafts",
    email: "island.crafts@email.com",
    type: "Msme",
    status: "suspended",
    joinDate: "2/1/2024",
    activity: "5/20/2024",
  }
];

const AdminUserManagement = () => {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });

  const handleSidebarToggle = (state) => {
    setSidebarState(state);
  };

  const getContentClass = () => {
    if (sidebarState.isMobile) {
      return 'admin-user-management__content admin-user-management__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'admin-user-management__content admin-user-management__content--sidebar-open' 
      : 'admin-user-management__content admin-user-management__content--sidebar-collapsed';
  };

  return (
    <div className="admin-user-management">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="admin-user-management__header">
          <h1>User Management</h1>
          <p>Manage customers and MSME businesses on the platform.</p>
        </div>

        <div className="admin-user-management__stats">
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">5</span>
            <span className="admin-user-management__stat-label">Total Users</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">3</span>
            <span className="admin-user-management__stat-label">Customers</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">2</span>
            <span className="admin-user-management__stat-label">MSMEs</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">3</span>
            <span className="admin-user-management__stat-label">Active</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">1</span>
            <span className="admin-user-management__stat-label">Suspended</span>
          </div>
        </div>

        <div className="admin-user-management__filters">
          <h2>Filters</h2>
          <div className="admin-user-management__filters-row">
            <input type="text" placeholder="Search users..." className="admin-user-management__search-input" />
            <select className="admin-user-management__filter-dropdown">
              <option>All Users</option>
            </select>
            <select className="admin-user-management__filter-dropdown">
              <option>All Status</option>
            </select>
          </div>
        </div>

        <div className="admin-user-management__tabs">
          <button className="admin-user-management__tab-button admin-user-management__tab-button--active">All Users (5)</button>
          <button className="admin-user-management__tab-button">Customers (3)</button>
          <button className="admin-user-management__tab-button">MSMEs (2)</button>
        </div>

        <div className="admin-user-management__table-section">
          <table className="admin-user-management__table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>
                    <div className="admin-user-management__user-cell">
                      <div className="admin-user-management__avatar">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="admin-user-management__user-info">
                        <div className="admin-user-management__user-name">{user.name}</div>
                        <div className="admin-user-management__user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.type}</td>
                  <td>
                    <span className={`admin-user-management__status-badge admin-user-management__status-badge--${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>{user.activity}</td>
                  <td>
                    <div className="admin-user-management__actions">
                      <button className="admin-user-management__view-btn">View</button>
                      <button className="admin-user-management__more-btn">...</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;