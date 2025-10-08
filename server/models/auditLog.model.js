const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "SESSION_EXPIRED",
        "FAILED_LOGIN",
        "PASSWORD_CHANGE",
        "PROFILE_UPDATE",
        "USER_CREATE",
        "USER_UPDATE",
        "USER_DELETE",
        "USER_STATUS_CHANGE",
        "PRODUCT_CREATE",
        "PRODUCT_UPDATE",
        "PRODUCT_DELETE",
        "BLOG_CREATE",
        "BLOG_UPDATE",
        "BLOG_DELETE",
        "NOTIFICATION_SEND",
        "SYSTEM_SETTINGS_UPDATE",
        "DATA_EXPORT",
        "DATA_IMPORT",
        "BACKUP_CREATE",
        "OTHER",
      ],
    },
    details: {
      type: String,
      default: null,
    },
    targetEntity: {
      entityType: {
        type: String,
        enum: [
          "USER",
          "PRODUCT",
          "BLOG",
          "NOTIFICATION",
          "SYSTEM",
          "ADMIN",
          "OTHER",
        ],
        default: null,
      },
      entityId: {
        type: String,
        default: null,
      },
      entityName: {
        type: String,
        default: null,
      },
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "ERROR"],
      default: "SUCCESS",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: null, // Duration in milliseconds for login sessions
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ adminUsername: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
