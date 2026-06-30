// import { DataTypes, Model } from "sequelize";
// import sequelize from "../config/sequelize";

// class Reminder extends Model {
//   reminder_id!: number;
//   asset_id!: number;
//   maintenance_id!: number;
//   reminder_date!: Date;
//   notification_type!: string;
//   status!: string;
// }

// Reminder.init(
//   {
//     reminder_id: {
//       allowNull: false,
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     asset_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "assets",
//         key: "id",
//       },
//     },
//     maintenance_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "maintenance_records",
//         key: "maintenance_id",
//       },
//     },
//     reminder_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     notification_type: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       defaultValue: "PENDING",
//     },
//   },
//   {
//     sequelize,
//     modelName: "Reminder",
//     timestamps: true,
//     tableName: "reminders",
//   }
// );

// export default Reminder;



















import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class Notification extends Model {
  id!: number;
  userId!: number;
  type!: string;
  title!: string;
  body!: string;
  isRead!: boolean;
  linkedEntityId!: string | null;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM("EXPIRY", "MAINTENANCE", "SECURITY", "SYSTEM"),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    linkedEntityId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "ID of the related Asset, Document, or MaintenanceRecord",
    },
  },
  {
    sequelize,
    modelName: "Notification",
    timestamps: true,
    tableName: "notifications",
  }
);

export default Notification;
