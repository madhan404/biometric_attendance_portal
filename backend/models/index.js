const sequelize = require("../config/db");
const User = require("./User");
const LeaveRequest = require("./Leave");
const SemesterDetails = require("./semester_details");

// Define Associations Here
User.hasMany(LeaveRequest, { foreignKey: "sin_number", sourceKey: "sin_number" });
LeaveRequest.belongsTo(User, { foreignKey: "sin_number", targetKey: "sin_number", as: "user" });

module.exports = { sequelize, User, LeaveRequest, SemesterDetails };
