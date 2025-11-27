import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useNotification } from '../components/NotificationProvider';
import { format } from 'date-fns';
import '../css/AdminAuditLogs-standalone.css';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

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
      return 'audit-logs__content audit-logs__content--mobile';
    }
    return sidebarState.isOpen 
      ? 'audit-logs__content audit-logs__content--sidebar-open' 
      : 'audit-logs__content audit-logs__content--sidebar-collapsed';
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
      // First clear all filters to prevent conflicts
      setSearchTerm('');
      setActionFilter('all');
      setStatusFilter('all');
      setStartDate('');
      setEndDate('');
      setCurrentPage(1);
      setActiveStatFilter(statType);
      
      // Then apply the specific filter
      switch (statType) {
        case 'total':
          // Show all logs, no specific filter needed
          break;
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
        return <LoginIcon sx={{ fontSize: 16, color: '#28a745' }} />;
      case 'LOGOUT':
        return <LogoutIcon sx={{ fontSize: 16, color: '#6c757d' }} />;
      case 'FAILED_LOGIN':
        return <ErrorIcon sx={{ fontSize: 16, color: '#dc3545' }} />;
      case 'SESSION_EXPIRED':
        return <AccessTimeIcon sx={{ fontSize: 16, color: '#ffc107' }} />;
      default:
        return <BuildIcon sx={{ fontSize: 16, color: '#17a2b8' }} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'audit-logs__status-badge--success';
      case 'FAILED':
        return 'audit-logs__status-badge--failed';
      case 'ERROR':
        return 'audit-logs__status-badge--error';
      default:
        return 'audit-logs__status-badge--error';
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
    <div className="audit-logs">
      <AdminSidebar onSidebarToggle={handleSidebarToggle} />
      <div className={getContentClass()}>
        <div className="audit-logs__header">
          <div className="audit-logs__header-content">
            <div className="audit-logs__header-text">
              <h1>Admin Audit Logs</h1>
              <p>Monitor and track all administrative activities and security events.</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="audit-logs__stats">
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'total' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('total')}
          >
            <span className="audit-logs__stat-value">{stats.total}</span>
            <span className="audit-logs__stat-label">Total Logs</span>
          </div>
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'login' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('login')}
          >
            <span className="audit-logs__stat-value">{stats.login}</span>
            <span className="audit-logs__stat-label">Login Events</span>
          </div>
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'logout' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('logout')}
          >
            <span className="audit-logs__stat-value">{stats.logout}</span>
            <span className="audit-logs__stat-label">Logout Events</span>
          </div>
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'failed' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('failed')}
          >
            <span className="audit-logs__stat-value">{stats.failed}</span>
            <span className="audit-logs__stat-label">Failed Attempts</span>
          </div>
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'success' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('success')}
          >
            <span className="audit-logs__stat-value">{stats.success}</span>
            <span className="audit-logs__stat-label">Successful</span>
          </div>
          <div 
            className={`audit-logs__stat-box ${activeStatFilter === 'error' ? 'audit-logs__stat-box--active' : ''}`}
            onClick={() => handleStatBoxClick('error')}
          >
            <span className="audit-logs__stat-value">{stats.error}</span>
            <span className="audit-logs__stat-label">Errors</span>
          </div>
        </div>

        {/* Filters */}
        <div className="audit-logs__filters">
          <div className="audit-logs__filters-row">
            <input 
              type="text" 
              placeholder="Search admin username..." 
              className="audit-logs__search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="audit-logs__filter-dropdown"
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
              className="audit-logs__filter-dropdown"
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
              className="audit-logs__filter-dropdown"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <input
              type="date"
              className="audit-logs__filter-dropdown"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
            <button 
              className="audit-logs__refresh-btn"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
            <button 
              className="audit-logs__refresh-btn"
              onClick={() => {
                fetchAuditLogs();
                fetchStatistics();
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button 
              className="audit-logs__export-btn"
              onClick={exportLogs}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="audit-logs__table-section">
          {loading ? (
            <div className="audit-logs__loading">Loading audit logs...</div>
          ) : (
            <table className="audit-logs__table">
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
                    <td colSpan="7" className="audit-logs__no-data">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <div className="audit-logs__timestamp">
                          {log.action === 'LOGIN' ? (
                            <>
                              {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                              <div className="audit-logs__time">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </div>
                            </>
                          ) : log.action === 'LOGOUT' ? (
                            (() => {
                              const correspondingLogin = findLoginForLogout(log);
                              return correspondingLogin ? (
                                <>
                                  {format(new Date(correspondingLogin.createdAt), 'yyyy-MM-dd')}
                                  <div className="audit-logs__time">
                                    {format(new Date(correspondingLogin.createdAt), 'HH:mm:ss')}
                                  </div>
                                </>
                              ) : (
                                <span className="audit-logs__na-text">N/A</span>
                              );
                            })()
                          ) : (
                            <span className="audit-logs__na-text">N/A</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="audit-logs__user-cell">
                          <div className="audit-logs__avatar">
                            {log.adminName ? log.adminName[0].toUpperCase() : 'A'}
                          </div>
                          <div className="audit-logs__user-info">
                            <div className="audit-logs__user-name">{log.adminName || 'Unknown'}</div>
                            <div className="audit-logs__user-username">@{log.adminUsername || 'unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="audit-logs__action-cell">
                          <span className="audit-logs__action-icon">
                            {getActionIcon(log.action)}
                          </span>
                          <span className="audit-logs__action-text">
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`audit-logs__status-badge ${getStatusClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <div className="audit-logs__timestamp">
                          {log.action === 'LOGOUT' ? (
                            <>
                              {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                              <div className="audit-logs__time">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </div>
                            </>
                          ) : log.action === 'LOGIN' ? (
                            (() => {
                              const correspondingLogout = findLogoutForLogin(log);
                              return correspondingLogout ? (
                                <>
                                  {format(new Date(correspondingLogout.createdAt), 'yyyy-MM-dd')}
                                  <div className="audit-logs__time">
                                    {format(new Date(correspondingLogout.createdAt), 'HH:mm:ss')}
                                  </div>
                                </>
                              ) : (
                                <span className="audit-logs__na-text">Still Active</span>
                              );
                            })()
                          ) : (
                            <span className="audit-logs__na-text">N/A</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="audit-logs__details">
                          {log.details || 'No details'}
                        </div>
                      </td>
                      <td>
                        <div className="audit-logs__actions">
                          <button 
                            className="audit-logs__view-btn"
                            onClick={() => handleViewDetails(log)}
                            title="View Details"
                          >
                            <VisibilityIcon sx={{ fontSize: 16 }} />
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
          <div className="audit-logs__pagination">
            <button 
              className="audit-logs__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="audit-logs__pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="audit-logs__pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <div className={`audit-logs__modal-overlay ${showModal ? 'show' : ''}`} onClick={handleCloseModal}>
        <div className="audit-logs__modal audit-logs__modal--audit-details" onClick={(e) => e.stopPropagation()}>
          <div className="audit-logs__modal-header">
            <h3 className="audit-logs__modal-title">Audit Log Details</h3>
            <button className="audit-logs__modal-close" onClick={handleCloseModal}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
          {selectedLog && (
            <div className="audit-logs__modal-content">
              <div className="audit-logs__modal-avatar">
                {selectedLog.adminName ? selectedLog.adminName[0].toUpperCase() : 'A'}
              </div>
              
              <div className="audit-logs__modal-field">
                <div className="audit-logs__modal-label">Action Timestamp</div>
                <div className="audit-logs__modal-value">
                  {format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                </div>
              </div>

              <div className="audit-logs__modal-field">
                <div className="audit-logs__modal-label">Admin</div>
                <div className="audit-logs__modal-value">
                  {selectedLog.adminName || 'Unknown'} (@{selectedLog.adminUsername || 'unknown'})
                </div>
              </div>

              <div className="audit-logs__modal-field">
                <div className="audit-logs__modal-label">Action</div>
                <div className="audit-logs__modal-value">
                  {getActionIcon(selectedLog.action)} {selectedLog.action}
                </div>
              </div>

              <div className="audit-logs__modal-field">
                <div className="audit-logs__modal-label">Status</div>
                <div className="audit-logs__modal-value">
                  <span className={`audit-logs__status-badge ${getStatusClass(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>

              {selectedLog.action === 'LOGIN' && (() => {
                const correspondingLogout = findLogoutForLogin(selectedLog);
                return correspondingLogout ? (
                  <div className="audit-logs__modal-field">
                    <div className="audit-logs__modal-label">Logout Time</div>
                    <div className="audit-logs__modal-value">
                      {format(new Date(correspondingLogout.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                ) : (
                  <div className="audit-logs__modal-field">
                    <div className="audit-logs__modal-label">Session Status</div>
                    <div className="audit-logs__modal-value">
                      <span className="audit-logs__status-badge audit-logs__status-badge--success">
                        Still Active
                      </span>
                    </div>
                  </div>
                );
              })()}

              {selectedLog.action === 'LOGOUT' && (() => {
                const correspondingLogin = findLoginForLogout(selectedLog);
                return correspondingLogin ? (
                  <div className="audit-logs__modal-field">
                    <div className="audit-logs__modal-label">Login Time</div>
                    <div className="audit-logs__modal-value">
                      {format(new Date(correspondingLogin.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </div>
                ) : null;
              })()}

              {selectedLog.duration && (
                <div className="audit-logs__modal-field">
                  <div className="audit-logs__modal-label">Session Duration</div>
                  <div className="audit-logs__modal-value">
                    {formatDuration(selectedLog.duration)}
                  </div>
                </div>
              )}

              <div className="audit-logs__modal-field">
                <div className="audit-logs__modal-label">Details</div>
                <div className="audit-logs__modal-value">
                  {selectedLog.details || 'No additional details'}
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="audit-logs__modal-field">
                  <div className="audit-logs__modal-label">Error Message</div>
                  <div className="audit-logs__modal-value audit-logs__error-message">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {selectedLog.userAgent && (
                <div className="audit-logs__modal-field">
                  <div className="audit-logs__modal-label">User Agent</div>
                  <div className="audit-logs__modal-value audit-logs__user-agent">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {selectedLog.targetEntity?.entityType && (
                <>
                  <div className="audit-logs__modal-field">
                    <div className="audit-logs__modal-label">Target Entity Type</div>
                    <div className="audit-logs__modal-value">
                      {selectedLog.targetEntity.entityType}
                    </div>
                  </div>
                  
                  {selectedLog.targetEntity.entityId && (
                    <div className="audit-logs__modal-field">
                      <div className="audit-logs__modal-label">Target Entity ID</div>
                      <div className="audit-logs__modal-value">
                        {selectedLog.targetEntity.entityId}
                      </div>
                    </div>
                  )}
                  
                  {selectedLog.targetEntity.entityName && (
                    <div className="audit-logs__modal-field">
                      <div className="audit-logs__modal-label">Target Entity Name</div>
                      <div className="audit-logs__modal-value">
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