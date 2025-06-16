const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SystemConfig = sequelize.define("system_config", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  min_attendance_percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  grace_period: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  auto_lockout: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "system_config",
  timestamps: true,
  underscored: true
});

module.exports = SystemConfig;