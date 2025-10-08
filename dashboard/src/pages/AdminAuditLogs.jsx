import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useNotification } from '../components/NotificationProvider';
import { format } from 'date-fns';
import '../css/AdminUserManagement.css';

const AdminAuditLogs = () => {
  const { showSuccess, showError } = useNotification();
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    isMobile: false,
    isCollapsed: false
  });
  
  // Data states
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeStatFilter, setActiveStatFilter] = useState(null);

  const actionTypes = [
    'LOGIN', 'LOGOUT', 'SESSION_EXPIRED', 'FAILED_LOGIN', 'PASSWORD_CHANGE',
    'PROFILE_UPDATE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_STATUS_CHANGE',
    'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'BLOG_CREATE', 'BLOG_UPDATE',
    'BLOG_DELETE', 'NOTIFICATION_SEND', 'SYSTEM_SETTINGS_UPDATE', 'DATA_EXPORT',
    'DATA_IMPORT', 'BACKUP_CREATE', 'OTHER'
  ];

  const statusTypes = ['SUCCESS', 'FAILED', 'ERROR'];

  useEffect(() => {
    fetchAuditLogs();
    fetchStatistics();
  }, [currentPage, actionFilter, statusFilter, searchTerm, startDate, endDate]);

  // Auto-refresh every 30 seconds to catch new logout entries
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAuditLogs();
      fetchStatistics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: logsPerPage,
        adminUsername: searchTerm,
        action: actionFilter !== 'all' ? actionFilter : '',
        status: statusFilter !== 'all' ? statusFilter : '',
        startDate: startDate,
        endDate: endDate
      });

      // Remove empty parameters
      for (let [key, value] of queryParams.entries()) {
        if (!value) queryParams.delete(key);
      }

      const response = await fetch(`http://localhost:1337/api/admin/audit-logs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.data || []);
        setTotalCount(data.pagination?.count || 0);
      } else {
        showError('Failed to fetch audit logs');
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showError('Failed to fetch audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/admin/audit-logs/statistics?timeframe=30d');
      const data = await response.json();
      
      if (data.success) {
        setStatistics(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setActiveStatFilter(null);
  };

  const handleStatBoxClick = (statType) => {
    if (activeStatFilter === statType) {
      setActiveStatFilter(null);
      handleClearFilters();
    } else {
      setActiveStatFilter(statType);
      setCurrentPage(1);
      
      switch (statType) {
        case 'login':
          setActionFilter('LOGIN');
          break;
        case 'logout':
          setActionFilter('LOGOUT');
          break;
        case 'failed':
          setActionFilter('FAILED_LOGIN');
          break;
        case 'success':
          setStatusFilter('SUCCESS');
          break;
        case 'error':
          setStatusFilter('FAILED');
          break;
        default:
          break;
      }
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return '🔓';
      case 'LOGOUT':
        return '🔒';
      case 'FAILED_LOGIN':
        return '❌';
      case 'SESSION_EXPIRED':
        return '⏰';
      default:
        return '🔧';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'admin-user-management__status-badge--active';
      case 'FAILED':
        return 'admin-user-management__status-badge--rejected';
      case 'ERROR':
        return 'admin-user-management__status-badge--suspended';
      default:
        return 'admin-user-management__status-badge--pending';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate statistics from data
  const stats = {
    total: logs.length,
    login: logs.filter(log => log.action === 'LOGIN').length,
    logout: logs.filter(log => log.action === 'LOGOUT').length,
    failed: logs.filter(log => log.action === 'FAILED_LOGIN').length,
    success: logs.filter(log => log.status === 'SUCCESS').length,
    error: logs.filter(log => log.status === 'FAILED' || log.status === 'ERROR').length
  };

  // Helper function to find corresponding logout for a login
  const findLogoutForLogin = (loginLog) => {
    if (loginLog.action !== 'LOGIN') return null;
    
    // Find the next logout for the same admin after this login
    return logs.find(log => 
      log.action === 'LOGOUT' && 
      String(log.adminId) === String(loginLog.adminId) &&
      String(log.adminUsername) === String(loginLog.adminUsername) &&
      new Date(log.createdAt) > new Date(loginLog.createdAt)
    );
  };

  // Helper function to find corresponding login for a logout
  const findLoginForLogout = (logoutLog) => {
    if (logoutLog.action !== 'LOGOUT') return null;
    
    // Find the most recent login for the same admin before this logout
    const loginLogs = logs.filter(log => 
      log.action === 'LOGIN' && 
      String(log.adminId) === String(logoutLog.adminId) &&
      String(log.adminUsername) === String(logoutLog.adminUsername) &&
      new Date(log.createdAt) < new Date(logoutLog.createdAt)
    );
    
    return loginLogs.length > 0 ? loginLogs[loginLogs.length - 1] : null;
  };

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
                         log.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.adminUsername?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    let matchesDate = true;
    if (startDate && endDate) {
      const logDate = new Date(log.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDate = logDate >= start && logDate <= end;
    }
    
    return matchesSearch && matchesAction && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Login Time', 'Admin', 'Username', 'Action', 'Status', 'Logout Time', 'Details'].join(','),
        ...filteredLogs.map(log => {
          let loginTime = 'N/A';
          let logoutTime = 'N/A';
          
          if (log.action === 'LOGIN') {
            loginTime = format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss');
            const correspondingLogout = findLogoutForLogin(log);
            if (correspondingLogout) {
              logoutTime = format(new Date(correspondingLogout.createdAt), 'yyyy-MM-dd HH:mm:ss');
            } else {
              logoutTime = 'Still Active';
            }
          } else if (log.action === 'LOGOUT') {
            logoutTime = format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss');
            const correspondingLogin = findLoginForLogout(log);
            if (correspondingLogin) {
              loginTime = format(new Date(correspondingLogin.createdAt), 'yyyy-MM-dd HH:mm:ss');
            }
          }
          
          return [
            loginTime,
            log.adminName || '',
            log.adminUsername || '',
            log.action || '',
            log.status || '',
            logoutTime,
            `"${log.details || ''}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSuccess('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      showError('Failed to export audit logs');
    }
  };

  return (
    <div className="admin-user-management">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="admin-user-management__header">
          <div className="admin-user-management__header-content">
            <div className="admin-user-management__header-text">
              <h1>Admin Audit Logs</h1>
              <p>Monitor and track all administrative activities and security events.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-user-management__stats">
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'total' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('total')}
          >
            <span className="admin-user-management__stat-value">{stats.total}</span>
            <span className="admin-user-management__stat-label">Total Logs</span>
          </div>
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'login' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('login')}
          >
            <span className="admin-user-management__stat-value">{stats.login}</span>
            <span className="admin-user-management__stat-label">Login Events</span>
          </div>
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'logout' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('logout')}
          >
            <span className="admin-user-management__stat-value">{stats.logout}</span>
            <span className="admin-user-management__stat-label">Logout Events</span>
          </div>
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'failed' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('failed')}
          >
            <span className="admin-user-management__stat-value">{stats.failed}</span>
            <span className="admin-user-management__stat-label">Failed Attempts</span>
          </div>
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'success' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('success')}
          >
            <span className="admin-user-management__stat-value">{stats.success}</span>
            <span className="admin-user-management__stat-label">Successful</span>
          </div>
          <div 
            className={`admin-user-management__stat-box ${activeStatFilter === 'error' ? 'admin-user-management__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('error')}
          >
            <span className="admin-user-management__stat-value">{stats.error}</span>
            <span className="admin-user-management__stat-label">Errors</span>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-user-management__filters">
          <div className="admin-user-management__filters-row">
            <input 
              type="text" 
              placeholder="Search admin username..." 
              className="admin-user-management__search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="admin-user-management__filter-dropdown"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <select 
              className="admin-user-management__filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {statusTypes.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="admin-user-management__filter-dropdown"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <input
              type="date"
              className="admin-user-management__filter-dropdown"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
            <button 
              className="admin-user-management__refresh-btn"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
            <button 
              className="admin-user-management__refresh-btn"
              onClick={() => {
                fetchAuditLogs();
                fetchStatistics();
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button 
              className="admin-user-management__refresh-btn"
              onClick={exportLogs}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="admin-user-management__table-section">
          {loading ? (
            <div className="admin-user-management__loading">Loading audit logs...</div>
          ) : (
            <table className="admin-user-management__table">
              <thead>
                <tr>
                  <th>Login Time</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Logout Time</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-user-management__no-data">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div className="admin-user-management__timestamp">
                          {log.action === 'LOGIN' ? (
                            <>
                              {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                              <div className="admin-user-management__time">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </div>
                            </>
                          ) : log.action === 'LOGOUT' ? (
                            (() => {
                              const correspondingLogin = findLoginForLogout(log);
                              return correspondingLogin ? (
                                <>
                                  {format(new Date(correspondingLogin.createdAt), 'yyyy-MM-dd')}
                                  <div className="admin-user-management__time">
                                    {format(new Date(correspondingLogin.createdAt), 'HH:mm:ss')}
                                  </div>
                                </>
                              ) : (
                                <span className="admin-user-management__na-text">N/A</span>
                              );
                            })()
                          ) : (
                            <span className="admin-user-management__na-text">N/A</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-management__user-cell">
                          <div className="admin-user-management__avatar">
                            {log.adminName ? log.adminName[0].toUpperCase() : 'A'}
                          </div>
                          <div className="admin-user-management__user-info">
                            <div className="admin-user-management__user-name">{log.adminName || 'Unknown'}</div>
                            <div className="admin-user-management__user-username">@{log.adminUsername || 'unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-management__action-cell">
                          <span className="admin-user-management__action-icon">
                            {getActionIcon(log.action)}
                          </span>
                          <span className="admin-user-management__action-text">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-user-management__status-badge ${getStatusClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-user-management__timestamp">
                          {log.action === 'LOGOUT' ? (
                            <>
                              {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                              <div className="admin-user-management__time">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </div>
                            </>
                          ) : log.action === 'LOGIN' ? (
                            (() => {
                              const correspondingLogout = findLogoutForLogin(log);
                              return correspondingLogout ? (
                                <>
                                  {format(new Date(correspondingLogout.createdAt), 'yyyy-MM-dd')}
                                  <div className="admin-user-management__time">
                                    {format(new Date(correspondingLogout.createdAt), 'HH:mm:ss')}
                                  </div>
                                </>
                              ) : (
                                <span className="admin-user-management__na-text">Still Active</span>
                              );
                            })()
                          ) : (
                            <span className="admin-user-management__na-text">N/A</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-management__details">
                          {log.details || 'No details'}
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-management__actions">
                          <button 
                            className="admin-user-management__view-btn"
                            onClick={() => handleViewDetails(log)}
                            title="View Details"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-user-management__pagination">
            <button 
              className="admin-user-management__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="admin-user-management__pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="admin-user-management__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <div className={`admin-user-management__modal-overlay ${showModal ? 'show' : ''}`} onClick={handleCloseModal}>
        <div className="admin-user-management__modal admin-user-management__modal--audit-details" onClick={(e) => e.stopPropagation()}>
          <div className="admin-user-management__modal-header">
            <h3 className="admin-user-management__modal-title">Audit Log Details</h3>
            <button className="admin-user-management__modal-close" onClick={handleCloseModal}>
              ×
            </button>
          </div>
          {selectedLog && (
            <div className="admin-user-management__modal-content">
              <div className="admin-user-management__modal-avatar">
                {selectedLog.adminName ? selectedLog.adminName[0].toUpperCase() : 'A'}
              </div>
              
              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Action Timestamp</div>
                <div className="admin-user-management__modal-value">
                  {format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Admin</div>
                <div className="admin-user-management__modal-value">
                  {selectedLog.adminName || 'Unknown'} (@{selectedLog.adminUsername || 'unknown'})
                </div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Action</div>
                <div className="admin-user-management__modal-value">
                  {getActionIcon(selectedLog.action)} {selectedLog.action}
                </div>
              </div>

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Status</div>
                <div className="admin-user-management__modal-value">
                  <span className={`admin-user-management__status-badge ${getStatusClass(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              {selectedLog.action === 'LOGIN' && (() => {
                const correspondingLogout = findLogoutForLogin(selectedLog);
                return correspondingLogout ? (
                  <div className="admin-user-management__modal-field">
                    <div className="admin-user-management__modal-label">Logout Time</div>
                    <div className="admin-user-management__modal-value">
                      {format(new Date(correspondingLogout.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                ) : (
                  <div className="admin-user-management__modal-field">
                    <div className="admin-user-management__modal-label">Session Status</div>
                    <div className="admin-user-management__modal-value">
                      <span className="admin-user-management__status-badge admin-user-management__status-badge--active">
                        Still Active
                      </span>
                    </div>
                  </div>
                );
              })()}

              {selectedLog.action === 'LOGOUT' && (() => {
                const correspondingLogin = findLoginForLogout(selectedLog);
                return correspondingLogin ? (
                  <div className="admin-user-management__modal-field">
                    <div className="admin-user-management__modal-label">Login Time</div>
                    <div className="admin-user-management__modal-value">
                      {format(new Date(correspondingLogin.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                ) : null;
              })()}

              {selectedLog.duration && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">Session Duration</div>
                  <div className="admin-user-management__modal-value">
                    {formatDuration(selectedLog.duration)}
                  </div>
                </div>
              )}

              <div className="admin-user-management__modal-field">
                <div className="admin-user-management__modal-label">Details</div>
                <div className="admin-user-management__modal-value">
                  {selectedLog.details || 'No additional details'}
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">Error Message</div>
                  <div className="admin-user-management__modal-value admin-user-management__error-message">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="admin-user-management__modal-field">
                  <div className="admin-user-management__modal-label">User Agent</div>
                  <div className="admin-user-management__modal-value admin-user-management__user-agent">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.targetEntity?.entityType && (
                <>
                  <div className="admin-user-management__modal-field">
                    <div className="admin-user-management__modal-label">Target Entity Type</div>
                    <div className="admin-user-management__modal-value">
                      {selectedLog.targetEntity.entityType}
                    </div>
                  </div>
                  
                  {selectedLog.targetEntity.entityId && (
                    <div className="admin-user-management__modal-field">
                      <div className="admin-user-management__modal-label">Target Entity ID</div>
                      <div className="admin-user-management__modal-value">
                        {selectedLog.targetEntity.entityId}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.targetEntity.entityName && (
                    <div className="admin-user-management__modal-field">
                      <div className="admin-user-management__modal-label">Target Entity Name</div>
                      <div className="admin-user-management__modal-value">
                        {selectedLog.targetEntity.entityName}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;