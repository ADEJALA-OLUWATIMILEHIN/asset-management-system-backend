import User from "./user";
import Department from "./department";
import Vendor from "./staff";
import Asset from "./asset";
import Document from "./document";
import MaintenanceRecord from "./record";
import AuditLog from "./report";
import CalendarEvent from "./calendar";
import Notification from "./notification";
import PermissionMatrix from "./permissionmatrix";
import SystemSettings from "./systemsettings";

// ── Department ↔ User (manager) ──────────────────────────────────────────────
Department.belongsTo(User, { foreignKey: "manager_id", as: "manager" });
User.hasMany(Department, { foreignKey: "manager_id", as: "managedDepartments" });

// ── User ↔ Department (member) ────────────────────────────────────────────────
User.belongsTo(Department, { foreignKey: "department_id", as: "department" });
Department.hasMany(User, { foreignKey: "department_id", as: "members" });

// ── Asset ↔ Vendor ────────────────────────────────────────────────────────────
Asset.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });
Vendor.hasMany(Asset, { foreignKey: "vendorId", as: "assets" });

Vendor.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Vendor, { foreignKey: "userId", as: "staffProfile" });

// ── Asset ↔ User (custodian) ──────────────────────────────────────────────────
Asset.belongsTo(User, { foreignKey: "custodianId", as: "custodian" });
User.hasMany(Asset, { foreignKey: "custodianId", as: "custodiedAssets" });

// ── Asset ↔ Department ───────────────────────────────────────────────────────
Asset.belongsTo(Department, { foreignKey: "departmentId", as: "department" });
Department.hasMany(Asset, { foreignKey: "departmentId", as: "assets" });

// ── Document ↔ Asset ─────────────────────────────────────────────────────────
Document.belongsTo(Asset, { foreignKey: "linkedAssetId", as: "asset" });
Asset.hasMany(Document, { foreignKey: "linkedAssetId", as: "documents" });

// ── Asset ↔ Document (insurance policy) ──────────────────────────────────────
Asset.belongsTo(Document, { foreignKey: "insurancePolicyId", as: "insurancePolicy" });

// ── Document ↔ User (uploader) ───────────────────────────────────────────────
Document.belongsTo(User, { foreignKey: "uploadedBy", as: "uploader" });
User.hasMany(Document, { foreignKey: "uploadedBy", as: "uploadedDocuments" });

// ── MaintenanceRecord ↔ Asset ─────────────────────────────────────────────────
MaintenanceRecord.belongsTo(Asset, { foreignKey: "assetId", as: "asset" });
Asset.hasMany(MaintenanceRecord, { foreignKey: "assetId", as: "maintenanceRecords" });

// ── MaintenanceRecord ↔ Vendor ────────────────────────────────────────────────
MaintenanceRecord.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });
Vendor.hasMany(MaintenanceRecord, { foreignKey: "vendorId", as: "maintenanceRecords" });

// ── MaintenanceRecord ↔ User (creator) ───────────────────────────────────────
MaintenanceRecord.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
User.hasMany(MaintenanceRecord, { foreignKey: "createdBy", as: "createdMaintenanceRecords" });

// ── AuditLog ↔ User ───────────────────────────────────────────────────────────
AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });

// ── CalendarEvent ↔ Asset ────────────────────────────────────────────────────
CalendarEvent.belongsTo(Asset, { foreignKey: "linkedAssetId", as: "asset" });
Asset.hasMany(CalendarEvent, { foreignKey: "linkedAssetId", as: "calendarEvents" });

// ── CalendarEvent ↔ Document ─────────────────────────────────────────────────
CalendarEvent.belongsTo(Document, { foreignKey: "linkedDocId", as: "document" });
Document.hasMany(CalendarEvent, { foreignKey: "linkedDocId", as: "calendarEvents" });

// ── Notification ↔ User ──────────────────────────────────────────────────────
Notification.belongsTo(User, { foreignKey: "userId", as: "recipient" });
User.hasMany(Notification, { foreignKey: "userId", as: "notifications" });

export {
  User,
  Department,
  Vendor,
  Asset,
  Document,
  MaintenanceRecord,
  AuditLog,
  CalendarEvent,
  Notification,
  PermissionMatrix,
  SystemSettings,
};
