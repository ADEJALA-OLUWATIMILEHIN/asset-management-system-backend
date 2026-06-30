// 


import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class CalendarEvent extends Model {
  id!: number;
  title!: string;
  eventType!: string;
  eventDate!: Date;
  linkedAssetId!: number | null;
  linkedDocId!: number | null;
  isCritical!: boolean;
  isResolved!: boolean;
}

CalendarEvent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. Ins. Renewal #492",
    },
    eventType: {
      type: DataTypes.ENUM(
        "INSURANCE_RENEWAL",
        "MAINTENANCE_DUE",
        "LICENSE_EXPIRY",
        "AUDIT_SCHEDULE",
        "LEASE_PAYMENT"
      ),
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    linkedAssetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "assets",
        key: "id",
      },
    },
    linkedDocId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "documents",
        key: "id",
      },
    },
    isCritical: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Drives the critical alerts panel",
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "CalendarEvent",
    timestamps: true,
    tableName: "calendar_events",
  }
);

export default CalendarEvent;