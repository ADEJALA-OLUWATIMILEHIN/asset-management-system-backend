





import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class AuditLog extends Model {
  id!: number;
  userId!: number | null;
  userLabel!: string;
  action!: "CREATED" | "UPDATED" | "DELETED" | "LOGIN" | "FAILED_LOGIN";
  targetModule!: string;
  targetId!: string | null;
  ipAddress!: string | null;
  isFlagged!: boolean;
  encryptionInfo!: string | null;
  chainHash!: string | null;
  timestamp!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Null for unknown agents e.g. failed logins",
    },
    userLabel: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Snapshot of user name at time of action",
    },
    action: {
      type: DataTypes.ENUM(
        "CREATED",
        "UPDATED",
        "DELETED",
        "LOGIN",
        "FAILED_LOGIN"
      ),
      allowNull: false,
    },
    targetModule: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. Asset, Authentication Service, System Policy",
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID of the affected record",
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "True for failed logins or suspicious IP activity",
    },
    encryptionInfo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. AES-256 ACTIVE",
    },
    chainHash: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Cryptographic integrity hash for immutable ledger",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "AuditLog",
    timestamps: false,
    tableName: "audit_logs",
  }
);

export default AuditLog;