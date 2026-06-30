
// import { Sequelize, DataTypes, Model } from "sequelize";
// import sequelize from "../config/sequelize";

// class User extends Model {
//     id!: number;
//     email!: string;
//     password!: string;
//     name! :string;
//     role!: "SUPERADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
//     status!: "ACTIVE" | "PENDING" | "INACTIVE"
// }

// User.init(
//     {
//         // Model attributes are defined
//    id: {
//      allowNull:false,
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//     name: { 
//     type: DataTypes.STRING,
//     allowNull: false
//     },
//     email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true
//     },
//     password: {
//     type: DataTypes.STRING,
//     allowNull: false
//     },  
//     role: {
//     type: DataTypes.ENUM("SUPERADMIN", "ADMIN", "MANAGER","VIEWER"),
//     allowNull: false
//     },
//     status: {
//     type: DataTypes.ENUM("ACTIVE","PENDING", "INACTIVE"),
//     defaultValue: "ACTIVE"
//     },
//     created_at: {
//             type: DataTypes.DATE,
//             allowNull: false,
//             defaultValue: DataTypes.NOW,
//         },
//     updated_at: {
//          type: DataTypes.DATE,
//          allowNull: false,
//            defaultValue: DataTypes.NOW,
//         },
//         last_login: {
//             type: DataTypes.DATE,
//             allowNull: true,
//         }
//     },
//   {
//     // Other model options go here
//     sequelize, // We need to pass the connection instance
//       modelName: "User", // We need to choose the model name
//       timestamps: true,
//      tableName: "users",      // 👈 MUST MATCH DB
//   }
// );

// export default User;














import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class User extends Model {
  id!: number;
  name!: string;
  email!: string;
  avatarUrl!: string | null;
  initials!: string;
  role!: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
  departmentId!: number | null;
  status!: "ACTIVE" | "PENDING" | "DEACTIVATED";
  twoFaEnabled!: boolean;
  securityClearance!: string | null;
  lastLoginAt!: Date | null;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "avatar_url",
    },
    initials: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "MANAGER", "VIEWER"),
      allowNull: false,
      defaultValue: "VIEWER",
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "department_id",
      references: {
        model: "departments",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "PENDING", "DEACTIVATED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    two_fa_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "two_fa_enabled",
    },
    security_clearance: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "security_clearance",
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login_at",
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    tableName: "users",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
