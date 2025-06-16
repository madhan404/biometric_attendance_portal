const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SemesterDetails = sequelize.define("semester_details", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  semester_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  semester_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  total_semester_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: "semester_details",
  timestamps: true,
  underscored: true
});

module.exports = SemesterDetails; 