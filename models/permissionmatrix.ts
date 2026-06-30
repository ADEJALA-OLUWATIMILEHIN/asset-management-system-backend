import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class PermissionMatrix extends Model {
  id!: number;
  role!: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
  module!: string;
  canRead!: boolean;
  canCreate!: boolean;
  canUpdate!: boolean;
  canDelete!: boolean;
  canExport!: boolean;
}

PermissionMatrix.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "MANAGER", "VIEWER"),
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. Assets, Users, Documents, Maintenance, Reports, AuditLogs, Settings",
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canCreate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canExport: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "PermissionMatrix",
    timestamps: true,
    tableName: "permission_matrix",
  }
);

export default PermissionMatrix;