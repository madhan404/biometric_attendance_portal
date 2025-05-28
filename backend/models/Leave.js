const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define(
  "LeaveRequest",
  {
    serial_no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    request_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sin_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    student_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    staff_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hod_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    request_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reason_Details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    time_slot: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pdf_path: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
      get() {
        const data = this.getDataValue("pdf_path");
        return data ? data.toString("base64") : null;
      },
    },
    
    // Approval status fields
    mentor_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    mentor_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mentor_approver_sin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mentor_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    class_advisor_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    class_advisor_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    class_advisor_approver_sin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    class_advisor_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    hod_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    hod_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hod_approver_sin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hod_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    placement_officer_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    placement_officer_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    placement_officer_approver_sin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    placement_officer_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    principal_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    principal_approver_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    principal_approver_sin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    principal_approval_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    status: {
      type: DataTypes.ENUM("submitted", "approved", "rejected"),
      allowNull: false,
      defaultValue: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = LeaveRequest;