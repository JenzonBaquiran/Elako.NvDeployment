import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNotification } from "../components/NotificationProvider";
import "../css/AdminUserManagement.css";

const AdminUserManagement = () => {
  const { showConfirm, showSuccess, showError } = useNotification();
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: ''
  });
  const [adminFormLoading, setAdminFormLoading] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/admin/admins");
      
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      
      const data = await response.json();
      
      // Format admins data
      const formattedAdmins = data.admins.map(admin => ({
        id: admin._id,
        name: `${admin.firstname} ${admin.lastname}`,
        email: admin.email,
        type: "Admin",
        status: admin.status,
        joinDate: new Date(admin.createdAt).toLocaleDateString(),
        activity: new Date(admin.updatedAt).toLocaleDateString(),
        username: admin.username,
        role: admin.role
      }));
      
      setAdmins(formattedAdmins);
    } catch (err) {
      console.error("Error fetching admins:", err);
      showError("Failed to load admins. Please try again.");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:1337/api/admin/users");
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      
      // Combine customers and MSMEs into a single array with proper formatting
      const allUsers = [
        ...data.customers.map(customer => ({
          id: customer.id,
          name: `${customer.firstname} ${customer.lastname}`,
          email: customer.email,
          type: "Customer",
          status: "active", // You can add status field to customer model if needed
          joinDate: new Date(customer.createdAt).toLocaleDateString(),
          activity: new Date(customer.updatedAt).toLocaleDateString(),
          username: customer.username,
          contactNumber: customer.contactNumber,
          address: customer.address
        })),
        ...data.msmes.map(msme => ({
          id: msme.id,
          name: msme.businessName,
          email: `${msme.username}@msme.com`, // You may want to add email field to MSME model
          type: "MSME",
          status: msme.status,
          joinDate: new Date(msme.createdAt).toLocaleDateString(),
          activity: new Date(msme.updatedAt).toLocaleDateString(),
          username: msme.username,
          category: msme.category,
          clientProfilingNumber: msme.clientProfilingNumber
        }))
      ];
      
      setUsers(allUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      showError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on active tab, search term, and status
  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "customers" && user.type === "Customer") ||
                      (activeTab === "msmes" && user.type === "MSME");
    
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesTab && matchesSearch && matchesStatus;
  });

  // Filter admins based on search term and status
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get current display data based on active tab
  const getCurrentDisplayData = () => {
    if (activeTab === "admins") {
      return filteredAdmins;
    }
    return filteredUsers;
  };

  const currentDisplayData = getCurrentDisplayData();

  // Calculate statistics
  const stats = {
    total: users.length + admins.length,
    customers: users.filter(user => user.type === "Customer").length,
    msmes: users.filter(user => user.type === "MSME").length,
    admins: admins.length,
    active: users.filter(user => user.status === "active" || user.status === "approved").length + 
            admins.filter(admin => admin.status === "active").length,
    pending: users.filter(user => user.status === "pending").length,
    suspended: users.filter(user => user.status === "suspended" || user.status === "rejected").length +
               admins.filter(admin => admin.status === "suspended").length
  };

  const handleDeleteUser = async (userId, userType) => {
    const confirmed = await showConfirm(
      `Are you sure you want to delete this ${userType.toLowerCase()}?`,
      `Delete ${userType}`
    );
    
    if (confirmed) {
      try {
        let endpoint;
        if (userType === "Customer") {
          endpoint = `http://localhost:1337/api/admin/customers/${userId}`;
        } else if (userType === "MSME") {
          endpoint = `http://localhost:1337/api/admin/msme/${userId}`;
        } else if (userType === "Admin") {
          endpoint = `http://localhost:1337/api/admin/admins/${userId}`;
        }
        
        const response = await fetch(endpoint, { method: "DELETE" });
        
        if (response.ok) {
          showSuccess(`${userType} deleted successfully`);
          if (userType === "Admin") {
            fetchAdmins();
          } else {
            fetchUsers();
          }
        } else {
          throw new Error(`Failed to delete ${userType.toLowerCase()}`);
        }
      } catch (err) {
        console.error(`Error deleting ${userType.toLowerCase()}:`, err);
        showError(`Failed to delete ${userType.toLowerCase()}. Please try again.`);
      }
    }
  };

  const handleStatusUpdate = async (userId, newStatus, userType = "MSME") => {
    try {
      let endpoint;
      if (userType === "Admin") {
        endpoint = `http://localhost:1337/api/admin/admins/${userId}/status`;
      } else {
        endpoint = `http://localhost:1337/api/msme/${userId}/status`;
      }
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        showSuccess(`Status updated to ${newStatus}`, "Status Updated");
        if (userType === "Admin") {
          fetchAdmins();
        } else {
          fetchUsers();
        }
        setActiveDropdown(null);
      } else {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showError("Failed to update status. Please try again.");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminFormLoading(true);

    try {
      // Get current admin info from localStorage
      const currentAdmin = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch("http://localhost:1337/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...adminFormData,
          createdBy: currentAdmin.id || 'admin'
        })
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Admin created successfully!", "Success");
        setShowAddAdminModal(false);
        setAdminFormData({
          username: '',
          password: '',
          firstname: '',
          lastname: '',
          email: ''
        });
        // Refresh admins list
        fetchAdmins();
      } else {
        showError(data.error || "Failed to create admin", "Error");
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      showError("Failed to create admin. Please try again.", "Error");
    } finally {
      setAdminFormLoading(false);
    }
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseAddAdminModal = () => {
    setShowAddAdminModal(false);
    setAdminFormData({
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      email: ''
    });
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

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
          <div className="admin-user-management__header-content">
            <div className="admin-user-management__header-text">
              <h1>User Management</h1>
              <p>Manage customers and MSME businesses on the platform.</p>
            </div>
            <button 
              className="admin-user-management__add-admin-btn"
              onClick={() => setShowAddAdminModal(true)}
            >
              + Add New Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-user-management__error">
            {error}
          </div>
        )}

        <div className="admin-user-management__stats">
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.total}</span>
            <span className="admin-user-management__stat-label">Total Users</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.customers}</span>
            <span className="admin-user-management__stat-label">Customers</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.msmes}</span>
            <span className="admin-user-management__stat-label">MSMEs</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.admins}</span>
            <span className="admin-user-management__stat-label">Admins</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.active}</span>
            <span className="admin-user-management__stat-label">Active</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.pending}</span>
            <span className="admin-user-management__stat-label">Pending</span>
          </div>
          <div className="admin-user-management__stat-box">
            <span className="admin-user-management__stat-value">{stats.suspended}</span>
            <span className="admin-user-management__stat-label">Suspended</span>
          </div>
        </div>

        <div className="admin-user-management__filters">
          <h2>Filters</h2>
          <div className="admin-user-management__filters-row">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="admin-user-management__search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="admin-user-management__filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <button 
              className="admin-user-management__refresh-btn"
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="admin-user-management__tabs">
          <button 
            className={`admin-user-management__tab-button ${activeTab === "all" ? "admin-user-management__tab-button--active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Users ({stats.total - stats.admins})
          </button>
          <button 
            className={`admin-user-management__tab-button ${activeTab === "customers" ? "admin-user-management__tab-button--active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customers ({stats.customers})
          </button>
          <button 
            className={`admin-user-management__tab-button ${activeTab === "msmes" ? "admin-user-management__tab-button--active" : ""}`}
            onClick={() => setActiveTab("msmes")}
          >
            MSMEs ({stats.msmes})
          </button>
          <button 
            className={`admin-user-management__tab-button ${activeTab === "admins" ? "admin-user-management__tab-button--active" : ""}`}
            onClick={() => setActiveTab("admins")}
          >
            Admins ({stats.admins})
          </button>
        </div>

        <div className="admin-user-management__table-section">
          {loading ? (
            <div className="admin-user-management__loading">Loading users...</div>
          ) : (
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
                {currentDisplayData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-user-management__no-data">
                      No {activeTab === "admins" ? "admins" : "users"} found
                    </td>
                  </tr>
                ) : (
                  currentDisplayData.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-management__user-cell">
                          <div className="admin-user-management__avatar">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="admin-user-management__user-info">
                            <div className="admin-user-management__user-name">{user.name}</div>
                            <div className="admin-user-management__user-email">{user.email}</div>
                            <div className="admin-user-management__user-username">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-user-management__type-badge">
                          {user.type}
                          {user.type === "MSME" && user.category && (
                            <small> ({user.category})</small>
                          )}
                          {user.type === "Admin" && user.role && (
                            <small> ({user.role})</small>
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-user-management__status-badge admin-user-management__status-badge--${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.joinDate}</td>
                      <td>{user.activity}</td>
                      <td>
                        <div className="admin-user-management__actions">
                          <button 
                            className="admin-user-management__more-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(user.id);
                            }}
                          >
                            ⋯
                          </button>
                          <div className={`admin-user-management__dropdown ${activeDropdown === user.id ? 'show' : ''}`}>
                            <button 
                              className="admin-user-management__dropdown-item"
                              onClick={() => handleViewUser(user)}
                            >
                              View
                            </button>
                            {user.type === "MSME" && user.status === "pending" && (
                              <>
                                <button 
                                  className="admin-user-management__dropdown-item approve"
                                  onClick={() => handleStatusUpdate(user.id, "approved", "MSME")}
                                >
                                  Approve
                                </button>
                                <button 
                                  className="admin-user-management__dropdown-item reject"
                                  onClick={() => handleStatusUpdate(user.id, "rejected", "MSME")}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {user.type === "Admin" && user.status === "active" && (
                              <button 
                                className="admin-user-management__dropdown-item reject"
                                onClick={() => handleStatusUpdate(user.id, "suspended", "Admin")}
                              >
                                Suspend
                              </button>
                            )}
                            {user.type === "Admin" && user.status === "suspended" && (
                              <button 
                                className="admin-user-management__dropdown-item approve"
                                onClick={() => handleStatusUpdate(user.id, "active", "Admin")}
                              >
                                Activate
                              </button>
                            )}
                            <button 
                              className="admin-user-management__dropdown-item delete"
                              onClick={() => handleDeleteUser(user.id, user.type)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Admin Modal */}
      <div className={`admin-user-management__modal-overlay ${showAddAdminModal ? 'show' : ''}`} onClick={handleCloseAddAdminModal}>
        <div className="admin-user-management__modal admin-user-management__modal--add-admin" onClick={(e) => e.stopPropagation()}>
          <div className="admin-user-management__modal-header">
            <h3 className="admin-user-management__modal-title">Add New Admin</h3>
            <button className="admin-user-management__modal-close" onClick={handleCloseAddAdminModal}>
              ×
            </button>
          </div>
          
          <form onSubmit={handleAddAdmin} className="admin-user-management__admin-form">
            <div className="admin-user-management__form-row">
              <div className="admin-user-management__form-field">
                <label className="admin-user-management__form-label">First Name *</label>
                <input
                  type="text"
                  name="firstname"
                  value={adminFormData.firstname}
                  onChange={handleAdminFormChange}
                  className="admin-user-management__form-input"
                  required
                />
              </div>
              <div className="admin-user-management__form-field">
                <label className="admin-user-management__form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastname"
                  value={adminFormData.lastname}
                  onChange={handleAdminFormChange}
                  className="admin-user-management__form-input"
                  required
                />
              </div>
            </div>

            <div className="admin-user-management__form-field">
              <label className="admin-user-management__form-label">Username *</label>
              <input
                type="text"
                name="username"
                value={adminFormData.username}
                onChange={handleAdminFormChange}
                className="admin-user-management__form-input"
                required
              />
            </div>

            <div className="admin-user-management__form-field">
              <label className="admin-user-management__form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={adminFormData.email}
                onChange={handleAdminFormChange}
                className="admin-user-management__form-input"
                required
              />
            </div>

            <div className="admin-user-management__form-field">
              <label className="admin-user-management__form-label">Password *</label>
              <input
                type="password"
                name="password"
                value={adminFormData.password}
                onChange={handleAdminFormChange}
                className="admin-user-management__form-input"
                required
                minLength="6"
              />
            </div>

            <div className="admin-user-management__form-actions">
              <button
                type="button"
                className="admin-user-management__form-btn admin-user-management__form-btn--cancel"
                onClick={handleCloseAddAdminModal}
                disabled={adminFormLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-user-management__form-btn admin-user-management__form-btn--submit"
                disabled={adminFormLoading}
              >
                {adminFormLoading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User Details Modal */}
      <div className={`admin-user-management__modal-overlay ${showModal ? 'show' : ''}`} onClick={handleCloseModal}>
        <div className="admin-user-management__modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-user-management__modal-header">
            <h3 className="admin-user-management__modal-title">User Details</h3>
            <button className="admin-user-management__modal-close" onClick={handleCloseModal}>
              ×
            </button>
          </div>
          {selectedUser && (
            <div className="admin-user-management__modal-content">
              <div className="admin-user-management__modal-avatar">
                {selectedUser.name[0].toUpperCase()}
              </div>
              
              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Name</div>
                <div className="admin-user-management__modal-value">{selectedUser.name}</div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Email</div>
                <div className="admin-user-management__modal-value">{selectedUser.email}</div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Username</div>
                <div className="admin-user-management__modal-value">@{selectedUser.username}</div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">User Type</div>
                <div className="admin-user-management__modal-value">
                  {selectedUser.type}
                  {selectedUser.type === "MSME" && selectedUser.category && ` (${selectedUser.category})`}
                </div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Status</div>
                <div className="admin-user-management__modal-value">{selectedUser.status}</div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Join Date</div>
                <div className="admin-user-management__modal-value">{selectedUser.joinDate}</div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Last Activity</div>
                <div className="admin-user-management__modal-value">{selectedUser.activity}</div>
              </div>

              {selectedUser.contactNumber && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">Contact Number</div>
                  <div className="admin-user-management__modal-value">{selectedUser.contactNumber}</div>
                </div>
              )}

              {selectedUser.address && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">Address</div>
                  <div className="admin-user-management__modal-value">{selectedUser.address}</div>
                </div>
              )}

              {selectedUser.clientProfilingNumber && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">Client Profiling Number</div>
                  <div className="admin-user-management__modal-value">{selectedUser.clientProfilingNumber}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default AdminUserManagement;