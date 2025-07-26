const express = require('express');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const devicelogs = require('../models/Devicelog');

const router = express.Router();
const { User, LeaveRequest } = require("../models");

const app = express();
const cors = require('cors');
const Admin = require('../models/active_today');
app.use(cors({ origin: 'http://localhost:3001' }));

// Function to calculate present hours for a specific date
function calculatePresentHoursForDate(logs, targetDate) {
  const formattedDate = moment(targetDate).format("YYYY-MM-DD");

  let filteredLogs = logs.filter(log => 
      moment(log.LogDate).format("YYYY-MM-DD") === formattedDate
  );

  filteredLogs.sort((a, b) => moment(a.LogDate) - moment(b.LogDate));

  let totalDuration = 0;
  let lastInLog = null;

  filteredLogs.forEach(log => {
      if (log.C1 === "in") {
          lastInLog = log;
      } else if (log.C1 === "out" && lastInLog) {
          const inTime = moment(lastInLog.LogDate, "YYYY-MM-DD HH:mm:ss");
          const outTime = moment(log.LogDate, "YYYY-MM-DD HH:mm:ss");
          totalDuration += outTime.diff(inTime, "hours", true);
          lastInLog = null;
      }
  });

  return totalDuration.toFixed(2);
}

function getYesterdayPresentHours(logs) {
  let yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
  return calculatePresentHoursForDate(logs, yesterday);
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Request Body:", req.body);

  try {
    // First find the user to get their details
    const user = await User.findOne({
      where: { email, is_deleted: false },
      include: [{ model: LeaveRequest, required: false }],
      attributes: [
        "id", "email", "password", "role", "sin_number", "name", 
        "department", "address", "year", "phone", "gender", "photo",
        "class_advisor", "mentor", "college", "dayScholar_or_hosteller",
        "quota", "position_1", "position_2","parent_phone", "batch"
      ]
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create admin log entry with the user's sin_number and role
    const loginLog = await Admin.create({
      sin_number: user.sin_number,  // Use the user's sin_number
      role: user.role,              // Use the user's role
      login_date: moment().format('YYYY-MM-DD'),
      login_time: moment().format('HH:mm:ss')
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id , email: user.email, role: user.role, sin_number: user.sin_number},
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const logs = await devicelogs.findAll({
      where: { UserId: user.sin_number },
      order: [["LogDate", "ASC"]],
    });

    const targetDate = "2024-08-01";
    let presenthours = calculatePresentHoursForDate(logs, targetDate);
    let yesterdayPresentHours = getYesterdayPresentHours(logs);

    let leaveRequests = [];
    if (["mentor", "class_advisor", "student", "hod", "principal"].includes(user.role)) {
      leaveRequests = await LeaveRequest.findAll({
        where: { sin_number: user.sin_number },
        include: [{ model: User, as: 'user', attributes: ['name', 'sin_number'] }],
      });
    }

    const responseData = {
      status: 200,
      message: "Login successful",
      token,
      // loginLog: {
      //   date: loginLog.login_date,
      //   time: loginLog.login_time
      // },
      sin_number: user.sin_number,
      name: user.name,
      gender: user.gender,
      email: user.email,
      address: user.address,
      year: user.year,
      role: user.role,
      department: user.department,
      phone: user.phone,
      photo: user.photo,
      class_advisor: user.class_advisor,
      mentor: user.mentor,
      college: user.college,
      dayScholar_or_hosteller: user.dayScholar_or_hosteller,
      // quota: user.quota,
      position_1: user.position_1,
      position_2: user.position_2,
      parent_phone: user.parent_phone,
      batch: user.batch,
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
