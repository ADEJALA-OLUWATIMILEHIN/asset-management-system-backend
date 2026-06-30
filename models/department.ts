import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class Department extends Model {
  id!: number;
  name!: string;
  branchLocation!: string | null;
  managerId!: number | null;
}

Department.init(
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
    },
    branch_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Department",
    timestamps: true,
    tableName: "departments",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Department;
