const express = require('express');
const { Op } = require('sequelize');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const User = require('../models/User');
const DeviceLog = require('../models/Log');
const Devicelogs_8_2024 = require('../models/Devicelog');
const auth = require('../middleware/authMiddleware');
const router = express.Router();
// const Leaverequest = require('../models/Leave'); 
const { User, LeaveRequest } = require("../models");
const sequelize = require('sequelize');
const app = express();
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3001' }));
//"pdf_path":"/Users/chandru/Downloads/Assignment 2.pdf"


// Function to calculate present hours for a specific date
function calculatePresentHoursForDate(logs, targetDate) {
  const formattedDate = moment(targetDate).format("YYYY-MM-DD");

  // Filter logs for the given date using LogDate
  let filteredLogs = logs.filter(log => 
      moment(log.LogDate).format("YYYY-MM-DD") === formattedDate
  );

  // Sort logs by LogDate (ascending order)
  filteredLogs.sort((a, b) => moment(a.LogDate) - moment(b.LogDate));

  let totalDuration = 0;
  let lastInLog = null;

  // Calculate total present hours
  filteredLogs.forEach(log => {
      if (log.C1 === "in") {
          lastInLog = log;
      } else if (log.C1 === "out" && lastInLog) {
          const inTime = moment(lastInLog.LogDate, "YYYY-MM-DD HH:mm:ss");
          const outTime = moment(log.LogDate, "YYYY-MM-DD HH:mm:ss");
          totalDuration += outTime.diff(inTime, "hours", true);
          lastInLog = null; // Reset after pairing
      }
  });

  return totalDuration.toFixed(2);
}

// Function to calculate present hours for yesterday
function getYesterdayPresentHours(logs) {
  let yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
  return calculatePresentHoursForDate(logs, yesterday);
}



router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Request Body:", req.body);


  try {
    // Fetch the user based on email and include the 'id' field
    // const user = await User.findOne({
    //   where: { email },
    //   include: [{
    //     model: Leaverequest,
    //     required: false, // Avoids error if no leave requests exist
    //   }],
    //   attributes: ["id", "email", "password", "role", "sin_number", "student_name"], 
    // });

    const user = await User.findOne({
      where: { email },
      include: [{ model: LeaveRequest,required:false }], // Ensure the association is included
    attributes:["id","email","password","role","sin_number", "student_name","department","address","year","phone","gender","photo"]
    
    });
  console.log(user.year);  // Check if department exists here
    

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log();
      
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Process roles, handling cases where user.role might be JSON or an object
    // let roles;
    // if (typeof user.role === "string") {
    //   try {
    //     roles = JSON.parse(user.role).roles;
    //   } catch (err) {
    //     console.error("Error parsing role JSON:", err);
    //     return res.status(500).json({ message: "Role format error" });
    //   }
    // } else if (user.role && Array.isArray(user.role.roles)) {
    //   roles = user.role.roles;
    // } else {
    //   roles = []; //idhu default for empty array if role data is missing or in an vera maari format
    // }


    // Process roles, handling cases where user.role might be JSON or an object
let roles;
if (typeof user.role === "string") {
  try {
    const parsedRole = JSON.parse(user.role);  // ✅ Convert JSON string to object
    roles = parsedRole.roles;  // ✅ Extract roles array
  } catch (err) {
    console.error("Error parsing role JSON:", err);
    return res.status(500).json({ message: "Role format error" });
  }
} else if (user.role && Array.isArray(user.role.roles)) {
  roles = user.role.roles;
} else {
  roles = []; // Default to an empty array if the role data is missing
}


// Fetch device logs
const logs = await Devicelogs_8_2024.findAll({
  where: { UserId: user.sin_number },
  order: [["LogDate", "ASC"]],
});

// Calculate today's present hours
const targetDate = "2024-08-01";
let presenthours = calculatePresentHoursForDate(logs, targetDate);
// let presenthours = calculatePresentHoursForDate(logs, moment());

// Calculate yesterday’s present hours
let yesterdayPresentHours = getYesterdayPresentHours(logs);



    // // Calculate present hours from DeviceLog entries for the user
    // let presenthours = 0;
    // // const logs = await DeviceLog.findAll({
    // const logs = await Devicelogs_8_2024.findAll({
    //   // where: { sin_number: user.sin_number }, 
    //   // order: [["log_date", "ASC"]],
    //   where:{ UserId : user.sin_number},
    //   order:[["C1","ASC"]],
    // });

    // let lastInLog = null;
    // logs.forEach(log => {
    //   // if (log.log_status === 'in') {
    //   if(log.C1 === 'in'){
    //     lastInLog = log;
    //   // } else if (log.log_status === 'out' && lastInLog) {
    //   } else if (log.C1 === 'out' && lastInLog){
    //     // const inTime = moment(lastInLog.log_date, 'YYYY-MM-DD HH:mm:ss');
    //     // const outTime = moment(log.log_date, 'YYYY-MM-DD HH:mm:ss');

    //     const inTime = moment(lastInLog.LogDate, 'YYYY-MM-DD HH:mm:ss');
    //     const outTime = moment(log.LogDate, 'YYYY-MM-DD HH:mm:ss');
    //     const diffInHours = outTime.diff(inTime, 'hours', true);
    //     presenthours += diffInHours;
    //     lastInLog = null;
    //   }
    // });

    // Fetch leave requests for specific roles 
    let leaveRequests = [];
    if (roles.includes("class_advisor") || roles.includes("student") || roles.includes("hod") || roles.includes("principal") ) {
      // leaveRequests = await LeaveRequest.findAll({
      leaveRequests =await LeaveRequest.findOne({
        // where: { status: 'submitted' },
        where:{sin_number : user.sin_number},
        include: [{ model: User, as: 'user', attributes: ['student_name', 'sin_number'] }],
      });
    }

    
    const responseData = {
      status: 200,
      message: "Login successful",
      sin_number: user.sin_number,
      student_name: user.student_name,
      gender : user.gender,
      email: user.email,
      address:user.address,
      year:user.year,
      role: roles,
      department:user.department,
      phone:user.phone,
      photo:user.photo,
      presenthours: presenthours + " hours",
      yesterdayPresentHours: yesterdayPresentHours + " hours",
      leaveRequests: leaveRequests,
    };

    res.json({
      status: 200,
      message: "Login successful",
      user: responseData,
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
