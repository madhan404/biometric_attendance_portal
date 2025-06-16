const { DataTypes } = require("sequelize");
const Sequelize = require("../config/db");

const DeviceLogs = Sequelize.define(
  "devicelogs",
  {
    DeviceLogId: {
      type: DataTypes.MEDIUMINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    DownloadDate: {
      type: DataTypes.STRING(19),
      allowNull: true
    },
    DeviceId: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    UserId: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    LogDate: {
      type: DataTypes.STRING(19),
      allowNull: true
    },
    Direction: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    AttDirection: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    C1: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    C2: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    C3: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    C4: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    C5: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    C6: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    C7: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    WorkCode: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    UpdateFlag: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    EmployeeImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    FileName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Longitude: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Latitude: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    IsApproved: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    CreatedDate: {
      type: DataTypes.STRING(19),
      allowNull: true
    },
    LastModifiedDate: {
      type: DataTypes.STRING(19),
      allowNull: true
    },
    LocationAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    BodyTemperature: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: true
    },
    IsMaskOn: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    HrappSync: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    DataPushTime: {
      type: DataTypes.STRING(19),
      allowNull: true
    },
    FailureReason: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: "devicelogs",
    timestamps: false
  }
);

module.exports = DeviceLogs;
