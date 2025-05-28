const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  day: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  holiday_reason: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'holidays',
  timestamps: false
});

module.exports = Holiday;
