# Admin Audit Log System

This document describes the comprehensive audit logging system implemented for admin activities in the ELako platform.

## Overview

The audit log system tracks all admin activities including login/logout events, failed login attempts, and administrative actions with detailed information about timestamps, user details, IP addresses, and session durations.

## Components

### 1. Database Model (`server/models/auditLog.model.js`)

- Stores comprehensive audit log entries
- Includes admin identification, action types, timestamps, IP addresses, user agents
- Indexed for efficient querying
- Supports various action types (LOGIN, LOGOUT, FAILED_LOGIN, etc.)

### 2. Audit Log Service (`server/services/auditLogService.js`)

- Centralized service for creating and managing audit logs
- Methods for logging different types of activities
- Pagination and filtering support
- Statistics generation
- Data export capabilities

### 3. Server Integration (`server/index.js`)

- Modified admin login endpoint to include audit logging
- New admin logout endpoint with session duration tracking
- API endpoints for retrieving audit logs and statistics
- Automatic logging of failed login attempts

### 4. Frontend Components

#### Admin Audit Logs Page (`dashboard/src/pages/AdminAuditLogs.jsx`)

- Comprehensive audit log viewer with Material-UI components
- Real-time filtering and search capabilities
- Pagination support
- Detailed log entry viewer
- Statistics dashboard
- CSV export functionality

#### Session Management (`dashboard/src/hooks/useAdminSession.js`)

- Tracks admin login timestamps
- Handles logout with session duration calculation
- Automatic audit logging on session end

#### Authentication Context (`dashboard/src/contexts/AuthContext.jsx`)

- Enhanced logout functionality with audit logging
- Session duration tracking
- Automatic cleanup of session data

## Features

### 1. Tracked Activities

- **Authentication Events**: Login, Logout, Failed Login, Session Expired
- **User Management**: User Create/Update/Delete, Status Changes
- **Content Management**: Product/Blog Create/Update/Delete
- **System Activities**: Settings Update, Data Export/Import, Backup Creation
- **Custom Actions**: Extensible for additional activity types

### 2. Logged Information

- **Admin Details**: ID, Username, Full Name
- **Action Information**: Action Type, Details, Status
- **System Data**: Timestamp, IP Address, User Agent, Session ID
- **Target Entity**: Information about affected resources
- **Session Data**: Duration, Login/Logout times
- **Error Information**: Error messages for failed actions

### 3. Security Features

- **IP Address Tracking**: Monitor access from different locations
- **Session Duration**: Track how long admins are logged in
- **Failed Attempt Monitoring**: Detect potential security threats
- **Comprehensive Logging**: All admin actions are recorded

### 4. User Interface

- **Dashboard View**: Statistics and overview of admin activities
- **Filtering**: Filter by admin, action type, date range, status
- **Search**: Search through log entries
- **Pagination**: Efficient handling of large log datasets
- **Export**: CSV export for external analysis
- **Detail View**: Comprehensive information for each log entry

## API Endpoints

### Authentication

- `POST /api/admin/login` - Enhanced with audit logging
- `POST /api/admin/logout` - New endpoint for logout logging

### Audit Logs

- `GET /api/admin/audit-logs` - Retrieve audit logs with filtering
- `GET /api/admin/audit-logs/statistics` - Get activity statistics

## Usage

### For Administrators

1. Navigate to "Audit Logs" in the admin sidebar
2. View comprehensive activity logs
3. Filter by admin, action type, or date range
4. Export logs for compliance or analysis
5. Monitor security events and system usage

### For Developers

1. Use `AuditLogService` to log custom activities
2. Add new action types to the enum in the model
3. Extend filtering capabilities as needed
4. Create custom reports using the statistics API

## Database Schema

```javascript
{
  adminId: String,           // Admin identifier
  adminUsername: String,     // Admin username
  adminName: String,         // Admin full name
  action: String,            // Action type (enum)
  details: String,           // Action description
  targetEntity: {            // Affected resource
    entityType: String,
    entityId: String,
    entityName: String
  },
  ipAddress: String,         // Client IP
  userAgent: String,         // Browser info
  sessionId: String,         // Session identifier
  status: String,            // SUCCESS/FAILED/ERROR
  errorMessage: String,      // Error details
  duration: Number,          // Session duration (ms)
  metadata: Mixed,           // Additional data
  createdAt: Date,           // Timestamp
  updatedAt: Date            // Last modified
}
```

## Configuration

### Environment Variables

- Database connection settings
- Log retention period (default: 365 days)
- Maximum log entries per page (default: 20)

### Customization

- Add new action types in the model enum
- Extend filtering options in the service
- Customize UI components for specific needs
- Configure automatic log cleanup schedules

## Security Considerations

1. **Data Privacy**: Sensitive information is not logged
2. **Access Control**: Only admins can view audit logs
3. **Data Retention**: Old logs are automatically cleaned up
4. **Performance**: Indexed queries for efficient retrieval
5. **Integrity**: Logs cannot be modified once created

## Compliance

This audit log system helps meet compliance requirements for:

- SOX (Sarbanes-Oxley Act)
- GDPR (General Data Protection Regulation)
- ISO 27001 (Information Security Management)
- PCI DSS (Payment Card Industry Data Security Standard)

## Maintenance

### Regular Tasks

1. Monitor log storage usage
2. Review security events
3. Archive old logs if needed
4. Update retention policies
5. Verify backup procedures

### Performance Optimization

1. Database indexing on frequently queried fields
2. Pagination for large datasets
3. Efficient filtering algorithms
4. Background log cleanup processes

## Future Enhancements

1. **Real-time Monitoring**: WebSocket-based live log updates
2. **Advanced Analytics**: Machine learning for anomaly detection
3. **Integration**: Export to SIEM systems
4. **Alerts**: Automated notifications for suspicious activities
5. **Reporting**: Scheduled reports for management
