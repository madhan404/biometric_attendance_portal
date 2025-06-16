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
    validate: {
      notNull: {
        msg: 'Sin number cannot be null'
      }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address:{
    type:DataTypes.STRING,
    allowNull:true,
  },
  class_advisor:{
    type:DataTypes.STRING,
    allowNull: true
  },
  mentor:{
    type:DataTypes.STRING,
    allowNull:true
  },
  year: DataTypes.STRING,
  department: DataTypes.STRING,
  college: DataTypes.STRING,
  dayScholar_or_hosteller: DataTypes.STRING,
  quota: DataTypes.STRING,
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  position_1:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  position_2:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deleted_at: {
    type: DataTypes.DATE
  },
  phone: DataTypes.STRING,
  parent_phone: DataTypes.STRING,
  // photo: DataTypes.TEXT,
  photo: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },

  batch: DataTypes.STRING(45),
}, {
  tableName: "user",
  timestamps: false,
  paranoid: true
});

module.exports = User;
