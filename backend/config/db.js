const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const caCert = fs.readFileSync(path.resolve(__dirname, 'aiven-ca.crt'));

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,   // make sure this is set to Aiven port (18960)
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        ca: caCert,
        rejectUnauthorized: true  // keeps strong SSL validation
      }
    }
  }
);

module.exports = sequelize;
