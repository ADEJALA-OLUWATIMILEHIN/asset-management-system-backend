// import { DataTypes, Model } from "sequelize";
// import sequelize from "../config/sequelize";

// class MaintenanceRecord extends Model {
//   maintenance_id!: number;
//   asset_id!: number;
//   maintenance_type!: "SERVICE" | "REPAIR" | "INSPECTION";
//   title!: string;
//   description!: string;
//   technician!: string;
//   vendor_id!: number | null;
//   cost!: number;
//   status!: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
//   next_due_date!: Date | null;
//   created_by!: number;
//   created_at!: Date;
// }

// MaintenanceRecord.init(
//   {
//     maintenance_id: {
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
//     maintenance_type: {
//       type: DataTypes.ENUM("SERVICE", "REPAIR", "INSPECTION"),
//       allowNull: false,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     technician: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     vendor_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },
//     cost: {
//       type: DataTypes.DECIMAL(12, 2),
//       allowNull: false,
//       defaultValue: 0,
//     },
//     status: {
//       type: DataTypes.ENUM("PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
//       allowNull: false,
//       defaultValue: "PENDING",
//     },
//     next_due_date: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     created_by: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "users",
//         key: "id",
//       },
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     sequelize,
//     modelName: "MaintenanceRecord",
//     timestamps: true,
//     tableName: "maintenance_records",
//   }
// );

// export default MaintenanceRecord;






















































import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class MaintenanceRecord extends Model {
  id!: number;
  assetId!: number;
  maintenanceType!: string;
  vendorId!: number | null;
  cost!: number | null;
  lastServiceDate!: Date | null;
  nextServiceDate!: Date | null;
  status!: "SCHEDULED" | "PENDING" | "OVERDUE" | "COMPLETED";
  notes!: string | null;
  createdBy!: number;
}

MaintenanceRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "assets",
        key: "id",
      },
    },
    maintenanceType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. Hardware Calibration, Preventive Inspection, Oil & Filter Exchange",
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "staff",
        key: "id",
      },
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    lastServiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextServiceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("SCHEDULED", "PENDING", "OVERDUE", "COMPLETED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "MaintenanceRecord",
    timestamps: true,
    tableName: "maintenance_records",
  }
);

export default MaintenanceRecord;
