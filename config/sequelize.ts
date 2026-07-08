import path from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });

const shouldUseSsl = process.env.DATABASE_SSL === "true" || process.env.NODE_ENV === "production";
const sslConfig = shouldUseSsl
  ? {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }
  : {};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      ...sslConfig,
    })
  : new Sequelize(process.env.DATABASE_NAME!, process.env.DATABASE_USER!, process.env.DATABASE_PASSWORD, {
      host: process.env.DATABASE_HOST ?? "localhost",
      port: Number(process.env.DATABASE_PORT ?? 5432),
      dialect: "postgres",
    });

export default sequelize;
