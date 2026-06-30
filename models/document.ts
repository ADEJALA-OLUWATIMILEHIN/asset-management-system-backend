
// import { Sequelize, DataTypes, Model } from "sequelize";
// import sequelize from "../config/sequelize";

// class Document extends Model {
//     id!: number;
//     assetId!: number;
//     documentType!: string;
//     fileUrl!: string;
//     issueDate!: Date;
//     expiryDate!: Date;
// }

// Document.init(
//     {
//         // Model attributes are defined
//    id: {
//      allowNull:false,
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   assetId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//         model: "assets",
//         key: "id"
//         }
//   },
//   documentType: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   fileUrl: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   issueDate: {
//     type: DataTypes.DATE,
//     allowNull: false
//   },
//   expiryDate: {
//     type: DataTypes.DATE,
//     allowNull: false
//   }
//     },
//   {
//     // Other model options go here
//     sequelize, // We need to pass the connection instance
//       modelName: "Document", // We need to choose the model name
//       timestamps: true,
//      tableName: "documents",      // 👈 MUST MATCH DB
//   }
// );

// export default Document;


import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class Document extends Model {
  id!: number;
  name!: string;
  fileUrl!: string;
  fileSizeBytes!: number | null;
  mimeType!: string | null;
  docType!: string;
  linkedAssetId!: number | null;
  expiryDate!: Date | null;
  status!: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PERMANENT";
  isVerified!: boolean;
  uploadedBy!: number;
}

Document.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "e.g. Insurance_Policy_2024.pdf",
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    docType: {
      type: DataTypes.ENUM(
        "VEHICLE_INSURANCE",
        "MAINTENANCE_AGREEMENT",
        "COMPLIANCE_CERT",
        "REAL_ESTATE_LEASE",
        "PURCHASE_ORDER"
      ),
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
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Null for PERMANENT documents",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRING_SOON", "EXPIRED", "PERMANENT"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    uploadedBy: {
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
    modelName: "Document",
    timestamps: true,
    tableName: "documents",
  }
);

export default Document;