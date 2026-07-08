const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

console.log("DATABASE_USER:", process.env.DATABASE_USER);
console.log("DATABASE_PASSWORD:", process.env.DATABASE_PASSWORD);
console.log("DATABASE_HOST:", process.env.DATABASE_HOST);
console.log("DATABASE_NAME:", process.env.DATABASE_NAME);
console.log("DATABASE_PORT:", process.env.DATABASE_PORT);

module.exports = {
  "development": {
    "username": process.env.DATABASE_USER,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres",
    "port": process.env.DATABASE_PORT || 5432
  },
  "test": {
    "username": process.env.DATABASE_USER,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME_TEST,
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}