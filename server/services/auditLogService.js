const AuditLog = require("../models/auditLog.model");
const Admin = require("../models/admin.model");

class AuditLogService {
  /**
   * Create an audit log entry
   * @param {Object} logData - The audit log data
   * @returns {Promise<Object>} - The created audit log
   */
  static async createLog(logData) {
    try {
      const auditLog = new AuditLog({
        ...logData,
        timestamp: new Date(),
      });

      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error("Error creating audit log:", error);
      // Don't throw error to prevent audit logging from breaking main functionality
      return null;
    }
  }

  /**
   * Log admin login
   */
  static async logLogin(adminData, req, sessionId = null) {
    const logData = {
      adminId: adminData.id || adminData._id,
      adminUsername: adminData.username,
      adminName: `${adminData.firstname} ${adminData.lastname}`,
      action: "LOGIN",
      details: "Admin successfully logged in",
      ipAddress:
        req.ip ||
        req.connection.remoteAddress ||
        req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      sessionId: sessionId,
      status: "SUCCESS",
    };

    return await this.createLog(logData);
  }

  /**
   * Log admin logout
   */
  static async logLogout(adminData, req, sessionDuration = null) {
    const logData = {
      adminId: adminData.id || adminData._id,
      adminUsername: adminData.username,
      adminName: `${adminData.firstname} ${adminData.lastname}`,
      action: "LOGOUT",
      details: "Admin logged out",
      ipAddress:
        req.ip ||
        req.connection.remoteAddress ||
        req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "SUCCESS",
      duration: sessionDuration,
    };

    return await this.createLog(logData);
  }

  /**
   * Log failed login attempt
   */
  static async logFailedLogin(username, req, errorMessage) {
    const logData = {
      adminId: "unknown",
      adminUsername: username || "unknown",
      adminName: "Unknown",
      action: "FAILED_LOGIN",
      details: "Failed login attempt",
      ipAddress:
        req.ip ||
        req.connection.remoteAddress ||
        req.headers["x-forwarded-for"],
      userAgent: req.headers["user-agent"],
      status: "FAILED",
      errorMessage: errorMessage,
    };

    return await this.createLog(logData);
  }

  /**
   * Log admin action
   */
  static async logAction(
    adminData,
    action,
    details,
    targetEntity = null,
    req = null
  ) {
    const logData = {
      adminId: adminData.id || adminData._id,
      adminUsername: adminData.username,
      adminName: `${adminData.firstname} ${adminData.lastname}`,
      action: action,
      details: details,
      targetEntity: targetEntity,
      ipAddress: req
        ? req.ip ||
          req.connection.remoteAddress ||
          req.headers["x-forwarded-for"]
        : null,
      userAgent: req ? req.headers["user-agent"] : null,
      status: "SUCCESS",
    };

    return await this.createLog(logData);
  }

  /**
   * Get audit logs with pagination and filtering - Only displays logs from users with admin role
   */
  static async getLogs(filters = {}, pagination = {}) {
    try {
      const {
        adminId,
        adminUsername,
        action,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = { ...filters, ...pagination };

      // First, get all admin IDs with 'admin' role (excluding super-admin)
      const adminUsers = await Admin.find({ role: "admin" })
        .select("_id username")
        .lean();
      const adminIds = adminUsers.map((admin) => admin._id.toString());
      const adminUsernames = adminUsers.map((admin) => admin.username);

      const query = {};

      // Only include logs from users with admin role
      if (adminId) {
        // Check if the specified adminId is in our allowed list
        if (adminIds.includes(adminId)) {
          query.adminId = adminId;
        } else {
          // If the adminId is not an admin role, return empty results
          return {
            logs: [],
            pagination: {
              current: parseInt(page),
              total: 0,
              count: 0,
              limit: parseInt(limit),
            },
          };
        }
      } else {
        // Filter to only show logs from admin role users
        query.adminId = { $in: adminIds };
      }

      if (adminUsername) {
        // Filter username search to only admin role users
        const matchingUsernames = adminUsernames.filter((username) =>
          username.toLowerCase().includes(adminUsername.toLowerCase())
        );
        if (matchingUsernames.length > 0) {
          query.adminUsername = new RegExp(matchingUsernames.join("|"), "i");
        } else {
          // If no matching usernames found in admin role users, return empty
          return {
            logs: [],
            pagination: {
              current: parseInt(page),
              total: 0,
              count: 0,
              limit: parseInt(limit),
            },
          };
        }
      }

      if (action) query.action = action;
      if (status) query.status = status;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AuditLog.countDocuments(query),
      ]);

      return {
        logs,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total,
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      console.error("Error getting audit logs:", error);
      throw error;
    }
  }

  /**
   * Get audit log statistics - Only includes logs from users with admin role
   */
  static async getStatistics(timeframe = "30d") {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeframe) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Get all admin IDs with 'admin' role (excluding super-admin)
      const adminUsers = await Admin.find({ role: "admin" })
        .select("_id")
        .lean();
      const adminIds = adminUsers.map((admin) => admin._id.toString());

      const stats = await AuditLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            adminId: { $in: adminIds }, // Only include logs from admin role users
          },
        },
        {
          $group: {
            _id: {
              action: "$action",
              status: "$status",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.action",
            total: { $sum: "$count" },
            success: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "SUCCESS"] }, "$count", 0],
              },
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "FAILED"] }, "$count", 0],
              },
            },
          },
        },
      ]);

      return stats;
    } catch (error) {
      console.error("Error getting audit statistics:", error);
      throw error;
    }
  }

  /**
   * Clean old audit logs (optional - for maintenance)
   */
  static async cleanOldLogs(daysToKeep = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      console.log(`Cleaned ${result.deletedCount} old audit logs`);
      return result;
    } catch (error) {
      console.error("Error cleaning old audit logs:", error);
      throw error;
    }
  }
}

module.exports = AuditLogService;
