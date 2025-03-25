

const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");
const DeviceLog = Sequelize.define(
  "devicelog",
  {
    devicelog_id: {
      type: DataTypes.MEDIUMINT,
      allowNull: true,
      primaryKey:true
    },
    download_date: {
      type: DataTypes.STRING(19),
      allowNull: true,
    },
    device_id: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    sin_number: {
      
      type : DataTypes.STRING(33),
      allowNull: false,
    },
    log_date: {
      type: DataTypes.STRING(19),
      allowNull: true,
    },
    log_status:{
      type: DataTypes.ENUM('in', 'out'),
      allowNull:true,
    },
  },
  {
    tableName:"devicelog",
    timestamps: false,
  }
);

module.exports = DeviceLog;