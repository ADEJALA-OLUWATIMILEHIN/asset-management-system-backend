
import { Sequelize, DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";

class ReportMaintenanceRecord extends Model {
    report_id!: number;
    report_name!: string;
    maintenance_id!: number; 
    report_type!: string
    generated_by!: number;
    generated_at!: Date;
    snapshot_status!: string;
    snapshot_cost!: number;
    snapshot_technician!: string;

}

ReportMaintenanceRecord.init(
    {
        // Model attributes are defined
   report_id: {
    allowNull:false,
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  report_name:
   { 
    type: DataTypes.STRING,
    allowNull: false
    },
   report_type: {
    type: DataTypes.STRING,
    allowNull: false
    },
   generated_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: "Users",
        key: "id"
    }
    },
   generated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
    },
    date_from: {
    type: DataTypes.DATE,
    allowNull: false
    },
    date_to: {
    type: DataTypes.DATE,
     allowNull :false
    },                  
   }, // ← fields object closes  ✅ (was missing)
        {   // ← options object opens
            sequelize,
            modelName: "ReportMaintenanceRecord",
            timestamps: true,
            tableName: "report_maintenance_records",
        }   // ← options object closes
    );  // ← removed the extra }  ✅
    
  

export default ReportMaintenanceRecord;

