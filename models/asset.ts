
// import { Sequelize, DataTypes, Model } from "sequelize";
// import sequelize from "../config/sequelize";

// class Asset extends Model {
//     asset_code!: string;
//     asset_name!: string;
//     asset_class!: string;
//     department!: string;
//     branch!: string;
//     assigned_to!: string;
//     id!: number;
//     asset_tag!: string;
//     category!: string;
//     serial_number!: string;
//     manufacturing_date!: Date;
//     purchase_date!: Date;
//     status!: "ACTIVE" | "EXPIRED" | "EXPIRING" | "MAINTENANCE";

// }

// Asset.init(
//     {
//         // Model attributes are defined
//    id: {
//      allowNull:false,
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//     asset_name: { 
//     type: DataTypes.STRING,
//     allowNull: false
//     },
//     asset_code: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     asset_class: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     department: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     branch: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     assigned_to: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     asset_tag: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     category: {
//     type: DataTypes.STRING, 
//     allowNull: false,
//     },
//     serial_number: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     manufacturing_date: {
//     type: DataTypes.DATE,
//     allowNull: false,
//     },
//     purchase_date: {
//     type: DataTypes.DATE,
//     allowNull: false,
//     },
//     status: {
//     type: DataTypes.ENUM("ACTIVE", "EXPIRED", "EXPIRING", "MAINTENANCE"),
//     allowNull: false,
//     defaultValue: "ACTIVE"
//     },
//   },
//   {
//     // Other model options go here
//     sequelize, // We need to pass the connection instance
//       modelName: "Asset", // We need to choose the model name
//       timestamps: true,
//      tableName: "assets",      // 👈 MUST MATCH DB
//   }
// );

// export default Asset;





import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class Asset extends Model {
  id!: number;
  assetCode!: string;
  name!: string;
  category!: string;
  status!: "ACTIVE" | "EXPIRED" | "EXPIRING_SOON" | "DECOMMISSIONED" | "PENDING_APPROVAL";
  manufacturer!: string | null;
  modelYear!: number | null;
  color!: string | null;
  serialNumber!: string | null;
  purchaseDate!: Date | null;
  purchasePrice!: number | null;
  warrantyExpiry!: Date | null;
  vendorId!: number | null;
  custodianId!: number | null;
  location!: string | null;
  departmentId!: number | null;
  condition!: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | null;
  conditionScore!: number | null;
  insurancePolicyId!: number | null;
  valuation!: number | null;
  lastScannedAt!: Date | null;
  imageUrls!: string[] | null;
  mapCoordinates!: object | null;
  riskLevel!: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
}

Asset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    assetCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "Human-readable ID e.g. VHC-2023-001",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "VEHICLES",
        "EQUIPMENT",
        "REAL_ESTATE",
        "IT_INFRASTRUCTURE",
        "HEAVY_MACHINERY",
        "CORPORATE_FLEET"
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "EXPIRED",
        "EXPIRING_SOON",
        "DECOMMISSIONED",
        "PENDING_APPROVAL"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    modelYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    warrantyExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "staff",
        key: "id",
      },
    },
    custodianId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "departments",
        key: "id",
      },
    },
    condition: {
      type: DataTypes.ENUM("EXCELLENT", "GOOD", "FAIR", "POOR"),
      allowNull: true,
    },
    conditionScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "0–100 health percentage",
    },
    insurancePolicyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "documents",
        key: "id",
      },
    },
    valuation: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    lastScannedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    imageUrls: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    mapCoordinates: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "{ lat: number, lng: number }",
    },
    riskLevel: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Asset",
    timestamps: true,
    tableName: "assets",
  }
);

export default Asset;