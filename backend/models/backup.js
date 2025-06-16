const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");


const Backup = sequelize.define("backup", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  backup_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Backup data from user table'
  },
  leave_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Backup data from LeaveRequests table'
  },
  devicelog_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Backup data from devicelogs table'
  },
  holiday_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Backup data from holidays table'
  },
  backup_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  backup_status: {
    type: DataTypes.ENUM('success', 'failed'),
    defaultValue: 'success'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_records: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      users: 0,
      leaves: 0,
      devicelogs: 0,
      holidays: 0
    }
  }
}, {
  tableName: "backups",
  timestamps: true
});

// Sync the model with the database
Backup.sync({ alter: true }).then(() => {
  console.log('Backup table synced successfully');
}).catch(err => {
  console.error('Error syncing Backup table:', err);
});

module.exports = Backup;
