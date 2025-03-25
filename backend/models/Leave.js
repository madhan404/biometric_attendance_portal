const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define(
  "LeaveRequest",
  {
    request_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sin_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: { args: /^e\d{2}[a-z]{2}\d{3}$/i, msg: "use clg sin_number" },
      },
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
      type:DataTypes.TEXT,
      allowNull:false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        startDateBeforeEndDate() {
          if (this.startDate >= this.endDate) {
            throw new Error("Start date must be earlier than end date");
          }
        },
      },
    },
    pdf_path: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
      get() {
        const data = this.getDataValue("pdf_path");
        return data ? data.toString("base64") : null; // Convert BLOB to base64 for debugging
    },
    },
    class_advisor_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    hod_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    principal_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    placement_officer_approval: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
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
