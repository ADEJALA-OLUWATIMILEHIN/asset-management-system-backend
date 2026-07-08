import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class SystemSettings extends Model {
  id!: number;
  orgId!: string;
  companyName!: string;
  logoUrl!: string | null;
  defaultLanguage!: string;
  defaultCurrency!: string;
  timezone!: string;
  systemVersion!: string | null;
  buildNumber!: string | null;
  activeLicenses!: number;
  maxLicenses!: number;
  storageUsedGb!: number;
  twoFaRequired!: boolean;
}

SystemSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    orgId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "e.g. ALMS-ORG-99812",
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "SVG, PNG, or JPG — max 2MB",
    },
    defaultLanguage: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "en-US",
    },
    defaultCurrency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "NGN",
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "America/New_York",
    },
    systemVersion: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. 4.2.0-stable",
    },
    buildNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "e.g. 88219",
    },
    activeLicenses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxLicenses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 150,
    },
    storageUsedGb: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
      defaultValue: 0,
    },
    twoFaRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "SystemSettings",
    timestamps: true,
    tableName: "system_settings",
  }
);

export default SystemSettings;
