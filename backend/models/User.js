const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    primaryKey: true,
  },
  sin_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  student_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  email: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  father_name: DataTypes.STRING,
  year: DataTypes.STRING,
  department: DataTypes.STRING,
  college: DataTypes.STRING,
  dayScholar_or_hosteller: DataTypes.STRING,
  quota: DataTypes.STRING,
  role: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  phone: DataTypes.STRING,
  photo: DataTypes.TEXT,
  batch: DataTypes.STRING(45),
}, {
  tableName: "user",
  timestamps: false,
});

module.exports = User;
