const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');  // Add this import

const active_today = sequelize.define('active_today', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  sin_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  login_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  login_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'active_today'
});

// Add the association
active_today.belongsTo(User, {
    foreignKey: 'sin_number',
    targetKey: 'sin_number',
    as: 'user'  // This alias matches the include statement in your query
});

module.exports = active_today;
