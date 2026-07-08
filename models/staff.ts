import { Sequelize, DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class Staff extends Model {
    id!: number;
    fullName!: string;
    email!: string;
    department!: string;
    phone!: string;
    userId!: number | null;
}

Staff.init(
    {   // ← fields object opens
        id: {
            allowNull: false,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id"
            }
        }
    },  // ← fields object closes  ✅ (was missing)
    {   // ← options object opens
        sequelize,
        modelName: "Staff",
        timestamps: true,
        tableName: "staff",
    }   // ← options object closes
);  // ← removed the extra }  ✅



export default Staff;
